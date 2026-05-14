'use server'

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/services/audit.service";
import crypto from "crypto";
import { StaffRole } from "@/generated/client";
import { EmailService } from "@/services/email.service";

export async function staffLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rememberMe = formData.get('rememberMe') === 'true';
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: "Authentication failed." };
  }

  // Find the user and their primary membership
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: data.user.id },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { tenant: true },
        take: 1
      }
    }
  });

  if (!dbUser || dbUser.memberships.length === 0) {
    // Check if there's a pending invitation
    const pendingInvite = await prisma.staffInvitation.findFirst({
      where: { 
        email: email,
        status: 'PENDING'
      }
    });

    if (pendingInvite) {
      return { 
        success: false, 
        error: "Your invitation is pending. Please accept the invitation from your email first." 
      };
    }

    return { 
      success: false, 
      error: "You are not registered as a staff member for any clinic. Please contact your administrator." 
    };
  }

  const primaryMembership = dbUser.memberships[0];

  await AuditService.logAudit({
    action: 'STAFF_LOGIN_SUCCESS',
    entityType: 'USER',
    entityId: dbUser.id,
    tenantId: primaryMembership.tenantId,
    metadata: { 
      email: data.user.email,
      role: primaryMembership.role
    }
  });

  revalidatePath('/', 'layout');

  // Smart Redirect System based on Membership Role
  switch (primaryMembership.role) {
    case 'OWNER':
    case 'ADMIN':
    case 'MANAGER':
      redirect('/dashboard');
    case 'DOCTOR':
      redirect('/dashboard/appointments');
    case 'ACCOUNTANT':
      redirect('/dashboard/finance');
    default:
      redirect('/dashboard');
  }
}

export async function resendVerificationEmail(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createClient();
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}


export async function validateInviteToken(tokenHash: string) {
  if (!tokenHash) return { valid: false };

  const invite = await prisma.staffInvitation.findUnique({
    where: { tokenHash },
    include: { tenant: true }
  });

  if (!invite) return { valid: false, error: "Invitation not found." };
  if (invite.status !== 'PENDING') return { valid: false, error: `Invitation already ${invite.status.toLowerCase()}.` };
  if (invite.expiresAt < new Date()) return { valid: false, error: "Invitation expired." };

  return { 
    valid: true, 
    email: invite.email,
    fullName: invite.fullName,
    role: invite.role,
    clinicName: invite.tenant.name
  };
}

export async function acceptStaffInvitation(formData: FormData) {
  const rawToken = formData.get('token') as string;
  const password = formData.get('password') as string;

  if (!rawToken) return { success: false, error: "Invitation token is required." };

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const validation = await validateInviteToken(tokenHash);
  if (!validation.valid) return { success: false, error: validation.error };

  const invite = await prisma.staffInvitation.findUnique({
    where: { tokenHash },
    include: { tenant: true }
  });

  if (!invite) return { success: false, error: "Invitation not found." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. Sign up or Link User in Supabase
  const { data, error } = await supabase.auth.signUp({
    email: invite.email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: { full_name: invite.fullName }
    }
  });

  if (error) return { success: false, error: error.message };
  if (!data.user) return { success: false, error: "Signup failed." };

  // 2. Create local User and Membership inside a transaction
  await prisma.$transaction(async (tx) => {
    // Create or find User
    const user = await tx.user.upsert({
      where: { email: invite.email },
      update: { supabaseId: data.user!.id },
      create: {
        supabaseId: data.user!.id,
        email: invite.email
      }
    });

    // Create Tenant Membership
    await tx.tenantMembership.create({
      data: {
        userId: user.id,
        tenantId: invite.tenantId,
        role: invite.role,
        status: 'ACTIVE'
      }
    });

    // Update Invitation Status
    await tx.staffInvitation.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    });

    // Optionally create Staff profile
    await tx.staff.create({
      data: {
        name: invite.fullName,
        email: invite.email,
        role: invite.role,
        tenantId: invite.tenantId,
        status: 'Online'
      }
    });
  });

  revalidatePath('/', 'layout');
  redirect('/staff/sign-in?success=invitation-accepted');
}

// Aliases for frontend consistency
export const login = staffLogin;
export const signupWithInvite = acceptStaffInvitation;

export async function createStaffInvitation(formData: FormData, tenantId: string) {
  const email = formData.get('email') as string;
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as StaffRole;
  const jobTitle = formData.get('jobTitle') as string;

  const supabase = await createClient();
  const { data: { user: invitedByUser } } = await supabase.auth.getUser();

  if (!invitedByUser) throw new Error("Unauthorized");

  // Generate secure token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  // Set expiration (e.g., 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Check for existing pending invitation
  const existingInvite = await prisma.staffInvitation.findFirst({
    where: { 
      tenantId, 
      email, 
      status: 'PENDING' 
    }
  });

  if (existingInvite) {
    return { success: false, error: "A pending invitation already exists for this email." };
  }

  // Create invitation record
  const invitation = await prisma.staffInvitation.create({
    data: {
      tenantId,
      email,
      fullName,
      role,
      jobTitle,
      tokenHash,
      invitedById: (await prisma.user.findUnique({ where: { supabaseId: invitedByUser.id } }))!.id,
      expiresAt,
    }
  });

  // Log Audit
  await AuditService.logAudit({
    action: 'STAFF_INVITATION_CREATED',
    entityType: 'STAFF_INVITATION',
    entityId: invitation.id,
    tenantId,
    metadata: { email, role }
  });

  // Send invitation email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const inviteUrl = `${siteUrl}/staff/accept-invitation?token=${rawToken}`;
  
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  
  await EmailService.sendStaffInvitation({
    email,
    fullName,
    clinicName: tenant?.name || "Your Clinic",
    inviteUrl
  });

  revalidatePath('/dashboard/staff');
  return { success: true, invitationId: invitation.id };
}

'use server'

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/services/audit.service";

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // We can't log to DB here easily if we don't have a tenantId yet,
    // but we can try to find the tenant by email if possible.
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: "Authentication failed." };
  }

  // Get user role for smart redirect
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: data.user.id },
    select: { id: true, role: true, tenantId: true }
  });

  if (dbUser) {
    await AuditService.logAudit({
      action: 'USER_LOGIN_SUCCESS',
      entityType: 'USER',
      entityId: dbUser.id,
      metadata: { email: data.user.email }
    });
  }

  revalidatePath('/', 'layout');

  if (!dbUser) {
    redirect('/dashboard');
  }

  // Smart Redirect System
  switch (dbUser.role) {
    case 'OWNER':
    case 'ADMIN':
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


export async function validateInviteToken(token: string) {
  if (!token) return { valid: false };

  const staff = await prisma.staff.findUnique({
    where: { inviteToken: token },
    select: {
      email: true,
      inviteAccepted: true,
      inviteExpiresAt: true
    }
  });

  if (!staff) return { valid: false, error: "Invitation not found." };
  if (staff.inviteAccepted) return { valid: false, error: "Invitation already used." };
  if (staff.inviteExpiresAt && staff.inviteExpiresAt < new Date()) return { valid: false, error: "Invitation expired." };

  return { valid: true, email: staff.email };
}

export async function signupWithInvite(formData: FormData) {
  const token = formData.get('token') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!token) return { success: false, error: "Invitation token is required." };

  // Validate token again on submission
  const validation = await validateInviteToken(token);
  if (!validation.valid) return { success: false, error: validation.error };

  const supabase = await createClient();

  // Use the production URL from env, fallback to localhost for dev
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Sign up in Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        email_confirm: true // In a real app, you'd want email confirmation
      }
    }
  });

  if (error) return { success: false, error: error.message };
  if (!data.user) return { success: false, error: "Signup failed." };

  const staff = await prisma.staff.findUnique({
    where: { inviteToken: token }
  });

  if (!staff) return { success: false, error: "Critical error: Staff record lost." };

  // Create local User record
  await prisma.user.create({
    data: {
      supabaseId: data.user.id,
      email: data.user.email!,
      tenant: { connect: { id: staff.tenantId } },
      staff: { connect: { id: staff.id } }
    }
  });

  // Update Staff status
  await prisma.staff.update({
    where: { id: staff.id },
    data: {
      inviteAccepted: true,
      inviteToken: null,
      status: 'Online'
    }
  });

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

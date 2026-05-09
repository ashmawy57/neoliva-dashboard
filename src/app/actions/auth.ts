'use server'

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
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
      tenantId: staff.tenantId,
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

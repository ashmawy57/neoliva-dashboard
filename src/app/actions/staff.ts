'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function getStaff() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching staff:', error)
    return []
  }

  const getInitials = (name: string) => {
    const parts = name?.split(' ') || [];
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name?.[0] || 'S').toUpperCase();
  }

  const colors = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600'
  ];

  return data.map((member: any, index: number) => {
    const colorIndex = index % colors.length;
    
    const formatRole = (roleStr: string) => {
      if (!roleStr) return 'Receptionist';
      return roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
    };

    return {
      id: member.id,
      name: member.name || 'Unknown',
      role: formatRole(member.role),
      title: member.title || 'Staff',
      phone: member.phone || '—',
      email: member.email || '—',
      avatar: getInitials(member.name),
      color: colors[colorIndex],
      status: member.status || 'Offline'
    }
  })
}

export async function createStaff(formData: { name: string; role: string; title: string; email: string; phone: string; invite: boolean }) {
  const supabase = await createClient();
  
  const dbRole = formData.role.toUpperCase();
  
  const { data, error } = await supabase
    .from('staff')
    .insert({
      id: crypto.randomUUID(),
      display_id: `STF-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      role: dbRole as any,
      title: formData.title,
      email: formData.email,
      phone: formData.phone,
      status: 'Online'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating staff:', error);
    throw new Error('Failed to create staff member');
  }

  revalidatePath('/staff');
  return data;
}

export async function updateStaff(id: string, updates: Partial<{ name: string; role: string; title: string; email: string; phone: string; status: string }>) {
  const supabase = await createClient();
  
  const formattedUpdates: any = { ...updates };
  if (formattedUpdates.role) {
    formattedUpdates.role = formattedUpdates.role.toUpperCase();
  }
  
  formattedUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('staff')
    .update(formattedUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating staff:', error);
    throw new Error('Failed to update staff member');
  }

  revalidatePath('/staff');
  return data;
}

export async function deleteStaff(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting staff:', error);
    throw new Error('Failed to delete staff member');
  }

  revalidatePath('/staff');
  return true;
}


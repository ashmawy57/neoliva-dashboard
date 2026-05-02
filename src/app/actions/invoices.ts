'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function getInvoices() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      patients (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P'
  }

  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-red-500',
    'from-emerald-500 to-teal-500'
  ];

  return data.map((invoice: any, index: number) => {
    const patientName = invoice.patients?.name || 'Unknown Patient';
    const colorIndex = index % colors.length;

    return {
      id: invoice.id,
      displayId: invoice.display_id,
      patient: patientName,
      patientId: invoice.patient_id,
      date: new Date(invoice.created_at).toLocaleDateString(),
      dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—',
      status: invoice.status,
      amount: invoice.amount || 0,
      method: invoice.method || '—',
      treatment: invoice.treatment || '—',
      avatar: getInitials(patientName),
      color: colors[colorIndex]
    }
  })
}

export async function createInvoice(formData: { 
  patientId: string; 
  amount: number; 
  status?: any; 
  dueDate?: string; 
  method?: string;
  treatment?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      id: crypto.randomUUID(),
      display_id: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      patient_id: formData.patientId,
      amount: formData.amount,
      status: formData.status || 'Pending',
      due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      method: formData.method,
      treatment: formData.treatment
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }

  revalidatePath('/billing');
  return data;
}

export async function updateInvoice(id: string, updates: any) {
  const supabase = await createClient();
  
  const formattedUpdates: any = { ...updates };
  if (formattedUpdates.displayId) {
    formattedUpdates.display_id = formattedUpdates.displayId;
    delete formattedUpdates.displayId;
  }
  if (formattedUpdates.patientId) {
    formattedUpdates.patient_id = formattedUpdates.patientId;
    delete formattedUpdates.patientId;
  }
  if (formattedUpdates.dueDate) {
    formattedUpdates.due_date = formattedUpdates.dueDate;
    delete formattedUpdates.dueDate;
  }
  
  formattedUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('invoices')
    .update(formattedUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating invoice:', error);
    throw new Error('Failed to update invoice');
  }

  revalidatePath('/billing');
  return data;
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw new Error('Failed to delete invoice');
  }

  revalidatePath('/billing');
  return true;
}


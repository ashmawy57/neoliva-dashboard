'use server'

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

export async function getExpenses() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }

  return data.map((expense: any) => ({
    id: expense.id,
    date: new Date(expense.date || expense.created_at).toLocaleDateString(),
    category: expense.category || 'General',
    description: expense.description || 'No description',
    amount: expense.amount || 0,
    status: expense.status || 'Paid',
    notes: expense.notes
  }))
}

export async function createExpense(formData: { description: string; amount: number; date: string; category: string; notes?: string; status?: string }) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      id: crypto.randomUUID(),
      description: formData.description,
      amount: formData.amount,
      date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
      category: formData.category,
      status: formData.status || 'Paid',
      notes: formData.notes
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating expense:', error);
    throw new Error('Failed to create expense');
  }

  revalidatePath('/expenses');
  return data;
}

export async function updateExpense(id: string, updates: Partial<{ description: string; amount: number; date: string; category: string; status: string; notes: string }>) {
  const supabase = await createClient();
  
  const formattedUpdates: any = { ...updates };
  if (formattedUpdates.date) {
    formattedUpdates.date = new Date(formattedUpdates.date).toISOString();
  }

  const { data, error } = await supabase
    .from('expenses')
    .update(formattedUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    throw new Error('Failed to update expense');
  }

  revalidatePath('/expenses');
  return data;
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw new Error('Failed to delete expense');
  }

  revalidatePath('/expenses');
  return true;
}


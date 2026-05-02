'use server'

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

export async function getInventory() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching inventory:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    category: item.category || 'Uncategorized',
    quantity: item.quantity,
    minLevel: item.min_level,
    unit: item.unit || 'Units'
  }))
}

export async function createInventoryItem(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const quantityStr = formData.get('quantity') as string
  const minLevelStr = formData.get('minLevel') as string
  const unit = formData.get('unit') as string

  if (!name || !category || !quantityStr || !minLevelStr || !unit) {
    return { error: 'Missing required fields' }
  }

  const quantity = parseInt(quantityStr, 10)
  const minLevel = parseInt(minLevelStr, 10)

  const id = crypto.randomUUID()

  const { error } = await supabase
    .from('inventory')
    .insert({
      id,
      name,
      category,
      quantity,
      min_level: minLevel,
      unit
    })

  if (error) {
    console.error('Error creating inventory item:', error)
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true }
}

export async function updateInventoryItem(id: string, data: any) {
  const supabase = await createClient()
  
  const formattedData: any = { ...data };
  if (formattedData.minLevel !== undefined) {
    formattedData.min_level = formattedData.minLevel;
    delete formattedData.minLevel;
  }
  
  formattedData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('inventory')
    .update(formattedData)
    .eq('id', id)

  if (error) {
    console.error('Error updating inventory item:', error)
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true }
}

export async function deleteInventoryItem(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting inventory item:', error)
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true }
}


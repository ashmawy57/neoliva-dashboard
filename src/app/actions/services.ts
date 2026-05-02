'use server'

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

export async function getServices() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data.map((service: any) => ({
    id: service.id,
    name: service.name,
    price: service.price,
    duration: service.duration,
    description: service.description || '',
    category: service.category || 'General',
    // Fallback icons based on category
    icon: service.category === 'Preventive' ? '🪥' 
      : service.category === 'Restorative' ? '🦷'
      : service.category === 'Cosmetic' ? '✨'
      : service.category === 'Surgical' ? '🔩'
      : service.category === 'Orthodontics' ? '📋'
      : '⚕️',
    popular: service.popular || false
  }))
}

export async function createService(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const priceStr = formData.get('price') as string
  const durationStr = formData.get('duration') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string

  if (!name || !priceStr || !durationStr || !category) {
    return { error: 'Missing required fields' }
  }

  const price = parseFloat(priceStr)
  const duration = parseInt(durationStr, 10)

  const id = crypto.randomUUID()

  const { error } = await supabase
    .from('services')
    .insert({
      id,
      name,
      price,
      duration,
      description,
      category,
      popular: false
    })

  if (error) {
    console.error('Error creating service:', error)
    return { error: error.message }
  }

  revalidatePath('/services')
  return { success: true }
}

export async function updateService(id: string, data: any) {
  const supabase = await createClient()
  
  const formattedData = {
    ...data,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('services')
    .update(formattedData)
    .eq('id', id)

  if (error) {
    console.error('Error updating service:', error)
    return { error: error.message }
  }

  revalidatePath('/services')
  return { success: true }
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting service:', error)
    return { error: error.message }
  }

  revalidatePath('/services')
  return { success: true }
}


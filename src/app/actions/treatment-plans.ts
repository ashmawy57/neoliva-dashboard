'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTreatmentPlans(patientId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('treatment_plans')
    .select(`
      *,
      treatment_plan_items (*)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching treatment plans:', error)
    return []
  }

  // Format and map for UI
  return data.map((plan: any) => {
    // Sort items by step
    const phases = (plan.treatment_plan_items || [])
      .sort((a: any, b: any) => (a.step || 0) - (b.step || 0))
      .map((item: any) => ({
        id: item.id,
        step: item.step || 1,
        name: item.service_name,
        status: item.status || 'Planned',
        date: item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'TBD',
        price: `$${Number(item.price).toLocaleString()}`,
        notes: item.notes || ''
      }));

    // Calculate progress and cost
    const completed = phases.filter((p: any) => p.status === 'Completed').length;
    const progress = phases.length > 0 ? Math.round((completed / phases.length) * 100) : 0;
    
    const cost = phases.reduce((sum: number, p: any) => {
      const num = parseFloat(p.price.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

    return {
      id: plan.id,
      title: plan.title,
      status: plan.status || 'Active',
      progress,
      cost: `$${cost.toLocaleString()}`,
      created: new Date(plan.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      notes: plan.notes || '',
      phases
    }
  });
}

export async function createTreatmentPlan(patientId: string, planData: any) {
  const supabase = await createClient()
  
  // 1. Insert plan
  const { data: plan, error: planError } = await supabase
    .from('treatment_plans')
    .insert({
      patient_id: patientId,
      title: planData.title,
      status: planData.status || 'Active',
      notes: planData.notes || ''
    })
    .select()
    .single()

  if (planError) {
    console.error('Error creating plan:', planError)
    return { success: false, error: planError.message }
  }

  // 2. Insert items
  if (planData.phases && planData.phases.length > 0) {
    const items = planData.phases.map((ph: any, i: number) => {
      let dateStr = null;
      if (ph.date && ph.date !== 'TBD') {
        const d = new Date(ph.date);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        }
      }
      return {
        plan_id: plan.id,
        service_name: ph.name,
        step: i + 1,
        status: ph.status || 'Planned',
        price: parseFloat(ph.price.replace(/[^0-9.]/g, "")) || 0,
        scheduled_date: dateStr,
        notes: ph.notes || ''
      }
    });

    const { error: itemsError } = await supabase
      .from('treatment_plan_items')
      .insert(items)

    if (itemsError) {
      console.error('Error adding plan items:', itemsError)
    }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true, data: plan }
}

export async function deleteTreatmentPlan(planId: string, patientId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('treatment_plans')
    .delete()
    .eq('id', planId)

  if (error) {
    console.error('Error deleting plan:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function updatePlanStatus(planId: string, status: string, patientId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('treatment_plans')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', planId)

  if (error) {
    console.error('Error updating plan status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function addTreatmentPhase(planId: string, phaseData: any, step: number, patientId: string) {
  const supabase = await createClient()
  
  let dateStr = null;
  if (phaseData.date && phaseData.date !== 'TBD') {
    const d = new Date(phaseData.date);
    if (!isNaN(d.getTime())) {
      dateStr = d.toISOString().split('T')[0];
    }
  }

  const { error } = await supabase
    .from('treatment_plan_items')
    .insert({
      plan_id: planId,
      service_name: phaseData.name,
      step: step,
      status: phaseData.status || 'Planned',
      price: parseFloat(phaseData.price.replace(/[^0-9.]/g, "")) || 0,
      scheduled_date: dateStr,
      notes: phaseData.notes || ''
    })

  if (error) {
    console.error('Error adding phase:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function updatePhaseStatus(phaseId: string, status: string, patientId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('treatment_plan_items')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', phaseId)

  if (error) {
    console.error('Error updating phase status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function deleteTreatmentPhase(phaseId: string, patientId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('treatment_plan_items')
    .delete()
    .eq('id', phaseId)

  if (error) {
    console.error('Error deleting phase:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

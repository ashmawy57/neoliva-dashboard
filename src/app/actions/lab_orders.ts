'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from 'crypto'

export async function getLabOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lab_orders")
    .select(`
      *,
      patients (
        name
      )
    `);

  if (error) {
    console.error("Error fetching lab orders:", error);
    return [];
  }

  // Map to match frontend expected structure
  return data.map((order: any) => ({
    id: order.id,
    displayId: order.display_id || order.id,
    patient: order.patients?.name || "Unknown Patient",
    patientId: order.patient_id,
    item: order.item_description,
    labName: order.lab_name,
    dateSent: new Date(order.send_date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    dateDue: order.expected_return_date ? new Date(order.expected_return_date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "N/A",
    status: order.status,
    cost: order.cost,
    notes: order.notes
  }));
}

export async function createLabOrder(formData: {
  patientId: string;
  labName: string;
  itemDescription: string;
  sendDate?: string;
  expectedReturnDate?: string;
  cost?: number;
  status?: any;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lab_orders")
    .insert({
      id: crypto.randomUUID(),
      display_id: `LAB-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_id: formData.patientId,
      lab_name: formData.labName,
      item_description: formData.itemDescription,
      send_date: formData.sendDate ? new Date(formData.sendDate).toISOString() : new Date().toISOString(),
      expected_return_date: formData.expectedReturnDate ? new Date(formData.expectedReturnDate).toISOString() : null,
      cost: formData.cost || 0,
      status: formData.status || 'Sent',
      notes: formData.notes
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating lab order:", error);
    throw new Error("Failed to create lab order");
  }

  revalidatePath('/lab-orders');
  return data;
}

export async function updateLabOrder(id: string, updates: any) {
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
  if (formattedUpdates.labName) {
    formattedUpdates.lab_name = formattedUpdates.labName;
    delete formattedUpdates.labName;
  }
  if (formattedUpdates.itemDescription) {
    formattedUpdates.item_description = formattedUpdates.itemDescription;
    delete formattedUpdates.itemDescription;
  }
  if (formattedUpdates.sendDate) {
    formattedUpdates.send_date = formattedUpdates.sendDate;
    delete formattedUpdates.sendDate;
  }
  if (formattedUpdates.expectedReturnDate) {
    formattedUpdates.expected_return_date = formattedUpdates.expectedReturnDate;
    delete formattedUpdates.expectedReturnDate;
  }
  
  formattedUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("lab_orders")
    .update(formattedUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating lab order:", error);
    throw new Error("Failed to update lab order");
  }

  revalidatePath('/lab-orders');
  return data;
}

export async function deleteLabOrder(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("lab_orders")
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting lab order:", error);
    throw new Error("Failed to delete lab order");
  }

  revalidatePath('/lab-orders');
  return true;
}


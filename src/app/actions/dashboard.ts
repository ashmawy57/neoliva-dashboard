'use server'

import { createClient } from "@/lib/supabase/server";


export async function getDashboardData() {
  const supabase = await createClient();

  // Fetch low inventory items count
  const { data: inventoryData } = await supabase
    .from("inventory")
    .select("quantity, min_level");
  
  const lowInventoryCount = inventoryData?.filter(item => item.quantity <= item.min_level).length || 0;

  // Fetch pending payments (invoices)
  const { data: invoiceData } = await supabase
    .from("invoices")
    .select("amount, status");
  
  const pendingPayments = invoiceData?.filter(inv => inv.status !== "Paid").reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
  const overdueCount = invoiceData?.filter(inv => inv.status === "Overdue").length || 0;

  // Fetch appointments for today
  const today = new Date().toISOString().split('T')[0];
  const { data: appointmentsData } = await supabase
    .from("appointments")
    .select(`
      *,
      patients (
        name
      )
    `)
    .eq("date", today);

  const todaysAppointmentsCount = appointmentsData?.length || 0;
  const completedAppointmentsCount = appointmentsData?.filter(a => a.status === "Completed").length || 0;
  const pendingAppointmentsCount = appointmentsData?.filter(a => 
    a.status === "Waiting" || a.status === "Scheduled" || a.status === "In Progress"
  ).length || 0;

  // Map to recent patients for queue
  const recentPatients = appointmentsData?.map(a => {
    const name = a.patients?.name || "Unknown Patient";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials = parts.length > 1 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
      : parts.length === 1 ? parts[0].substring(0, 2).toUpperCase() : "??";
      
    return {
      id: a.patient_id, // Include the patient ID for linking
      name,
      time: a.time,
      treatment: a.treatment || "Checkup",
      status: a.status,
      avatar: initials,
      color: a.status === "In Progress" ? "from-blue-500 to-indigo-600" : "from-blue-500 to-cyan-500",
    };
  }) || [];

  return {
    lowInventoryCount,
    pendingPayments,
    overdueCount,
    todaysAppointmentsCount,
    completedAppointmentsCount,
    pendingAppointmentsCount,
    recentPatients,
  };
}


'use server'
/**
 * billing-summary.ts — Session-scoped billing Server Actions
 *
 * These actions use the new lib/repository pattern (BaseRepository) which
 * auto-resolves tenantId from the active session.
 *
 * The primary billing actions (createInvoice, recordPayment, getInvoices,
 * deleteInvoice, etc.) continue to live in src/app/actions/billing.ts which
 * uses the BillingService + BillingRepository(explicit-tenantId) pattern.
 *
 * Use these actions where you need the lightweight, session-auto-scoped API.
 */
import { withPermission } from '@/lib/rbac/guard'
import { billingRepository } from '@/lib/repository/billing.repository'

/**
 * Fetch all invoices, optionally filtered by status and/or patientId.
 */
export async function getInvoicesList(filters?: { status?: string; patientId?: string }) {
  return withPermission('billing', 'read', async () => {
    return billingRepository.findAllInvoices(filters)
  })
}

/**
 * Fetch a single invoice by ID.
 */
export async function getInvoiceById(id: string) {
  return withPermission('billing', 'read', async () => {
    return billingRepository.findInvoiceById(id)
  })
}

/**
 * Create a new invoice with line items.
 * tenantId is injected automatically from the session.
 */
export async function createNewInvoice(data: {
  patientId:      string
  appointmentId?: string
  dueDate?:       Date
  notes?:         string
  items: {
    description: string
    quantity:    number
    unitPrice:   number
    discount?:   number
    serviceId?:  string
  }[]
}) {
  return withPermission('billing', 'create', async () => {
    return billingRepository.createInvoice(data)
  })
}

/**
 * Record a payment against an invoice.
 * Updates invoice status (PENDING → PARTIAL → PAID) atomically.
 */
export async function recordInvoicePayment(data: {
  invoiceId:  string
  amount:     number
  method:     string
  reference?: string
  notes?:     string
}) {
  return withPermission('billing', 'create', async () => {
    return billingRepository.recordPayment(data)
  })
}

/**
 * Return a financial summary for the current month.
 */
export async function getFinancialSummary() {
  return withPermission('billing', 'read', async () => {
    return billingRepository.getFinancialSummary()
  })
}

/**
 * Cancel an invoice (sets status to CANCELLED).
 */
export async function cancelInvoice(id: string) {
  return withPermission('billing', 'update', async () => {
    return billingRepository.cancelInvoice(id)
  })
}

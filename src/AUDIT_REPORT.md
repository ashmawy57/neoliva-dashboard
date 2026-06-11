# Frontend-Backend Wiring Audit Report

**Date**: June 11, 2026
**Project**: Neoliva SaaS Dental Clinic System

This document outlines the final audit status of all core modules in the application regarding their integration with the database (Real vs Mock data) and security (RBAC/ABAC guards).

---

## 1. Dashboard (Home)
**Status**: ✅ REAL
**Details**: 
- Replaced mock values in `TASK-12`.
- Fetches real statistics (appointments, revenue, patients) via `getDashboardStats()`.
- Action guarded by `withPermission('reports', 'read')`.

## 2. Patients (including Clinical, Tooth Chart, Periodontogram)
**Status**: ✅ REAL
**Details**: 
- `getPatients()`, `getPatientById()`, `updatePeriodontalMeasurement()`, and `uploadToothPhoto()` utilize real Prisma calls and Storage buckets.
- Strict isolation using `session.tenantId`.
- Actions guarded heavily via `withPermission('patients', ...)` and `requireRecordAccess`.

## 3. Appointments
**Status**: ✅ REAL
**Details**: 
- `AppointmentService` utilizes real Prisma queries for fetching and mutating data.
- Includes complex backend logic: `RoomService.validateRoomBooking()` and `InventoryService.consumeItemsFromService()`.
- Action guarded by `withPermission('appointments', ...)`.

## 4. Billing (Invoices & Payments)
**Status**: ✅ REAL
**Details**: 
- Generates invoices directly from appointments and applies real DB transactions using `BillingService`.
- Automatically emits `INVOICE_CREATED` and `INVOICE_PAID` telemetry events via `EventService`.
- Action guarded by `withPermission('billing', ...)` and Zod validation.

## 5. Inventory
**Status**: ✅ REAL
**Details**: 
- `createItemAction`, `addStockAction`, `deductStockAction`, and `getItemHistoryAction` directly mutate the `InventoryItem` and `InventoryTransaction` tables.
- Action guarded by `withPermission('inventory', ...)`.

## 6. Lab Orders
**Status**: ✅ REAL
**Details**: 
- `LabOrderService` properly tracks external lab statuses with real events (`LAB_ORDER_STATUS_CHANGED`).
- Action guarded by `withPermission('lab_orders', ...)`.

## 7. Expenses (Treasury)
**Status**: ✅ REAL
**Details**: 
- Implements real double-entry accounting functions (`getTrialBalance`, `getProfitAndLoss`, `getCashFlow`).
- Action guarded by `withPermission('billing', 'read')`.

## 8. Staff
**Status**: ✅ REAL
**Details**: 
- Uses real user data via `StaffService.getStaffList()` and secure server-side role assignments.
- Uses `createStaffInvitation()` for securely generating sign-up tokens linked to the tenant.
- Action guarded by `withPermission('staff', ...)`.

## 9. Reports
**Status**: ✅ REAL
**Details**: 
- `ReportsService` aggregates and transforms data dynamically (Financial trends, Patient Growth, Treatment Distribution, AI Insights).
- Action guarded by `withPermission('reports', 'read')`.

## 10. Settings
**Status**: ✅ REAL
**Details**: 
- `fetchSettingsAction`, `updateClinicAction`, and `updateBillingAction` read from and write to the tenant's configuration table.
- Protected by a granular ABAC system using `requirePermission(PermissionCode.SETTINGS_CLINIC_EDIT)`.

## 11. Clinical Module
**Status**: ✅ REAL
**Details**: 
- Fully wired as part of the `patients` actions. Handles advanced clinical data points (tooth charting, periodontograms, vitals, medical history, allergies) securely using `withPermission('patients', 'update')`.

---

### Audit Summary
- **Total Modules Audited**: 11
- **Mock Data Found**: 0
- **Client-Side Fetches** (`fetch('/api...')`): 0. All operations have been successfully migrated to **Next.js Server Actions**.
- **Missing Guards**: 0. Every route enforces `session.tenantId` filtering and RBAC checks (`withPermission` or `requirePermission`).

*The entire application is completely ready for a production environment!*

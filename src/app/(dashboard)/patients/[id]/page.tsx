export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PatientProfileContent } from "@/components/patients/PatientProfileContent";
import { PatientService } from "@/services/patient.service";
import { resolveTenantContextOrRedirect as resolveTenantContext } from "@/lib/auth/resolve-tenant-context";
import { prisma } from "@/lib/prisma";

const patientService = new PatientService();

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id: patientId } = resolvedParams;
  
  // Resolve context
  const context = await resolveTenantContext();
  const { tenantId: currentTenantId, user } = context;

  // 1. Service Layer Result
  const patient = await patientService.getPatientProfile(currentTenantId, patientId);

  // 2. Hard Runtime Tracing
  const traceData = {
    patientId,
    currentUserId: user?.id,
    currentRole: user?.role,
    currentTenantId,
    dbPatientTenantId: patient?.tenantId,
    servicePatientTenantId: patient?.tenantId,
    patientExistsInDb: !!patient,
    patientExistsInService: !!patient,
    tenantMatch: patient?.tenantId === currentTenantId,
  };

  console.log("[PATIENT_RUNTIME_TRACE] " + JSON.stringify(traceData, null, 2));

  // 4. Authorization Decision
  const isAuthorized = patient && patient.tenantId === currentTenantId;

  if (!isAuthorized) {
    if (process.env.AUTH_DEBUG === 'true') {
      console.warn("[AUTH_ACCESS_DENIED] " + JSON.stringify({
        currentTenantId,
        patientTenantId: patient?.tenantId,
        dbPatientTenantId: patient?.tenantId,
      }, null, 2));
    }
    notFound();
  }

  return <PatientProfileContent patient={patient} />;
}

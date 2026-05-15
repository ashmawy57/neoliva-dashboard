export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PatientProfileContent } from "@/components/patients/PatientProfileContent";
import { PatientService } from "@/services/patient.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

const patientService = new PatientService();

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id: patientId } = resolvedParams;
  
  // Resolve context
  const context = await resolveTenantContext();
  const { tenantId: currentTenantId, user } = context;

  // 1. Direct Database Truth (Bypassing Service/Repository)
  const dbPatient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      tenantId: true,
      name: true,
    }
  });

  // 2. Service Layer Result
  const patient = await patientService.getPatientProfile(currentTenantId, patientId);

  // 3. Hard Runtime Tracing
  const traceData = {
    patientId,
    currentUserId: user?.id,
    currentRole: user?.role,
    currentTenantId,
    dbPatientTenantId: dbPatient?.tenantId,
    servicePatientTenantId: patient?.tenantId,
    patientExistsInDb: !!dbPatient,
    patientExistsInService: !!patient,
    tenantMatch: dbPatient?.tenantId === currentTenantId,
  };

  console.log("[PATIENT_RUNTIME_TRACE] " + JSON.stringify(traceData, null, 2));

  // 4. Authorization Decision
  const isAuthorized = patient && patient.tenantId === currentTenantId;

  if (!isAuthorized) {
    if (process.env.AUTH_DEBUG === 'true') {
      console.warn("[AUTH_ACCESS_DENIED] " + JSON.stringify({
        currentTenantId,
        patientTenantId: patient?.tenantId,
        dbPatientTenantId: dbPatient?.tenantId,
      }, null, 2));
    }
    notFound();
  }

  return <PatientProfileContent patient={patient} />;
}

export const dynamic = "force-dynamic";

import { Stethoscope, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PatientProfileContent } from "@/components/patients/PatientProfileContent";
import { PatientService } from "@/services/patient.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { notFound } from "next/navigation";

const patientService = new PatientService();

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { tenantId } = await resolveTenantContext();
  const patient = await patientService.getPatientProfile(tenantId, resolvedParams.id);

  if (!patient || patient.tenantId !== tenantId) {
    notFound();
  }

  return <PatientProfileContent patient={patient} />;
}

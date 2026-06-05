export const dynamic = "force-dynamic";

import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { PatientsTable } from "@/components/patients/PatientsTable";
import { PatientService } from "@/services/patient.service";
import { resolveTenantContextOrRedirect as resolveTenantContext } from "@/lib/auth/resolve-tenant-context";

const patientService = new PatientService();

const PATIENTS_PER_PAGE = 15;

interface PatientsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const { tenantId } = await resolveTenantContext();

  // Await the searchParams Promise (Next.js 15+ async searchParams)
  const params  = await searchParams;
  const page    = Math.max(1, parseInt(params.page   ?? "1",  10) || 1);
  const search  = (params.search ?? "").trim();

  const { patients, total, totalPages } = await patientService.getPatientsPaginated(
    tenantId,
    { page, limit: PATIENTS_PER_PAGE, search }
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium text-gray-700">{total}</span> registered patients
          </p>
        </div>
        <AddPatientDialog />
      </div>

      <PatientsTable
        initialPatients={patients}
        total={total}
        totalPages={totalPages}
        currentPage={page}
        currentSearch={search}
      />
    </div>
  );
}

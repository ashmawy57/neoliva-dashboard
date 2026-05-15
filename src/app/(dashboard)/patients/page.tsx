export const dynamic = "force-dynamic";

import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { PatientsTable } from "@/components/patients/PatientsTable";
import { PatientService } from "@/services/patient.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const patientService = new PatientService();

export default async function PatientsPage() {
  const { tenantId } = await resolveTenantContext();
  const patientsData = await patientService.getPatientsList(tenantId);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium text-gray-700">{patientsData.length}</span> registered patients
          </p>
        </div>
        <AddPatientDialog />
      </div>

      <PatientsTable initialPatients={patientsData} />
    </div>
  );
}

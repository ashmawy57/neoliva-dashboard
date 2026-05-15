import { Stethoscope, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PatientProfileContent } from "@/components/patients/PatientProfileContent";
import { PatientService } from "@/services/patient.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const patientService = new PatientService();

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { tenantId } = await resolveTenantContext();
  const patient = await patientService.getPatientProfile(tenantId, resolvedParams.id);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Stethoscope className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Patient Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">No patient exists with ID: {resolvedParams.id}</p>
        <Link href="/patients">
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Patients
          </Button>
        </Link>
      </div>
    );
  }

  return <PatientProfileContent patient={patient} />;
}

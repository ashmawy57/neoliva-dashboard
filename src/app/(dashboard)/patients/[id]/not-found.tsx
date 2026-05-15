import Link from "next/link";
import { Stethoscope, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 shadow-sm rotate-3 hover:rotate-0 transition-transform">
        <Stethoscope className="w-12 h-12 text-slate-300" />
      </div>
      
      <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Patient not found</h2>
      <p className="text-slate-500 max-w-sm mb-10 leading-relaxed">
        The patient you are looking for doesn't exist or you don't have permission to view their profile.
      </p>

      <Link href="/patients">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-14 text-lg font-semibold shadow-xl shadow-blue-100 transition-all active:scale-95 group">
          <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" /> 
          Return to Patients
        </Button>
      </Link>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { FileSearch, Home } from "lucide-react";
import Link from "next/link";

export default function ReportsNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center animate-fade-in">
      <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-6">
        <FileSearch className="w-12 h-12" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        The specific report or analytic view you are looking for does not exist or has been moved.
      </p>

      <Link href="/reports">
        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-lg shadow-blue-200">
          <Home className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
      </Link>
    </div>
  );
}

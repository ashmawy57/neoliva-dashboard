"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Trash2 } from "lucide-react";
import { deletePatient } from "@/app/actions/patients";
import { toast } from "sonner";
import { Can } from "@/components/providers/permission-provider";
import { PermissionCode } from "@/types/permissions";

interface PatientTableProps {
  initialPatients: any[];
}

export function PatientsTable({ initialPatients }: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filtered = initialPatients.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm) ||
      (p.displayId ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete patient ${name}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(id);
    try {
      const result = await deletePatient(id);
      if (result.success) {
        toast.success("Patient deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete patient");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, phone, or ID..."
          className="pl-10 h-10 rounded-xl bg-white border-gray-200 focus-visible:ring-blue-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-0 shadow-sm overflow-hidden mt-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Visit</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Appointment</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Visits</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((patient) => (
                <TableRow key={patient.id} className="table-row-hover group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${patient.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center text-white font-bold text-[10px] shadow-sm`}>
                        {patient.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-400">{patient.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{patient.phone}</TableCell>
                  <TableCell className="text-sm text-gray-500">{patient.lastVisit}</TableCell>
                  <TableCell className="text-sm text-gray-700 font-medium">{patient.nextAppt}</TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold text-gray-700">{patient.visits}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold rounded-full px-2.5 border ${patient.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                    >
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm" className="rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs h-8 px-2">
                          View <ExternalLink className="ml-1.5 w-3 h-3" />
                        </Button>
                      </Link>
                      <Can permission={PermissionCode.PATIENT_DELETE}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(patient.id, patient.name)}
                          disabled={isDeleting === patient.id}
                          className="rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs h-8 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

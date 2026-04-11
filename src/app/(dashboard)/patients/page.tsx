"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, ExternalLink, Users as UsersIcon } from "lucide-react";

import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { patientsData } from "@/lib/patients-data";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = patientsData.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, phone, or ID..."
          className="pl-10 h-10 rounded-xl bg-white border-gray-200 focus-visible:ring-blue-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Visit</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Appointment</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Visits</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((patient) => (
              <TableRow key={patient.id} className="table-row-hover group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${patient.color} flex items-center justify-center text-white font-bold text-[10px] shadow-sm`}>
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
                    className={`text-[11px] font-semibold rounded-full px-2.5 border ${
                      patient.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/patients/${patient.id}`}>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs">
                      View <ExternalLink className="ml-1.5 w-3 h-3" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

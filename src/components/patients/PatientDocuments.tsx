"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileImage, FileText, UploadCloud, Download, Eye, FileSignature } from "lucide-react";

const documents = [
  {
    id: "DOC-001",
    name: "Panoramic X-Ray",
    type: "X-Ray",
    date: "Feb 20, 2024",
    size: "4.2 MB",
    icon: FileImage,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    id: "DOC-002",
    name: "Root Canal Consent",
    type: "Consent Form",
    date: "Mar 15, 2024",
    size: "120 KB",
    icon: FileSignature,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    id: "DOC-003",
    name: "Blood Test Results",
    type: "Lab Report",
    date: "Jan 10, 2024",
    size: "800 KB",
    icon: FileText,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
];

export function PatientDocuments() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Documents & X-Rays</h3>
          <p className="text-sm text-gray-500">Manage patient files, scans, and consent forms.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md">
          <UploadCloud className="w-4 h-4 mr-2" /> Upload File
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="border-0 shadow-sm group hover:shadow-md transition-shadow relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.bg} ${doc.color}`}>
                  <doc.icon className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-[10px] rounded-full text-gray-500 border-gray-200">
                  {doc.type}
                </Badge>
              </div>

              <h4 className="text-base font-bold text-gray-900 leading-tight mb-1">{doc.name}</h4>
              <p className="text-xs text-gray-500 mb-6">{doc.date} · {doc.size}</p>

              <div className="flex gap-2">
                <Button variant="secondary" className="w-full text-xs font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  <Eye className="w-3.5 h-3.5 mr-2" /> View
                </Button>
                <Button variant="outline" size="icon" className="rounded-lg text-gray-400 hover:text-gray-900 shrink-0">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drag and drop zone mock */}
      <div className="mt-8 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:bg-gray-50 hover:border-indigo-300 transition-colors cursor-pointer group">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-gray-900 mb-1">Upload New Document</h4>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Drag and drop your files here or click to browse. Supports JPG, PNG, PDF, and DICOM formats up to 50MB.
        </p>
      </div>
    </div>
  );
}

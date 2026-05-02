"use client";

import { useState, useRef, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileImage, FileText, UploadCloud, Download, Eye, FileSignature, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPatientDocument } from "@/app/actions/patients";
import { createClient } from "@/lib/supabase/client";

export function PatientDocuments({ 
  patientId, 
  initialData = [], 
  onRefresh 
}: { 
  patientId: string, 
  initialData?: any[],
  onRefresh?: () => void
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: "", type: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const handleUpload = async () => {
    if (!newDoc.name || !selectedFile || !patientId) return;
    
    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${patientId}/${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error("Error uploading to storage", uploadError);
        alert("Failed to upload file");
        setIsUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(fileName);

      startTransition(async () => {
        const result = await addPatientDocument(patientId, {
          name: newDoc.name,
          type: newDoc.type || "Document",
          file_url: publicUrlData.publicUrl
        });

        if (result?.success) {
          setOpen(false);
          setNewDoc({ name: "", type: "" });
          setSelectedFile(null);
          onRefresh?.();
        } else {
          console.error("Failed to save document metadata");
          alert("Failed to save metadata");
        }
        setIsUploading(false);
      });
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Documents & X-Rays</h3>
          <p className="text-sm text-gray-500">Manage patient files, scans, and consent forms.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md text-white shadow-sm">
                <UploadCloud className="w-4 h-4 mr-2" /> Upload File
              </Button>
            } 
          />
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Document Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Panoramic Scan 2026" 
                  value={newDoc.name} 
                  onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                  className="rounded-xl bg-gray-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-semibold">Document Type</Label>
                <Input 
                  id="type" 
                  placeholder="e.g. X-Ray, Consent Form, Report" 
                  value={newDoc.type} 
                  onChange={(e) => setNewDoc({...newDoc, type: e.target.value})}
                  className="rounded-xl bg-gray-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select File</Label>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      setSelectedFile(files[0]);
                      if (!newDoc.name) {
                        setNewDoc({ ...newDoc, name: files[0].name.split('.')[0] });
                      }
                    }
                  }}
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                >
                   {selectedFile ? (
                     <div className="flex flex-col items-center justify-center">
                       <FileText className="w-8 h-8 text-indigo-500 mb-2" />
                       <p className="text-sm font-semibold text-gray-900 break-all">{selectedFile.name}</p>
                       <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                     </div>
                   ) : (
                     <p className="text-xs text-gray-500 py-3">Click to browse or drag file here...</p>
                   )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleUpload} disabled={isUploading || isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm">
                {(isUploading || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialData.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100">
            <FileImage className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No documents uploaded yet.</p>
          </div>
        ) : (
          initialData.map((doc: any) => {
            let Icon = FileText;
            let color = "text-indigo-500";
            let bg = "bg-indigo-50";

            const typeStr = doc.type.toLowerCase();
            if (typeStr.includes("x-ray") || typeStr.includes("image") || typeStr.includes("scan")) {
              Icon = FileImage;
              color = "text-blue-500"; bg = "bg-blue-50";
            } else if (typeStr.includes("consent") || typeStr.includes("form")) {
              Icon = FileSignature;
              color = "text-amber-500"; bg = "bg-amber-50";
            } else if (typeStr.includes("report") || typeStr.includes("test")) {
              Icon = FileText;
              color = "text-purple-500"; bg = "bg-purple-50";
            }

            return (
              <Card key={doc.id} className="border-0 shadow-sm group hover:shadow-md transition-shadow relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] rounded-full text-gray-500 border-gray-200">
                      {doc.type}
                    </Badge>
                  </div>

                  <h4 className="text-base font-bold text-gray-900 leading-tight mb-1">{doc.name}</h4>
                  <p className="text-xs text-gray-500 mb-6">
                    {new Date(doc.upload_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </p>

                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      className="w-full text-xs font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      onClick={() => window.open(doc.file_url, "_blank")}
                    >
                      <Eye className="w-3.5 h-3.5 mr-2" /> View
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-lg text-gray-400 hover:text-gray-900 shrink-0" onClick={() => window.open(doc.file_url, "_blank")}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Drag and drop zone mock */}
      <div onClick={() => setOpen(true)} className="mt-8 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:bg-gray-50 hover:border-indigo-300 transition-colors cursor-pointer group">
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

"use client";

import { useState, useRef, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileImage, 
  FileText, 
  UploadCloud, 
  Download, 
  Eye, 
  FileSignature, 
  Loader2, 
  Trash2, 
  MoreVertical,
  Layers,
  FileSearch,
  Scan,
  X
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadDocument, deleteDocument } from "@/app/actions/documents";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: 'xray', label: 'X-Ray / Scans', icon: Scan, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'document', label: 'Documents / Forms', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'other', label: 'Other Files', icon: Layers, color: 'text-gray-500', bg: 'bg-gray-50' },
];

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
  const [newDoc, setNewDoc] = useState({ name: "", category: "document" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const filteredDocs = activeFilter 
    ? initialData.filter(d => (d.category || 'other') === activeFilter)
    : initialData;

  const handleUpload = async () => {
    if (!newDoc.name || !selectedFile || !patientId) {
      toast.error("Please provide a name and select a file");
      return;
    }
    
    setIsUploading(true);
    const toastId = toast.loading("Uploading file...");
    
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${patientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(fileName);

      const result = await uploadDocument(patientId, {
        name: newDoc.name,
        type: selectedFile.type,
        category: newDoc.category,
        fileUrl: publicUrlData.publicUrl
      });

      if (result?.success) {
        toast.success("Document uploaded successfully", { id: toastId });
        setOpen(false);
        setNewDoc({ name: "", category: "document" });
        setSelectedFile(null);
        if (onRefresh) onRefresh();
      } else {
        throw new Error(result.error || "Failed to save metadata");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    const toastId = toast.loading("Deleting document...");
    try {
      const result = await deleteDocument(patientId, docId, fileUrl);
      if (result.success) {
        toast.success("Document deleted", { id: toastId });
        if (onRefresh) onRefresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete document", { id: toastId });
    }
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.id === category) || CATEGORIES[2];
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Patient Records</h3>
          <p className="text-sm text-gray-500">View and manage clinical X-rays, scans, and documents.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 text-white font-bold h-11 px-6 transition-all active:scale-95">
                <UploadCloud className="w-4 h-4 mr-2" /> Upload Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl border-0 shadow-2xl">
              <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-indigo-600" />
                  Upload New Record
                </DialogTitle>
              </DialogHeader>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="doc-name" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Document Name</Label>
                  <Input 
                    id="doc-name" 
                    placeholder="e.g. Panoramic X-Ray May 2026" 
                    value={newDoc.name} 
                    onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                    className="h-11 rounded-xl border-gray-200 bg-gray-50/30 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewDoc({...newDoc, category: cat.id})}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2",
                          newDoc.category === cat.id 
                            ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" 
                            : "border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <cat.icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">{cat.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select File</Label>
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
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
                      selectedFile 
                        ? "border-indigo-300 bg-indigo-50/30" 
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-indigo-200"
                    )}
                  >
                     {selectedFile ? (
                       <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
                         <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                           <FileSearch className="w-6 h-6" />
                         </div>
                         <p className="text-sm font-bold text-gray-900 break-all px-4">{selectedFile.name}</p>
                         <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                         <Button variant="ghost" size="sm" onClick={(e) => {
                           e.stopPropagation();
                           setSelectedFile(null);
                         }} className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-50 h-7 rounded-lg text-xs">
                           <X className="w-3 h-3 mr-1" /> Change
                         </Button>
                       </div>
                     ) : (
                       <div className="space-y-2">
                         <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto text-gray-400">
                           <UploadCloud className="w-6 h-6" />
                         </div>
                         <p className="text-sm font-bold text-gray-700">Click to browse files</p>
                         <p className="text-[10px] text-gray-400 font-medium">Supports Images, PDF, DICOM up to 50MB</p>
                       </div>
                     )}
                  </div>
                </div>
              </div>

              <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100">
                <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-11 px-6 font-semibold text-gray-500">Cancel</Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading || !selectedFile} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <Button 
          variant={activeFilter === null ? 'default' : 'ghost'} 
          onClick={() => setActiveFilter(null)}
          className={cn(
            "rounded-full h-8 px-4 text-xs font-bold transition-all",
            activeFilter === null ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          All Records
        </Button>
        {CATEGORIES.map(cat => (
          <Button 
            key={cat.id}
            variant={activeFilter === cat.id ? 'default' : 'ghost'} 
            onClick={() => setActiveFilter(cat.id)}
            className={cn(
              "rounded-full h-8 px-4 text-xs font-bold transition-all flex items-center gap-2",
              activeFilter === cat.id ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <cat.icon className="w-3 h-3" />
            {cat.label.split(' / ')[0]}
          </Button>
        ))}
      </div>

      {/* Grid View */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
              <FileSearch className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">No records found</h4>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              {activeFilter ? `There are no documents in the ${getCategoryInfo(activeFilter).label} category.` : "This patient doesn't have any uploaded documents yet."}
            </p>
          </div>
        ) : (
          filteredDocs.map((doc: any) => {
            const cat = getCategoryInfo(doc.category);
            const isImage = doc.type.startsWith('image/');
            const isPdf = doc.type === 'application/pdf';

            return (
              <Card key={doc.id} className="group border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                {/* Preview Area */}
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                  {isImage ? (
                    <img 
                      src={doc.fileUrl} 
                      alt={doc.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", cat.bg, cat.color)}>
                      <cat.icon className="w-8 h-8" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2">
                    <Badge className={cn("bg-white/90 backdrop-blur-sm border-0 shadow-sm font-bold text-[9px] uppercase tracking-wider h-5 px-2", cat.color)}>
                      {cat.id}
                    </Badge>
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button 
                      size="sm" 
                      className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold shadow-lg"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      <Eye className="w-4 h-4 mr-2" /> Open
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 leading-snug truncate" title={doc.name}>{doc.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">
                        {new Date(doc.uploadDate || doc.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-900">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl p-1 border-gray-100">
                        <DropdownMenuItem onClick={() => window.open(doc.fileUrl, "_blank")} className="rounded-lg gap-2 cursor-pointer py-2">
                          <Download className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-bold">Download</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(doc.id, doc.fileUrl)} className="rounded-lg gap-2 cursor-pointer py-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs font-bold">Delete Record</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100/50">
                    <FileSearch className="w-3 h-3 shrink-0" />
                    <span className="truncate">{doc.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Stats/Summary Footer (Optional) */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{initialData.length} Total Records</p>
            <p className="text-xs text-gray-500">All data is securely encrypted and isolated.</p>
          </div>
        </div>
        <div className="flex gap-4">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="text-center">
              <p className="text-lg font-black text-gray-800">{initialData.filter(d => (d.category || 'other') === cat.id).length}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{cat.label.split(' ')[0]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use server'

import { withPermission } from "@/lib/rbac/guard";


import { PatientService } from "@/services/patient.service"

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

import { requireRecordAccess } from "@/lib/abac";


const patientService = new PatientService()

export async function uploadDocument(patientId: string, documentData: { 
  name: string; 
  type: string; 
  category: string;
  fileUrl: string 
}) {
  return withPermission('patients', 'create', async (session) => {
    const tenantId = session.tenantId;
    await requireRecordAccess('patient', patientId);
    
      if (!patientId || !documentData.fileUrl) {
        return { success: false, data: undefined, error: 'Missing required data' }
      }
    
      try {
        const data = await patientService.addDocument(tenantId, patientId, {
          name: documentData.name,
          type: documentData.type,
          category: documentData.category,
          fileUrl: documentData.fileUrl,
          uploadDate: new Date()
        })
    
        revalidatePath(`/patients/${patientId}`)
        return { success: true, error: undefined, data }
      } catch (error: any) {
        console.error("Error adding patient document:", error)
        return { success: false, data: undefined, error: error.message }
      }
  });
}

export async function deleteDocument(patientId: string, documentId: string, fileUrl: string) {
  return withPermission('patients', 'delete', async (session) => {
    const tenantId = session.tenantId;
    await requireRecordAccess('patient', patientId);
    
      try {
        const supabase = await createClient()
    
        // Try to remove from storage first
        try {
          // Extract path from URL
          // Example URL: https://xyz.supabase.co/storage/v1/object/public/patient-documents/patientId/filename.ext
          const url = new URL(fileUrl)
          const pathParts = url.pathname.split('/patient-documents/')
          if (pathParts.length > 1) {
            const storagePath = decodeURIComponent(pathParts[1])
            await supabase.storage.from('patient-documents').remove([storagePath])
          }
        } catch (storageErr) {
          console.warn("Could not remove file from storage:", storageErr)
          // Continue to remove from DB anyway
        }
    
        await patientService.deleteDocument(tenantId, documentId)
        
        revalidatePath(`/patients/${patientId}`)
        return { success: true, error: undefined }
      } catch (error: any) {
        console.error("Error deleting document:", error)
        return { success: false, data: undefined, error: error.message }
      }
  });
}

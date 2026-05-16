'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Ban, Loader2 } from "lucide-react";
import { updateTenantStatus } from "@/app/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ClinicActionsProps {
  tenantId: string;
  clinicName: string;
  status: string;
}

export function ClinicActions({ tenantId, clinicName, status }: ClinicActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (newStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'DISABLED') => {
    console.log(`[SUPER_ADMIN][${newStatus.toUpperCase()}_CLICKED] Clinic: ${clinicName} (${tenantId})`);
    
    setIsLoading(newStatus);
    console.log(`[SUPER_ADMIN][ACTION_START] Sending status update to server: ${newStatus}`);

    try {
      console.log(`[SUPER_ADMIN][ACTION_CALLING] Calling updateTenantStatus with ID: ${tenantId}`);
      const result = await updateTenantStatus(tenantId, newStatus);
      console.log(`[SUPER_ADMIN][ACTION_RESULT] Received result from server:`, result);
      
      if (result.success) {
        console.log(`[SUPER_ADMIN][ACTION_SUCCESS] Status successfully changed to ${newStatus}`);
        toast.success(`Clinic ${newStatus.toLowerCase()} successfully`, {
          description: `${clinicName} is now ${newStatus.toLowerCase()}.`
        });
        console.log(`[SUPER_ADMIN][ACTION_REFRESH] Triggering router.refresh()...`);
        router.refresh();
      } else {
        console.error(`[SUPER_ADMIN][ACTION_FAILED] Server returned error: ${result.error || 'Unknown error'}`);
        toast.error(`Failed: ${result.error || 'Action failed'}`, {
          description: "Check server logs for details."
        });
      }
    } catch (error: any) {
      console.error(`[SUPER_ADMIN][ACTION_CRITICAL_EXCEPTION] Caught exception in handleAction:`, error);
      toast.error(`Critical Error`, {
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      console.log(`[SUPER_ADMIN][ACTION_END] Finishing action and clearing loading state.`);
      setIsLoading(null);
    }
  };

  if (status === 'PENDING') {
    return (
      <div className="flex items-center gap-3">
        <Button 
          onClick={() => handleAction('APPROVED')}
          disabled={!!isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
        >
          {isLoading === 'APPROVED' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Approve
        </Button>
        <Button 
          onClick={() => handleAction('REJECTED')}
          disabled={!!isLoading}
          variant="outline" 
          className="text-red-600 border-red-100 hover:bg-red-50 min-w-[120px]"
        >
          {isLoading === 'REJECTED' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
          Reject
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'APPROVED' && (
        <>
          <Button 
            onClick={() => handleAction('SUSPENDED')}
            disabled={!!isLoading}
            variant="outline" 
            size="sm" 
            className="text-amber-700 border-amber-200 hover:bg-amber-50"
          >
            {isLoading === 'SUSPENDED' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
            Suspend
          </Button>
          <Button 
            onClick={() => handleAction('DISABLED')}
            disabled={!!isLoading}
            variant="outline" 
            size="sm" 
            className="text-red-700 border-red-200 hover:bg-red-50"
          >
            {isLoading === 'DISABLED' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
            Disable
          </Button>
        </>
      )}

      {status === 'SUSPENDED' && (
        <>
          <Button 
            onClick={() => handleAction('APPROVED')}
            disabled={!!isLoading}
            variant="outline" 
            size="sm" 
            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          >
            {isLoading === 'APPROVED' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Re-Activate
          </Button>
          <Button 
            onClick={() => handleAction('DISABLED')}
            disabled={!!isLoading}
            variant="outline" 
            size="sm" 
            className="text-red-700 border-red-200 hover:bg-red-50"
          >
            {isLoading === 'DISABLED' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
            Permanent Disable
          </Button>
        </>
      )}

      {status === 'DISABLED' && (
        <Button 
          onClick={() => handleAction('APPROVED')}
          disabled={!!isLoading}
          variant="outline" 
          size="sm" 
          className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
        >
          {isLoading === 'APPROVED' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Re-Enable
        </Button>
      )}
    </div>
  );
}

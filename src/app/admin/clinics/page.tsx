export const dynamic = 'force-dynamic';
import { getAllTenants, updateTenantStatus } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Building2, Users, Calendar, Loader2 } from "lucide-react";

export default async function AdminClinicsPage() {
  const tenants = await getAllTenants();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinic Registrations</h1>
          <p className="text-gray-500">Manage and approve new dental clinic requests</p>
        </div>
      </div>

      <div className="grid gap-6">
        {tenants.map((tenant) => {
          // Pre-binding the actions for reliability
          const approveAction = updateTenantStatus.bind(null, tenant.id, 'APPROVED');
          const rejectAction = updateTenantStatus.bind(null, tenant.id, 'REJECTED');

          return (
            <Card key={tenant.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{tenant.name}</CardTitle>
                    <p className="text-xs text-gray-400 font-mono">ID: {tenant.id}</p>
                  </div>
                </div>
                <Badge 
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tenant.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    tenant.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                  }`}
                >
                  {tenant.status}
                </Badge>
              </CardHeader>
              <CardContent className="bg-white p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Staff Count</p>
                      <p className="text-sm font-semibold">{tenant._count.users} Members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Registered On</p>
                      <p className="text-sm font-semibold">
                        {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-3">
                    {tenant.status === 'PENDING' && (
                      <>
                        <form action={approveAction}>
                          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </form>
                        <form action={rejectAction}>
                          <Button type="submit" variant="outline" className="text-red-600 border-red-100 hover:bg-red-50 min-w-[120px]">
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </form>
                      </>
                    )}
                    {tenant.status !== 'PENDING' && (
                      <p className="text-xs text-gray-400 italic font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Processed
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {tenants.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">No registration requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

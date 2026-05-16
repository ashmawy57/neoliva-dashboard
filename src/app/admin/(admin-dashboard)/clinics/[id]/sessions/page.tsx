
import { getTenantActiveSessions, revokeSession } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Monitor, Smartphone, Globe, Clock, Ban, ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function ClinicSessionsPage({ params }: { params: { id: string } }) {
  const sessions = await getTenantActiveSessions(params.id);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/clinics">
            <Button variant="outline" size="icon" className="rounded-full hover:bg-white shadow-sm border-gray-200">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
              <p className="text-gray-500 text-sm">Real-time persistent session monitoring and security control</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-gray-700">{sessions.length} Active Devices</span>
        </div>
      </div>

      <div className="grid gap-6">
        {sessions.map((session) => {
          const isMobile = session.userAgent?.toLowerCase().includes('mobile') || 
                           session.userAgent?.toLowerCase().includes('android') || 
                           session.userAgent?.toLowerCase().includes('iphone');
          
          return (
            <Card key={session.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Device Icon Block */}
                  <div className={`p-6 flex items-center justify-center ${isMobile ? 'bg-orange-50' : 'bg-blue-50'} transition-colors group-hover:bg-opacity-80`}>
                    {isMobile ? (
                      <Smartphone className={`w-8 h-8 ${isMobile ? 'text-orange-600' : 'text-blue-600'}`} />
                    ) : (
                      <Monitor className={`w-8 h-8 ${isMobile ? 'text-orange-600' : 'text-blue-600'}`} />
                    )}
                  </div>

                  {/* Info Block */}
                  <div className="flex-1 p-6 grid md:grid-cols-3 gap-6 items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 truncate max-w-[200px]">
                          {isMobile ? 'Mobile Device' : 'Desktop Browser'}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-2 bg-slate-50 border-slate-200">
                          Persistent
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {session.ipAddress || 'Unknown IP'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Last Activity</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(session.lastUsedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-end">
                      <form action={async () => {
                        'use server';
                        await revokeSession(session.id);
                      }}>
                        <Button 
                          type="submit" 
                          variant="outline" 
                          className="text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 transition-all rounded-lg group-hover:bg-red-600 group-hover:text-white"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Revoke Access
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Technical Metadata Bar */}
                <div className="bg-slate-50/50 px-6 py-2 border-t border-gray-50 flex items-center justify-between">
                  <p className="text-[10px] text-gray-400 truncate max-w-[500px]">
                    <span className="font-bold uppercase mr-2">User Agent:</span>
                    {session.userAgent}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    <span className="font-bold uppercase mr-2">Session ID:</span>
                    {session.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {sessions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No active sessions</h3>
            <p className="text-gray-400 max-w-xs mx-auto">There are currently no persistent sessions active for this clinic.</p>
          </div>
        )}
      </div>
    </div>
  );
}

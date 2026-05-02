"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, UserPen, Shield, Mail, Phone, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NewStaffDialog } from "@/components/staff/NewStaffDialog";
import { getStaff } from "@/app/actions/staff";

const roleConfig: Record<string, { bg: string; text: string; icon: string }> = {
  Admin: { bg: "bg-purple-100", text: "text-purple-700", icon: "👑" },
  Doctor: { bg: "bg-blue-100", text: "text-blue-700", icon: "🩺" },
  Assistant: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "💉" },
  Receptionist: { bg: "bg-amber-100", text: "text-amber-700", icon: "📞" },
};

export default function StaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const data = await getStaff();
        setStaffList(data);
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Staff & Roles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members and access control (RBAC)</p>
        </div>
        <NewStaffDialog />
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {Object.entries(roleConfig).map(([role, config]) => (
          <Card key={role} className="border-0 shadow-sm card-hover">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center text-lg`}>
                {config.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{staffList.filter((s) => s.role === role).length}</p>
                <p className="text-xs text-gray-500">{role}s</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search staff..." className="pl-10 h-10 rounded-xl bg-white border-gray-200 focus-visible:ring-blue-500/20" />
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Member</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((member) => {
                const config = roleConfig[member.role] || roleConfig.Receptionist;
                return (
                  <TableRow key={member.id} className="table-row-hover group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                            {member.avatar}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${member.status === "Online" ? "bg-emerald-400" : "bg-gray-300"
                            }`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${config.bg} ${config.text} border-none text-[11px] font-semibold rounded-full px-2.5`}>
                        <Shield className="w-2.5 h-2.5 mr-1" /> {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {member.email}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {member.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${member.status === "Online" ? "bg-emerald-400" : "bg-gray-300"}`} />
                        <span className="text-xs text-gray-500">{member.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 rounded-lg">
                        <UserPen className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

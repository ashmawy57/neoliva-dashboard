"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPen, Shield, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditStaffDialog } from "./EditStaffDialog";

const roleConfig: Record<string, { bg: string; text: string; icon: string }> = {
  OWNER: { bg: "bg-rose-100", text: "text-rose-700", icon: "💎" },
  ADMIN: { bg: "bg-purple-100", text: "text-purple-700", icon: "👑" },
  MANAGER: { bg: "bg-indigo-100", text: "text-indigo-700", icon: "📋" },
  DOCTOR: { bg: "bg-blue-100", text: "text-blue-700", icon: "🩺" },
  ACCOUNTANT: { bg: "bg-amber-100", text: "text-amber-700", icon: "💰" },
  STAFF: { bg: "bg-slate-100", text: "text-slate-700", icon: "👥" },
  // Fallbacks for legacy/UI display
  Admin: { bg: "bg-purple-100", text: "text-purple-700", icon: "👑" },
  Doctor: { bg: "bg-blue-100", text: "text-blue-700", icon: "🩺" },
  Assistant: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "💉" },
  Receptionist: { bg: "bg-amber-100", text: "text-amber-700", icon: "📞" },
};

export function StaffTable({ initialStaff }: { initialStaff: any[] }) {
  const [search, setSearch] = useState("");
  const [editingMember, setEditingMember] = useState<any>(null);

  const filteredStaff = initialStaff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search staff..." 
          className="pl-10 h-10 rounded-xl bg-white border-gray-200 focus-visible:ring-blue-500/20" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
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
            {filteredStaff.map((member) => {
              const config = roleConfig[member.role] || roleConfig.Receptionist;
              return (
                <TableRow key={member.id} className="table-row-hover group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          member.isPending ? "bg-amber-400" : (member.status === "Active" ? "bg-emerald-400" : "bg-gray-300")
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
                      <span className="mr-1">{config.icon}</span> {member.role}
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
                      {member.isPending ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-xs text-amber-600 font-medium">Invited</span>
                        </>
                      ) : (
                        <>
                          <div className={`w-2 h-2 rounded-full ${member.status === "Active" ? "bg-emerald-400" : "bg-gray-300"}`} />
                          <span className="text-xs text-gray-500">{member.status}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90"
                      onClick={() => setEditingMember(member)}
                    >
                      <UserPen className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredStaff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editingMember && (
        <EditStaffDialog 
          member={editingMember} 
          open={!!editingMember} 
          onOpenChange={(open) => !open && setEditingMember(null)} 
        />
      )}
    </div>
  );
}

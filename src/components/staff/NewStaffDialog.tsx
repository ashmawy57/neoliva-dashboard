"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, UserPlus, Mail, Phone, Briefcase, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function NewStaffDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-5 text-sm font-medium border-0 cursor-pointer">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Member
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden bg-gray-50 border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="bg-white px-6 py-4 flex flex-row items-center justify-between border-b shrink-0 m-0 space-y-0">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </span>
            Add Staff Member
          </DialogTitle>
        </DialogHeader>

        <form 
          onSubmit={(e) => { e.preventDefault(); setOpen(false); }} 
          className="flex-1 flex flex-col overflow-hidden max-h-[80vh]"
        >
          <div className="flex-1 overflow-y-auto w-full p-6 space-y-5">
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
              <Input 
                id="name"
                placeholder="e.g. Dr. Sarah Smith" 
                className="bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm h-11" 
                required
              />
            </div>

            {/* Role & Title */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                  <Select required>
                    <SelectTrigger className="pl-10 bg-white border-gray-200 focus:ring-blue-500 rounded-xl shadow-sm h-11 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                  <Input 
                    id="title"
                    placeholder="e.g. Lead Dentist" 
                    className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm h-11" 
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="sarah@smilecare.com" 
                    className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm h-11" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="phone"
                    type="tel"
                    placeholder="+1 234-567-8900" 
                    className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm h-11" 
                    required
                  />
                </div>
              </div>
            </div>

            {/* Send Invitation */}
            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm mt-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-gray-900">Send Invitation Email</Label>
                <p className="text-xs text-gray-500">Member will receive instructions to set up their account</p>
              </div>
              <Switch id="invite" className="data-[state=checked]:bg-blue-600" defaultChecked />
            </div>

          </div>
          
          <DialogFooter className="bg-white px-6 py-4 border-t flex gap-3 shrink-0 w-full justify-end items-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="px-6 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 h-11 shadow-sm font-medium"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 h-11 font-semibold"
            >
              Save Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

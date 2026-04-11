"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Stethoscope, DollarSign, Clock, LayoutGrid } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function NewServiceDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-5 text-sm font-medium border-0 cursor-pointer">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Service
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden bg-gray-50 border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="bg-white px-6 py-4 flex flex-row items-center justify-between border-b shrink-0 m-0 space-y-0">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <span className="bg-indigo-100 p-2 rounded-xl">
              <Stethoscope className="h-5 w-5 text-indigo-600" />
            </span>
            Add New Service
          </DialogTitle>
        </DialogHeader>

        <form 
          onSubmit={(e) => { e.preventDefault(); setOpen(false); }} 
          className="flex-1 flex flex-col overflow-hidden max-h-[80vh]"
        >
          <div className="flex-1 overflow-y-auto w-full p-6 space-y-5">
            
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Service Name</Label>
              <Input 
                id="name"
                placeholder="e.g. Teeth Whitening" 
                className="bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-xl shadow-sm h-11" 
                required
              />
            </div>

            {/* Category & Icon */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Category</Label>
                <div className="relative">
                  <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                  <Select required>
                    <SelectTrigger className="pl-10 bg-white border-gray-200 focus:ring-indigo-500 rounded-xl shadow-sm h-11 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="restorative">Restorative</SelectItem>
                      <SelectItem value="cosmetic">Cosmetic</SelectItem>
                      <SelectItem value="surgical">Surgical</SelectItem>
                      <SelectItem value="orthodontics">Orthodontics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon" className="text-sm font-semibold text-gray-700">Emoji Icon</Label>
                <Input 
                  id="icon"
                  placeholder="e.g. ✨" 
                  className="bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-xl shadow-sm h-11 text-center text-lg" 
                  maxLength={2}
                />
              </div>
            </div>

            {/* Price & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="price"
                    type="number"
                    placeholder="0.00" 
                    min="0"
                    step="0.01"
                    className="pl-10 bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-xl shadow-sm h-11" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">Duration (min)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="duration"
                    type="number"
                    placeholder="30" 
                    min="5"
                    step="5"
                    className="pl-10 bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-xl shadow-sm h-11" 
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
              <Textarea 
                id="description"
                placeholder="Brief description of the service..." 
                className="bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-xl shadow-sm min-h-[80px] resize-none" 
              />
            </div>
            
            {/* Popular Switch */}
            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-gray-900">Mark as Popular</Label>
                <p className="text-xs text-gray-500">Highlight this service with a special badge</p>
              </div>
              <Switch id="popular" className="data-[state=checked]:bg-indigo-600" />
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
              Save Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

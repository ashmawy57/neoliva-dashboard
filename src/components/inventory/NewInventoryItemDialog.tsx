"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Package, Layers, Hash, AlertTriangle, Scale } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewInventoryItemDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-5 text-sm font-medium border-0 cursor-pointer">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden bg-gray-50 border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="bg-white px-6 py-4 flex flex-row items-center justify-between border-b shrink-0 m-0 space-y-0">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <Package className="h-5 w-5 text-blue-600" />
            </span>
            Add Inventory Item
          </DialogTitle>
        </DialogHeader>

        <form 
          onSubmit={(e) => { e.preventDefault(); setOpen(false); }} 
          className="flex-1 flex flex-col overflow-hidden max-h-[80vh]"
        >
          <div className="flex-1 overflow-y-auto w-full p-6 space-y-5">
            
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Item Name</Label>
              <Input 
                id="name"
                placeholder="e.g. Lidocaine 2%" 
                className="bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm h-11" 
                required
              />
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Category</Label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                  <Select required>
                    <SelectTrigger className="pl-10 bg-white border-gray-200 focus:ring-blue-500 rounded-xl shadow-sm h-11 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anesthetics">Anesthetics</SelectItem>
                      <SelectItem value="materials">Materials</SelectItem>
                      <SelectItem value="disposables">Disposables</SelectItem>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-semibold text-gray-700">Unit Type</Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                  <Select required>
                    <SelectTrigger className="pl-10 bg-white border-gray-200 focus:ring-blue-500 rounded-xl shadow-sm h-11 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vials">Vials</SelectItem>
                      <SelectItem value="syringes">Syringes</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="pcs">Pcs</SelectItem>
                      <SelectItem value="bags">Bags</SelectItem>
                      <SelectItem value="tubes">Tubes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Quantity & Min Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">Current Quantity</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="quantity"
                    type="number"
                    placeholder="0" 
                    min="0"
                    className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm h-11" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minLevel" className="text-sm font-semibold text-gray-700">Minimum Level</Label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 text-amber-500" />
                  <Input 
                    id="minLevel"
                    type="number"
                    placeholder="0" 
                    min="0"
                    className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm h-11" 
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Alert threshold for low stock</p>
              </div>
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
              Save Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

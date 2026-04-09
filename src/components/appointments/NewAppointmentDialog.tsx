"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Search, Calendar as CalendarIcon, Clock, Mic } from "lucide-react";

export function NewAppointmentDialog() {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState("+20'");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState("#3b82f6"); // blue-500 default
  const [unscheduled, setUnscheduled] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [saveToCalendar, setSaveToCalendar] = useState(false);

  const todayDate = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-5 text-sm font-medium border-0 cursor-pointer">
        <PlusCircle className="mr-2 h-4 w-4" /> New Appointment
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden bg-gray-50 border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="bg-white px-6 py-4 flex flex-row items-center justify-between border-b shrink-0 m-0 space-y-0">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </span>
            New Appointment
          </DialogTitle>
        </DialogHeader>

        <form 
          onSubmit={(e) => { e.preventDefault(); setOpen(false); }} 
          className="flex-1 flex flex-col overflow-hidden max-h-[80vh]"
        >
          <div className="flex-1 overflow-y-auto w-full p-6 space-y-6">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="name/phone number" 
                className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm h-12 text-base" 
              />
            </div>

            {/* Unscheduled Options */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border ${unscheduled ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'} flex items-center justify-center transition-colors group-hover:border-blue-400`}>
                {unscheduled && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input type="checkbox" className="hidden" checked={unscheduled} onChange={(e) => setUnscheduled(e.target.checked)} />
              <span className="text-gray-700 font-medium">Create unscheduled appointment</span>
            </label>

            {/* Date Display / Picker */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
              </div>
              <Input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 bg-blue-50 border-blue-200 focus-visible:ring-blue-500 rounded-xl shadow-sm h-12 text-blue-800 font-semibold" 
              />
              {!date && (
                <div className="absolute inset-0 pl-10 pr-4 flex items-center text-blue-800 font-semibold pointer-events-none bg-blue-50 rounded-xl border border-blue-200">
                  {todayDate}
                </div>
              )}
            </div>

            {/* Time & Duration */}
            <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <Label className="w-16 text-sm font-medium text-gray-500">Time:</Label>
                <div className="relative flex-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 rounded-lg h-11 shadow-sm" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label className="w-16 text-sm font-medium text-gray-500">Duration:</Label>
                <div className="flex bg-gray-100/80 rounded-xl overflow-hidden border border-gray-100 p-1 flex-1">
                  {["+10'", "+20'", "+30'"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`flex-1 rounded-lg font-semibold text-sm h-9 transition-all duration-300 ${
                        duration === d 
                          ? "bg-blue-500 text-white shadow-md ring-1 ring-black/5" 
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label className="w-16 text-sm font-medium text-gray-500">End time:</Label>
                <div className="relative flex-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 rounded-lg h-11 shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Reminder */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border ${reminder ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'} flex items-center justify-center transition-colors group-hover:border-blue-400`}>
                {reminder && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input type="checkbox" className="hidden" checked={reminder} onChange={(e) => setReminder(e.target.checked)} />
              <span className="text-gray-700 font-medium">Reminder 60 minutes prior</span>
            </label>

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700 pt-1">Notes:</Label>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors shrink-0">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Textarea 
                placeholder="enter a note about the upcoming appointment, e.g. the patient may be a little late" 
                className="bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm min-h-[100px] resize-none" 
              />
            </div>

            {/* Color & Save Event */}
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium text-gray-700">Color:</Label>
              <div className="relative">
                <Input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="p-1 h-10 w-24 rounded-lg bg-white border border-gray-200 cursor-pointer shadow-sm" 
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group pb-2">
              <div className={`w-5 h-5 rounded border ${saveToCalendar ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'} flex items-center justify-center transition-colors group-hover:border-blue-400`}>
                {saveToCalendar && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input type="checkbox" className="hidden" checked={saveToCalendar} onChange={(e) => setSaveToCalendar(e.target.checked)} />
              <span className="text-gray-700 font-medium text-sm">Save the event via the Calendar app dialog</span>
            </label>

          </div>
          
          <DialogFooter className="bg-white px-6 py-4 border-t flex gap-3 shrink-0 w-full sm:justify-between items-center sm:flex-row flex-col-reverse">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="px-6 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 h-11 shadow-sm font-medium w-full sm:w-auto"
            >
              DISCARD
            </Button>
            <Button 
              type="submit" 
              className="px-8 min-w-[160px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 h-11 font-semibold w-full sm:w-auto"
            >
              SUBMIT AND CLOSE
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

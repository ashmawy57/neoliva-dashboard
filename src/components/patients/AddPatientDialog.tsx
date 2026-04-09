"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";
import { 
  PlusCircle, 
  Camera, 
  Phone, 
  MessageCircle, 
  MessageSquare,
  Bell, 
  MoreVertical, 
  Mail, 
  Search, 
  Mic, 
  PenTool,
  Save,
  Cloud,
  Menu,
  Activity,
  Users
} from "lucide-react";

export function AddPatientDialog() {
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState("Female");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [dob, setDob] = useState("");
  const [isDeceased, setIsDeceased] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [notes, setNotes] = useState("");
  
  const registrationDate = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  const calculateAge = (dateString: string) => {
    if (!dateString) return "Age";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-primary-foreground bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-5 text-sm font-medium border-0 cursor-pointer">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Patient
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md md:max-w-xl lg:max-w-2xl h-[90vh] flex flex-col p-0 overflow-hidden bg-gray-50 border-0 shadow-2xl rounded-2xl">
        {/* App-like Header */}
        <DialogHeader className="bg-white px-4 py-3 flex flex-row items-center justify-between border-b shrink-0 m-0 space-y-0">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span className="bg-gray-100 p-1.5 rounded-lg">
                <PlusCircle className="h-4 w-4 text-gray-500" />
              </span>
              Patient's Form
            </DialogTitle>
          </div>
        </DialogHeader>

        <form 
          onSubmit={(e) => { e.preventDefault(); setOpen(false); }} 
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto w-full">
            <div className="flex flex-col">
              
              {/* General Profile Info Window */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-6 font-semibold text-sm shadow-md sticky top-0 z-10 tracking-wide">
                General Profile Info
              </div>
              
              <div className="p-4 space-y-4 bg-gray-100 pb-2">
                <div className="flex items-start gap-4">
                  {/* Camera Upload Area */}
                  <div className="w-24 h-24 bg-gray-200 border-2 border-blue-300 rounded-xl flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-300 transition-colors">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 space-y-2 flex flex-col justify-center">
                    <p className="text-xs text-gray-600 leading-tight pr-2">
                      Touch the camera icon to take a new profile picture using your camera.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-blue-100 text-blue-900 border-b border-blue-200 py-2 px-6 font-semibold text-sm shadow-sm flex items-center tracking-wide uppercase">
                <span>Contact details</span>
              </div>
              
              <div className="p-4 space-y-4 bg-gray-100">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Name:</Label>
                  <Input placeholder="enter patient's full name" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Phone 1:</Label>
                  <div className="flex gap-2">
                    <Input placeholder="enter home phone number" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm flex-1" />
                    <Button size="icon" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full h-11 w-11 shrink-0 shadow-sm">
                      <Phone className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Phone 2:</Label>
                  <div className="flex gap-2">
                    <Input placeholder="enter mobile phone number" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm flex-1" />
                    <Button size="icon" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full h-11 w-11 shrink-0 shadow-sm">
                      <Phone className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">E-mail:</Label>
                  <div className="flex gap-2">
                    <Input placeholder="enter e-mail" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm flex-1" />
                    <Button size="icon" className="bg-blue-400 hover:bg-blue-500 text-white rounded-xl h-11 w-11 shrink-0 shadow-sm">
                      <Mail className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Address:</Label>
                  <Input placeholder="enter address" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Post code:</Label>
                  <Input placeholder="enter post code" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">City:</Label>
                  <Input placeholder="enter city" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm" />
                </div>
              </div>

              {/* Private Info */}
              <div className="bg-blue-100 text-blue-900 border-b border-blue-200 border-t py-2 px-6 font-semibold text-sm shadow-sm tracking-wide uppercase">
                Private info
              </div>

              <div className="p-4 space-y-4 bg-gray-100">
                <div className="space-y-1.5 flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">Gender:</Label>
                  <div className="flex bg-gray-200/60 rounded-xl overflow-hidden border border-gray-100 p-1 relative shadow-inner">
                    {["Female", "Male", "Other"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 rounded-lg font-semibold text-sm h-10 transition-all duration-300 ease-out ${
                          gender === g 
                            ? "bg-white text-blue-600 shadow ring-1 ring-black/5" 
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                         }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">Marital status:</Label>
                  <div className="flex bg-gray-200/60 rounded-xl overflow-hidden border border-gray-100 p-1 relative shadow-inner">
                    {["Single", "Married", "Underage"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setMaritalStatus(status)}
                        className={`flex-1 rounded-lg font-semibold text-sm h-10 transition-all duration-300 ease-out ${
                          maritalStatus === status 
                            ? "bg-white text-blue-600 shadow ring-1 ring-black/5" 
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                         }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">Date of Birth: <span className="text-lg">🎂</span></Label>
                  <div className="flex gap-2">
                    <Input 
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="flex-1 bg-white border-gray-200 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl h-11 shadow-sm font-medium text-gray-700 px-4" 
                    />
                    <div className="bg-blue-50 border border-blue-100 rounded-xl h-11 px-4 flex items-center justify-center text-sm font-bold text-blue-700 shadow-sm min-w-[70px]">
                      {dob ? calculateAge(dob) : "Age"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Occupation:</Label>
                  <Input placeholder="enter profession" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Insurance:</Label>
                  <Input placeholder="enter insurance name" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Social Security Number:</Label>
                  <Input placeholder="enter social security number" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Identification Number:</Label>
                  <Input placeholder="enter identification number" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Medical Alert:</Label>
                  <Input placeholder="e.g. penicillin allergy" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm" />
                </div>
              </div>

               {/* Additional info */}
               <div className="bg-blue-100 text-blue-900 border-b border-blue-200 border-t py-2 px-6 font-semibold text-sm shadow-sm tracking-wide uppercase">
                Additional info
              </div>

              <div className="p-4 space-y-4 bg-gray-100 pb-10">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Referred by:</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search" className="bg-white border-gray-200 rounded-xl h-11 shadow-sm pl-10" />
                    </div>
                    <Button size="icon" className="bg-blue-400 hover:bg-blue-500 text-white rounded-xl h-11 w-11 shrink-0 shadow-sm p-0 flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">Registered:</Label>
                  <div className="bg-blue-50 border border-blue-100 text-blue-800 text-center rounded-xl h-11 shadow-sm flex items-center justify-center font-semibold">
                    {registrationDate}
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">Notes:</Label>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any other noteworthy information about this patient..." 
                    className="bg-white border-gray-200 focus-visible:ring-blue-500 rounded-xl shadow-sm min-h-[120px] resize-none p-4" 
                  />
                </div>

                <div className="space-y-1.5 flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">Signature:</Label>
                  <div 
                    onClick={() => setIsSigned(!isSigned)}
                    className={`w-full max-w-[260px] h-28 border-2 border-dashed rounded-xl flex items-center justify-center cursor-crosshair transition-colors relative ${
                      isSigned 
                        ? "bg-blue-50/50 border-blue-300" 
                        : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                    }`}
                  >
                    {!isSigned ? (
                      <div className="flex flex-col items-center text-gray-400 gap-2">
                         <PenTool className="h-6 w-6" />
                         <span className="text-xs font-medium uppercase tracking-wider">Click to Sign</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <svg className="w-full h-full text-blue-600 opacity-90 drop-shadow-sm" viewBox="0 0 200 60" preserveAspectRatio="xMidYMid meet">
                          <path d="M 10 45 Q 30 5 60 40 T 110 35 T 150 45 T 190 35" fill="transparent" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  type="button" 
                  onClick={() => setIsDeceased(!isDeceased)}
                  variant="outline" 
                  className={`w-full h-12 rounded-xl shadow-sm font-semibold mt-4 transition-all duration-300 ${
                    isDeceased 
                      ? "bg-red-500 hover:bg-red-600 text-white border-transparent ring-2 ring-red-500/50 ring-offset-2" 
                      : "bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  }`}
                >
                  {isDeceased ? "Patient is marked as deceased" : "The patient is deceased"}
                </Button>
                
                <div className="h-4 bg-gray-100 w-full mt-2 rounded-b-xl"></div>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-white px-6 py-4 border-t flex sm:justify-end gap-3 shrink-0 w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="px-6 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 h-11 shadow-sm font-medium"
            >
              DISCARD
            </Button>
            <Button 
              type="submit" 
              className="px-8 min-w-[140px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 h-11 font-semibold"
            >
              SAVE INFO
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

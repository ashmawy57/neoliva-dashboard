"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { updateClinicAction } from "@/app/actions/settings";
import { toast } from "sonner";

const clinicSchema = z.object({
  clinicName: z.string().min(1, "Clinic Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

interface ClinicSettingsData {
  clinicName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  [key: string]: unknown;
}

export function ClinicSettingsForm({ initialData }: { initialData: ClinicSettingsData | null }) {
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      clinicName: initialData?.clinicName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof clinicSchema>) => {
    setIsPending(true);
    try {
      await updateClinicAction(data);
      toast.success("Clinic settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Clinic Information</CardTitle>
          <CardDescription>Update details used across invoices and profiles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">Clinic Name</Label>
              <Input {...register("clinicName")} className="h-10 rounded-xl" />
              {errors.clinicName && <p className="text-xs text-red-500">{errors.clinicName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">Support Email</Label>
              <Input {...register("email")} className="h-10 rounded-xl" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Address</Label>
            <Input {...register("address")} className="h-10 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">Phone</Label>
              <Input {...register("phone")} className="h-10 rounded-xl" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-gray-50/50 rounded-b-xl flex justify-between items-center">
          {isDirty ? <p className="text-xs text-amber-600 font-medium">Unsaved changes</p> : <div />}
          <Button 
            disabled={isPending || !isDirty} 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 mt-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

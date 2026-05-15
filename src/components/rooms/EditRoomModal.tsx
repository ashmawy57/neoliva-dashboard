"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateRoomAction } from "@/app/actions/rooms";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["GENERAL", "SURGERY", "XRAY", "CONSULTATION", "CLEANING", "WHITENING"]),
  description: z.string().optional(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditRoomModal({ 
  room,
  isOpen, 
  onClose 
}: { 
  room: any;
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: room.name,
      type: room.type,
      description: room.description || "",
      color: room.color || "#3b82f6",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await updateRoomAction(room.id, values);
      if (result.success) {
        toast.success("Room updated successfully");
        onClose();
      } else {
        toast.error(result.error || "Failed to update room");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Room Details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name/Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Room 1, Surgery A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="SURGERY">Surgery</SelectItem>
                        <SelectItem value="XRAY">X-Ray</SelectItem>
                        <SelectItem value="CONSULTATION">Consultation</SelectItem>
                        <SelectItem value="CLEANING">Cleaning</SelectItem>
                        <SelectItem value="WHITENING">Whitening</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1 cursor-pointer" 
                          {...field} 
                          value={field.value || "#3b82f6"} 
                        />
                        <Input 
                          type="text" 
                          placeholder="#000000" 
                          className="flex-1" 
                          {...field} 
                          value={field.value || "#3b82f6"} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes about equipment, size, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

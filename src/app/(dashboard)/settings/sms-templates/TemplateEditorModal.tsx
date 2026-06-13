'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createSmsTemplate, updateSmsTemplate } from '@/app/actions/smsTemplates';
import { TemplateCategory } from '@/services/smsTemplateService';

const ALLOWED_VARIABLES = [
  'patient_name', 
  'clinic_name', 
  'appointment_date', 
  'appointment_time', 
  'doctor_name', 
  'remaining_balance'
];

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  message: z.string().min(1, 'Message is required').refine((val) => {
    // Extract all {{variables}} and validate
    const matches = val.match(/\{\{(.*?)\}\}/g);
    if (!matches) return true;
    
    for (const match of matches) {
      const variable = match.replace(/[{}]/g, '').trim();
      if (!ALLOWED_VARIABLES.includes(variable)) {
        return false;
      }
    }
    return true;
  }, {
    message: `Template contains invalid variables. Allowed: ${ALLOWED_VARIABLES.join(', ')}`
  }),
  isActive: z.boolean().default(true),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export function TemplateEditorModal({ 
  open, 
  onOpenChange, 
  template,
  category
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  template?: any;
  category: TemplateCategory;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name || '',
      message: template?.message || '',
      isActive: template?.isActive ?? true,
    }
  });

  const currentMessage = watch('message');

  const onSubmit = async (data: TemplateFormValues) => {
    setIsSubmitting(true);
    
    // Extract valid variables for saving
    const matches = data.message.match(/\{\{(.*?)\}\}/g) || [];
    const variables = Array.from(new Set(matches.map(m => m.replace(/[{}]/g, '').trim())));

    try {
      const payload = {
        ...data,
        category,
        variables
      };

      let res;
      if (template?.id) {
        res = await updateSmsTemplate(template.id, payload);
      } else {
        res = await createSmsTemplate(payload);
      }

      if (res.success) {
        toast.success(`Template ${template?.id ? 'updated' : 'created'} successfully`);
        onOpenChange(false);
      } else {
        toast.error(res.error || 'Failed to save template');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertVariable = (variable: string) => {
    const newVal = currentMessage ? `${currentMessage}{{${variable}}}` : `{{${variable}}}`;
    setValue('message', newVal, { shouldValidate: true });
  };

  const getPreview = (msg: string) => {
    let prev = msg;
    prev = prev.replace(/\{\{patient_name\}\}/g, 'Sarah Connor');
    prev = prev.replace(/\{\{clinic_name\}\}/g, 'Neoliva Dental');
    prev = prev.replace(/\{\{appointment_date\}\}/g, 'Oct 24, 2026');
    prev = prev.replace(/\{\{appointment_time\}\}/g, '10:00 AM');
    prev = prev.replace(/\{\{doctor_name\}\}/g, 'Dr. Smith');
    prev = prev.replace(/\{\{remaining_balance\}\}/g, '$150.00');
    return prev;
  };

  const charCount = currentMessage.length;
  const segmentCount = Math.ceil(charCount / 160) || 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'New Template'}</DialogTitle>
          <DialogDescription>
            Configure your SMS template and insert dynamic variables.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            
            <div className="flex justify-between items-center gap-4">
              <div className="space-y-2 flex-1">
                <Label>Template Name</Label>
                <Input {...register('name')} placeholder="e.g., Appointment Confirmation" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2 flex flex-col items-center pt-6">
                <Label className="sr-only">Active</Label>
                <div className="flex items-center gap-2">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <Label>Message</Label>
                <span className="text-xs text-muted-foreground">
                  {charCount} chars • {segmentCount} SMS {segmentCount > 1 ? 'segments' : 'segment'}
                </span>
              </div>
              
              <Textarea 
                {...register('message')} 
                className="h-32" 
                placeholder="Hi {{patient_name}}, your appointment at {{clinic_name}} is on {{appointment_date}} at {{appointment_time}}."
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
              
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground block mb-2">Insert Variables:</Label>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_VARIABLES.map(v => (
                    <Button 
                      key={v} 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="text-xs px-2 py-1 h-7"
                      onClick={() => insertVariable(v)}
                    >
                      {v.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-semibold text-muted-foreground">Live Preview</Label>
              <div className="p-3 bg-secondary text-secondary-foreground rounded-lg rounded-bl-none text-sm whitespace-pre-wrap min-h-[60px]">
                {getPreview(currentMessage) || <span className="opacity-50 italic">Preview will appear here...</span>}
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {template ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

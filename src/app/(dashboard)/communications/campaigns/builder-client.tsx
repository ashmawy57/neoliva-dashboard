'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { previewCampaignAudience, createAndSendCampaign } from '@/app/actions/campaigns';
import { CampaignFilters } from '@/services/smsCampaignService';
import { Loader2, Users, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CampaignBuilder() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  
  const [filters, setFilters] = useState<CampaignFilters>({
    hasBalance: false,
  });

  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [isLoadingAudience, setIsLoadingAudience] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced Audience calculation
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoadingAudience(true);
      const res = await previewCampaignAudience(filters);
      if (res.success && res.count !== undefined) {
        setAudienceCount(res.count);
      } else {
        setAudienceCount(null);
        if (res.error) toast.error("Error calculating audience: " + res.error);
      }
      setIsLoadingAudience(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleSend = async () => {
    if (!name) return toast.error("Campaign name is required");
    if (!message) return toast.error("Message is required");
    if (audienceCount === 0) return toast.error("Audience is empty");
    if (audienceCount && audienceCount > 1000) return toast.error("Cannot exceed 1000 patients limit");

    setIsSubmitting(true);
    const res = await createAndSendCampaign({ name, message, filters });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Campaign launched successfully!");
      router.refresh();
      // Reset form
      setName('');
      setMessage('');
      setFilters({ hasBalance: false });
    } else {
      toast.error(res.error || "Failed to launch campaign");
    }
  };

  const handleFilterChange = (key: keyof CampaignFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === "" || value === undefined) {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value;
      }
      return newFilters;
    });
  };

  const previewMessage = () => {
    let prev = message || 'Your message here...';
    prev = prev.replace(/{{patient_name}}/g, 'John Doe');
    prev = prev.replace(/{{clinic_name}}/g, 'Neoliva Dental');
    prev = prev.replace(/{{appointment_date}}/g, '12/10/2026');
    return prev;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Audience Filters</CardTitle>
            <CardDescription>Select who should receive this campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Last Visit (Months Ago)</Label>
              <Input 
                type="number" 
                placeholder="e.g., 6 for > 6 months" 
                onChange={(e) => handleFilterChange('lastVisitMonths', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <p className="text-xs text-muted-foreground">Patients whose last visit was more than N months ago</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Age</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 18" 
                  onChange={(e) => handleFilterChange('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Age</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 65" 
                  onChange={(e) => handleFilterChange('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select onValueChange={(val) => handleFilterChange('gender', val === 'ALL' ? undefined : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Procedure Type (Optional)</Label>
              <Input 
                placeholder="e.g., Teeth Whitening, Implant (Comma separated)" 
                onChange={(e) => handleFilterChange('procedures', e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="has-balance" 
                checked={filters.hasBalance}
                onCheckedChange={(val) => handleFilterChange('hasBalance', val)}
              />
              <Label htmlFor="has-balance">Only patients with outstanding balance</Label>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4" />
                Audience Size
              </div>
              <div className="text-xl font-bold">
                {isLoadingAudience ? <Loader2 className="w-5 h-5 animate-spin" /> : (audienceCount !== null ? audienceCount : '-')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>Write your SMS campaign content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name (Internal)</Label>
              <Input 
                placeholder="e.g., Whitening Promo Q3" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <Label>Message</Label>
                <span className={`text-xs ${message.length > 160 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                  {message.length} / 160 chars
                </span>
              </div>
              <Textarea 
                placeholder="Hi {{patient_name}}, we miss you at {{clinic_name}}! Book your next checkup today."
                className="h-32"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setMessage(m => m + '{{patient_name}}')}>+ Patient Name</Button>
                <Button variant="outline" size="sm" onClick={() => setMessage(m => m + '{{clinic_name}}')}>+ Clinic Name</Button>
                <Button variant="outline" size="sm" onClick={() => setMessage(m => m + '{{appointment_date}}')}>+ Appt Date</Button>
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Live Preview</Label>
              <div className="p-3 bg-secondary text-secondary-foreground rounded-lg rounded-bl-none max-w-[85%] text-sm whitespace-pre-wrap">
                {previewMessage()}
              </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSend} 
              disabled={isSubmitting || isLoadingAudience || audienceCount === 0 || message.length > 160}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Launch Campaign {audienceCount ? `(${audienceCount} patients)` : ''}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

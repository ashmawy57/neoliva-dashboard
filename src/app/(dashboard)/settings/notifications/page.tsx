"use client";

import React, { useEffect, useState } from "react";
import { getNotificationPreferences, updateNotificationPreference } from "@/app/actions/notifications";
import { NotificationType, NotificationChannelType } from "@/generated/client";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, DollarSign, Package, FlaskConical, Mail, MessageSquare, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<{ type: NotificationType, channel: NotificationChannelType, enabled: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getNotificationPreferences();
      setPreferences(res);
      setLoading(false);
    }
    load();
  }, []);

  const handleToggle = async (type: NotificationType, channel: NotificationChannelType, currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    
    // Optimistic Update
    setPreferences(prev => {
      const existing = prev.find(p => p.type === type && p.channel === channel);
      if (existing) {
        return prev.map(p => p.type === type && p.channel === channel ? { ...p, enabled: nextEnabled } : p);
      }
      return [...prev, { type, channel, enabled: nextEnabled }];
    });

    try {
      const res = await updateNotificationPreference(type, channel, nextEnabled);
      if (!res.success) {
        throw new Error();
      }
      toast.success(`${type} notifications via ${channel} updated.`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save preference");
      // Revert if failed
      setPreferences(prev => prev.map(p => p.type === type && p.channel === channel ? { ...p, enabled: currentEnabled } : p));
    }
  };

  const isEnabled = (type: NotificationType, channel: NotificationChannelType) => {
    const pref = preferences.find(p => p.type === type && p.channel === channel);
    return pref ? pref.enabled : true; // Default to true
  };

  const sections = [
    { title: "Appointments", type: NotificationType.APPOINTMENT, icon: Calendar, description: "Booking reminders and status updates" },
    { title: "Billing & Invoices", type: NotificationType.BILLING, icon: DollarSign, description: "Payment alerts and unpaid invoices" },
    { title: "Inventory", type: NotificationType.INVENTORY, icon: Package, description: "Low stock and order alerts" },
    { title: "Lab Orders", type: NotificationType.LAB, icon: FlaskConical, description: "Lab status and delivery updates" },
    { title: "System Updates", type: NotificationType.SYSTEM, icon: Bell, description: "Security and system maintenance alerts" },
  ];

  const channels = [
    { name: "In-App", type: NotificationChannelType.IN_APP, icon: Bell },
    { name: "Email", type: NotificationChannelType.EMAIL, icon: Mail },
    { name: "SMS", type: NotificationChannelType.SMS, icon: Phone },
    { name: "WhatsApp", type: NotificationChannelType.WHATSAPP, icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Notification Settings</h1>
        <p className="text-slate-500">Customize how and when you want to be notified across different channels</p>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <Card key={section.type} className="border-slate-100 shadow-sm overflow-hidden border-2 hover:border-blue-100 transition-all">
            <CardHeader className="bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <section.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map((channel) => (
                <div 
                  key={channel.type} 
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white transition-colors">
                      <channel.icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{channel.name}</span>
                  </div>
                  <Switch 
                    checked={isEnabled(section.type, channel.type)}
                    onCheckedChange={() => handleToggle(section.type, channel.type, isEnabled(section.type, channel.type))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Bell, CreditCard, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage clinic preferences and system options.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-gray-100/80 p-1 rounded-xl h-auto grid w-full grid-cols-3 gap-1">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm py-2.5">
            <Building2 className="w-4 h-4 mr-2" /> Clinic
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm py-2.5">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm py-2.5">
            <CreditCard className="w-4 h-4 mr-2" /> Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Clinic Information</CardTitle>
              <CardDescription>Update details used across invoices and profiles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">SC</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Clinic Logo</p>
                  <p className="text-xs text-gray-500 mt-0.5">PNG, JPG up to 2MB</p>
                  <Button variant="outline" size="sm" className="mt-2 rounded-lg text-xs h-7">Upload</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">Clinic Name</Label>
                  <Input defaultValue="SmileCare Dental Clinic" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">Support Email</Label>
                  <Input defaultValue="support@smilecare.com" className="h-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Address</Label>
                <Input defaultValue="123 Dental Street, Suite 400, New York" className="h-10 rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">Phone</Label>
                  <Input defaultValue="+1 234-567-8900" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">Working Hours</Label>
                  <Input defaultValue="Mon-Fri 8AM — 6PM" className="h-10 rounded-xl" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50/50 rounded-b-xl">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 mt-2">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Notifications</CardTitle>
              <CardDescription>Configure automated communications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { title: "Email Reminders", desc: "Send 24h before appointments", on: true },
                { title: "SMS Reminders", desc: "Include confirm/cancel link", on: true },
                { title: "Invoice Receipts", desc: "Auto-email PDF on payment", on: true },
                { title: "Low Inventory Alerts", desc: "Notify below min stock", on: false },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="pr-4">
                    <Label className="text-sm font-medium text-gray-900">{item.title}</Label>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.on} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Billing Settings</CardTitle>
              <CardDescription>Invoice templates and tax configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">Currency</Label>
                  <Input defaultValue="USD ($)" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">Tax Rate (%)</Label>
                  <Input defaultValue="8.875" type="number" className="h-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Invoice Note</Label>
                <Textarea defaultValue="Thank you for choosing SmileCare. Payment due within 30 days." className="rounded-xl resize-none" rows={3} />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50/50 rounded-b-xl">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 mt-2">
                <Save className="w-4 h-4 mr-2" /> Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

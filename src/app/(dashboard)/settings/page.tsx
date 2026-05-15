export const dynamic = "force-dynamic";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Bell, CreditCard } from "lucide-react";
import { fetchSettingsAction } from "@/app/actions/settings";
import { ClinicSettingsForm } from "@/components/settings/ClinicSettingsForm";
import { BillingSettingsForm } from "@/components/settings/BillingSettingsForm";
import { NotificationSettingsForm } from "@/components/settings/NotificationSettingsForm";

export default async function SettingsPage() {
  const settings = await fetchSettingsAction();

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
          <ClinicSettingsForm initialData={settings as Parameters<typeof ClinicSettingsForm>[0]["initialData"]} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettingsForm initialData={settings as Parameters<typeof NotificationSettingsForm>[0]["initialData"]} />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingSettingsForm initialData={settings as Parameters<typeof BillingSettingsForm>[0]["initialData"]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

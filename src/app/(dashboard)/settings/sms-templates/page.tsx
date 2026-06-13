import { getTemplates } from '@/app/actions/smsTemplates';
import { getUserSession } from '@/lib/rbac/session';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateList } from './TemplateList';
import { MessageSquareText } from 'lucide-react';

export const metadata = {
  title: 'SMS Templates | Settings',
};

export default async function SmsTemplatesPage() {
  const session = await getUserSession();
  if (!session) {
    redirect('/auth/login');
  }

  const { templates, success, error } = await getTemplates();
  const canEdit = session.role === 'OWNER' || session.role === 'MANAGER';

  if (!success) {
    return <div className="p-6 text-destructive">Error loading templates: {error}</div>;
  }

  const typedTemplates = templates as any[] || [];

  const reminders = typedTemplates.filter(t => t.category === 'REMINDERS');
  const occasions = typedTemplates.filter(t => t.category === 'OCCASIONS');
  const campaigns = typedTemplates.filter(t => t.category === 'CAMPAIGNS');

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage reusable text templates for reminders, occasions, and campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
          <MessageSquareText className="w-4 h-4" />
          <span>160 chars per SMS</span>
        </div>
      </div>

      <Tabs defaultValue="REMINDERS" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="REMINDERS">Reminders ({reminders.length})</TabsTrigger>
          <TabsTrigger value="OCCASIONS">Occasions ({occasions.length})</TabsTrigger>
          <TabsTrigger value="CAMPAIGNS">Campaigns ({campaigns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="REMINDERS">
          <TemplateList category="REMINDERS" templates={reminders} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="OCCASIONS">
          <TemplateList category="OCCASIONS" templates={occasions} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="CAMPAIGNS">
          <TemplateList category="CAMPAIGNS" templates={campaigns} canEdit={canEdit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

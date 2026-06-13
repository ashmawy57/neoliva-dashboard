import { getCampaigns } from '@/app/actions/campaigns';
import { CampaignBuilder } from './builder-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { getUserSession } from '@/lib/rbac/session';
import { redirect } from 'next/navigation';
import { Megaphone } from 'lucide-react';

export const metadata = {
  title: 'SMS Campaigns | Communications',
};

export default async function CampaignsPage() {
  const session = await getUserSession();
  if (!session || !['OWNER', 'MANAGER'].includes(session.role)) {
    // Only allow OWNER and MANAGER to view campaigns dashboard
    redirect('/dashboard');
  }

  const { campaigns, success, error } = await getCampaigns();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Build and monitor targeted SMS marketing campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
          <Megaphone className="w-4 h-4" />
          <span>Daily Limit: 1000 SMS</span>
        </div>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="builder">Campaign Builder</TabsTrigger>
          <TabsTrigger value="history">History & Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <CampaignBuilder />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
              <CardDescription>Overview of your past and ongoing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-destructive">Failed to load history: {error}</div>
              ) : !campaigns || campaigns.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No campaigns found. Start building your first campaign!
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{camp.name}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          Created {camp.createdAt ? formatDistanceToNow(camp.createdAt, { addSuffix: true }) : 'N/A'}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <div className="text-sm text-muted-foreground">Status</div>
                          <Badge 
                            variant={
                              camp.status === 'COMPLETED' ? 'default' : 
                              camp.status === 'PROCESSING' ? 'secondary' : 'outline'
                            }
                          >
                            {camp.status}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Sent</div>
                          <div className="font-medium text-emerald-600">{camp.sentCount}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                          <div className="font-medium text-destructive">{camp.failedCount}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

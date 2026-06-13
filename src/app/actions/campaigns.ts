'use strict';
'use server';

import { getUserSession } from '@/lib/rbac/session';
import { UnauthorizedError } from '@/lib/rbac/guard';
import { smsCampaignService, CampaignFilters } from '@/services/smsCampaignService';
import { revalidatePath } from 'next/cache';

async function verifyCampaignRole() {
  const session = await getUserSession();
  if (!session || !session.tenantId) {
    throw new UnauthorizedError('Not authenticated');
  }
  if (session.role !== 'OWNER' && session.role !== 'MANAGER') {
    throw new UnauthorizedError('Only OWNER or MANAGER can manage campaigns.');
  }
  return session;
}

export async function previewCampaignAudience(filters: CampaignFilters) {
  const session = await verifyCampaignRole();
  try {
    const count = await smsCampaignService.previewAudience(session.tenantId, filters);
    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createAndSendCampaign(data: { name: string; message: string; filters: CampaignFilters }) {
  const session = await verifyCampaignRole();
  try {
    // 1. Create campaign as DRAFT
    const campaign = await smsCampaignService.createCampaign(session.tenantId, data);
    
    // 2. Process campaign asynchronously (Fire and Forget)
    // We don't await this so the UI can respond immediately.
    // In production with Vercel, this might get killed if not using `waitUntil` or a job queue, 
    // but for the scope of this project, we start the promise.
    smsCampaignService.processCampaign(session.tenantId, campaign.id).catch(err => {
      console.error("Failed to process campaign in background:", err);
    });

    revalidatePath('/communications/campaigns');
    return { success: true, campaignId: campaign.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCampaigns() {
  const session = await verifyCampaignRole();
  try {
    const campaigns = await smsCampaignService.getCampaigns(session.tenantId);
    return { success: true, campaigns };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

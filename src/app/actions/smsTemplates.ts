'use strict';
'use server';

import { getUserSession } from '@/lib/rbac/session';
import { UnauthorizedError } from '@/lib/rbac/guard';
import { smsTemplateService, SmsTemplateCreateInput } from '@/services/smsTemplateService';
import { revalidatePath } from 'next/cache';

async function verifyEditRole() {
  const session = await getUserSession();
  if (!session || !session.tenantId) {
    throw new UnauthorizedError('Not authenticated');
  }
  if (session.role !== 'OWNER' && session.role !== 'MANAGER') {
    throw new UnauthorizedError('Only OWNER or MANAGER can edit templates.');
  }
  return session;
}

export async function getTemplates() {
  const session = await getUserSession();
  if (!session || !session.tenantId) {
    return { success: false, error: 'Not authenticated' };
  }
  try {
    const templates = await smsTemplateService.getTemplates(session.tenantId);
    return { success: true, templates };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSmsTemplate(data: SmsTemplateCreateInput) {
  const session = await verifyEditRole();
  try {
    const template = await smsTemplateService.createTemplate(session.tenantId, data);
    revalidatePath('/settings/sms-templates');
    return { success: true, template };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSmsTemplate(id: string, data: Partial<SmsTemplateCreateInput>) {
  const session = await verifyEditRole();
  try {
    const template = await smsTemplateService.updateTemplate(session.tenantId, id, data);
    revalidatePath('/settings/sms-templates');
    return { success: true, template };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSmsTemplate(id: string) {
  const session = await verifyEditRole();
  try {
    await smsTemplateService.deleteTemplate(session.tenantId, id);
    revalidatePath('/settings/sms-templates');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function duplicateSmsTemplate(id: string) {
  const session = await verifyEditRole();
  try {
    const template = await smsTemplateService.duplicateTemplate(session.tenantId, id);
    revalidatePath('/settings/sms-templates');
    return { success: true, template };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

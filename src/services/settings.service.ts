import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Prisma } from '@/generated/client';

export type NotificationsConfig = {
  emailReminders: boolean;
  smsReminders: boolean;
  invoiceReceipts: boolean;
  lowInventoryAlerts: boolean;
};

const DEFAULT_NOTIFICATIONS: NotificationsConfig = {
  emailReminders: true,
  smsReminders: true,
  invoiceReceipts: true,
  lowInventoryAlerts: false,
};

export async function getClinicSettings(tenantId: string) {
  let settings = await prisma.clinicSettings.findUnique({
    where: { tenantId },
  });

  if (!settings) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error("Tenant not found");

    settings = await prisma.clinicSettings.create({
      data: {
        tenantId,
        clinicName: tenant.name,
        notificationsConfig: DEFAULT_NOTIFICATIONS as unknown as Prisma.InputJsonValue,
      },
    });
    
    logger.info('[SettingsService] Auto-created default settings', { tenantId });
  }

  return settings;
}

export type UpdateClinicSettingsInput = {
  clinicName?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  workingHours?: any;
  currency?: string;
  taxRate?: number;
  invoiceNote?: string | null;
  notificationsConfig?: NotificationsConfig;
};

export async function updateClinicSettings(tenantId: string, data: UpdateClinicSettingsInput, userId: string) {
  const previous = await getClinicSettings(tenantId);
  
  const updated = await prisma.clinicSettings.update({
    where: { tenantId },
    data: {
      clinicName: data.clinicName !== undefined ? data.clinicName : undefined,
      email: data.email !== undefined ? data.email : undefined,
      phone: data.phone !== undefined ? data.phone : undefined,
      address: data.address !== undefined ? data.address : undefined,
      workingHours: data.workingHours !== undefined ? (data.workingHours as Prisma.InputJsonValue) : undefined,
      currency: data.currency !== undefined ? data.currency : undefined,
      taxRate: data.taxRate !== undefined ? data.taxRate : undefined,
      invoiceNote: data.invoiceNote !== undefined ? data.invoiceNote : undefined,
      notificationsConfig: data.notificationsConfig !== undefined ? (data.notificationsConfig as unknown as Prisma.InputJsonValue) : undefined,
    },
  });

  logger.info('[SettingsService] Clinic settings updated', {
    tenantId,
    userId,
    updatedFields: Object.keys(data),
  });

  await prisma.businessEvent.create({
    data: {
      tenantId,
      eventType: 'SETTINGS_UPDATED',
      entityType: 'SETTINGS',
      entityId: updated.id,
      metadata: {
        userId,
        changedFields: Object.keys(data),
        previous: {
          currency: previous.currency,
          taxRate: previous.taxRate,
          notificationsConfig: previous.notificationsConfig,
        }
      } as Prisma.InputJsonValue,
    }
  });

  return updated;
}

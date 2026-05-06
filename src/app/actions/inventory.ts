"use server"

import { InventoryService } from "@/services/inventory.service";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { resolveTenantContext } from "@/lib/tenant-context";

const inventoryService = new InventoryService();

export async function getInventory() {
  try {
    return await inventoryService.getInventoryList();
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return [];
  }
}

export async function getLowStockAlerts() {
  try {
    return await inventoryService.getLowStockItems();
  } catch (error) {
    return [];
  }
}

export async function createInventoryItem(data: any) {
  try {
    let finalData = data;
    
    // Handle FormData if passed (from standard form actions)
    if (data instanceof FormData) {
      finalData = {
        name: data.get("name") as string,
        category: data.get("category") as string,
        quantity: parseInt(data.get("quantity") as string),
        minLevel: parseInt(data.get("minLevel") as string),
        unit: data.get("unit") as string,
      };
    }

    await inventoryService.addItem(finalData);
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adjustInventoryStock(id: string, adjustment: number) {
  try {
    await inventoryService.adjustStock(id, adjustment);
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    await inventoryService.deleteItem(id);
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function mapServiceConsumable(serviceId: string, inventoryId: string, quantity: number) {
  try {
    const tenantId = await resolveTenantContext();
    await prisma.serviceInventoryUsage.upsert({
      where: {
        serviceId_inventoryId: { serviceId, inventoryId }
      },
      update: { quantity, tenantId },
      create: { serviceId, inventoryId, quantity, tenantId }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

import { NextResponse } from "next/server";
import { getTenantContext, TenantContextError } from "./tenant-context";

/**
 * Reusable authentication guard for API route handlers.
 * Verifies the Supabase session and tenant context.
 * 
 * @param handler The API route handler function
 * @returns A NextResponse
 */
export async function withApiAuth(
  handler: (tenantId: string, user: any) => Promise<NextResponse>
) {
  try {
    const { tenantId, user } = await getTenantContext();
    return await handler(tenantId, user);
  } catch (error) {
    if (error instanceof TenantContextError) {
      const statusMap: Record<string, number> = {
        'UNAUTHORIZED': 401,
        'NO_USER_RECORD': 401,
        'NO_TENANT': 403,
        'PENDING': 403,
        'REJECTED': 403
      };
      
      return NextResponse.json(
        { error: error.message, code: error.code }, 
        { status: statusMap[error.code] || 401 }
      );
    }

    console.error("[API Guard] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}

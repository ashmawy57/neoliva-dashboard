import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

/**
 * Middleware to inject requestId into headers for propagation
 */
export function traceMiddleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || randomUUID();
  
  // Set the requestId in the request headers so it's available to server components/actions
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also set it in the response header for the client
  response.headers.set("x-request-id", requestId);

  return response;
}

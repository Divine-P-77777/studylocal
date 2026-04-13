import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/socket")) {
    return;
  }
  try {
    return await auth0.middleware(request);
  } catch (error: any) {
    if (error.code === 'ERR_JWE_INVALID') {
      console.warn("[Auth0] Invalid session detected. Clearing cookie.");
      // Create a response that continues to the page but clears the corrupted cookie
      const response = NextResponse.next();
      response.cookies.delete('appSession');
      return response;
    }
    
    console.error("[Auth0] Middleware error:", error);
    return;
  }
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|sitemap.xml|robots.txt|api/socket).*)",
  ],
};

import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/socket")) {
    return;
  }
  try {
    return await auth0.middleware(request);
  } catch (error) {
    console.error("[Auth0] Middleware JWE invalid - clearing session recommended:", error);
    // On JWE failure, return nothing (let the app handle unauth state)
    // instead of crashing with Runtime error.
    return;
  }
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|sitemap.xml|robots.txt|api/socket).*)",
  ],
};

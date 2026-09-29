import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth/server";
import { safeDestination } from "@/lib/auth/policy";
export async function GET(request: NextRequest) {
  const client = await authClient();
  const code = request.nextUrl.searchParams.get("code");
  if (client && code) {
    try {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(request.nextUrl.searchParams.get("flow") === "recovery" ? "/reset-password" : safeDestination(request.nextUrl.searchParams.get("next"),null), request.url));
    } catch { /* Expired or unavailable confirmation. */ }
  }
  return NextResponse.redirect(new URL("/sign-in?error=confirmation", request.url));
}

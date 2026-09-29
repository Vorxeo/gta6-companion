import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth/server";
import { safeDestination } from "@/lib/auth/policy";
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const client = await authClient();
  if (client && token_hash && (type === "signup" || type === "recovery" || type === "email")) {
    try {
      const { error } = await client.auth.verifyOtp({ token_hash, type });
      if (!error) return NextResponse.redirect(new URL(type === "recovery" ? "/reset-password" : safeDestination(request.nextUrl.searchParams.get("next"),null), request.url));
    } catch { /* Invalid confirmation never grants access. */ }
  }
  return NextResponse.redirect(new URL("/sign-in?error=confirmation", request.url));
}

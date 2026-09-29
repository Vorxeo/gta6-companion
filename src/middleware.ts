import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return response;
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({name,value}) => request.cookies.set(name,value));
        response = NextResponse.next({ request });
        response.headers.set("Cache-Control", "private, no-store");
        values.forEach(({name,value,options}) => response.cookies.set(name,value,options));
      },
    },
  });
  try { await client.auth.getUser(); } catch { /* Protected routes revalidate and deny on failure. */ }
  return response;
}
export const config = { matcher: ["/workspace/:path*", "/arcade/:path*", "/creator-lab/:path*", "/community/:path*", "/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/auth/:path*"] };

import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export function authConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.SITE_URL);
}
export async function authClient() {
  if (!authConfigured()) return null;
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* Middleware refreshes cookies for Server Components. */ }
      },
    },
  });
}
export function siteOrigin() {
  const origin = new URL(process.env.SITE_URL!);
  if (origin.protocol !== "https:" && !(origin.protocol === "http:" && ["localhost", "127.0.0.1"].includes(origin.hostname))) throw new Error("Invalid SITE_URL");
  return origin.origin;
}

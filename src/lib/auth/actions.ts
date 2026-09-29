"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authClient, siteOrigin } from "./server";
import { safeDestination } from "./policy";
export type AuthResult = { status: "idle" | "unavailable" | "invalid" | "failed" | "sent" | "updated" };
export async function submitAuth(_state: AuthResult, form: FormData): Promise<AuthResult> {
  const client = await authClient();
  if (!client) return { status: "unavailable" };
  const mode = form.get("mode");
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!["signin", "signup", "forgot", "reset"].includes(String(mode))) return { status: "invalid" };
  if (mode !== "reset" && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { status: "invalid" };
  if (mode !== "forgot" && (password.length > 128 || password.length < (mode === "signin" ? 1 : 12))) return { status: "invalid" };
  let destination: string | null = null;
  try {
    if (mode === "signin") {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { status: "failed" };
      destination = safeDestination(form.get("next"),form.get("panel"));
    } else if (mode === "signup") {
      const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(String(form.get("next")||""))}` } });
      if (error) return { status: "failed" };
      if (data.session) destination = safeDestination(form.get("next"),form.get("panel"));
      else return { status: "sent" };
    } else if (mode === "forgot") {
      await client.auth.resetPasswordForEmail(email, { redirectTo: `${siteOrigin()}/auth/callback?flow=recovery` });
      // Do not disclose whether the address exists.
      return { status: "sent" };
    } else {
      const { data: { user }, error: userError } = await client.auth.getUser();
      if (userError || !user) return { status: "failed" };
      const { error } = await client.auth.updateUser({ password });
      if (error) return { status: "failed" };
      return { status: "updated" };
    }
  } catch { return { status: "failed" }; }
  if (destination) {
    revalidatePath("/", "layout");
    redirect(destination);
  }
  return { status: "failed" };
}
export async function signOut() {
  const client = await authClient();
  if (client) {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw new Error("Sign out failed. Please retry.");
  }
  revalidatePath("/", "layout");
  redirect("/sign-in");
}

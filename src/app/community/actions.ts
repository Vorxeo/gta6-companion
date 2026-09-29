"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth/server";

async function member() {
  const client = await authClient();
  if (!client) return null;
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at) return null;
  return { client, user };
}

function url(value: FormDataEntryValue | null) {
  if (!value) return null;
  try {
    const text = String(value).trim();
    if (text.length > 500) return null;
    const parsed = new URL(text);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch { return null; }
}

export async function createPost(form: FormData) {
  const account = await member();
  if (!account) redirect("/sign-in");
  const kind = String(form.get("kind") || "");
  const title = String(form.get("title") || "").trim();
  const body = String(form.get("body") || "").trim();
  const author_name = String(form.get("author_name") || "").trim();
  const source_url = url(form.get("source_url"));
  const source_time = form.get("source_time") ? Number(form.get("source_time")) : null;
  const platform = String(form.get("platform") || "unspecified");
  const language = String(form.get("language") || "en");
  if (!["observation", "theory", "crew"].includes(kind) || title.length < 8 || title.length > 140 || body.length < 15 || body.length > 2000 || author_name.length < 2 || author_name.length > 36 || (kind !== "crew" && !source_url) || !["ps5", "xbox", "pc", "unspecified"].includes(platform) || !["en", "es", "pt-BR", "nl"].includes(language) || (source_time !== null && (!Number.isInteger(source_time) || source_time < 0 || source_time > 7200))) redirect("/community?error=invalid#compose");
  const { error } = await account.client.from("community_posts").insert({ user_id: account.user.id, author_name, kind, title, body, source_url, source_time, platform, language, spoiler: form.get("spoiler") === "on" });
  if (error) redirect("/community?error=failed#compose");
  revalidatePath("/community");
  redirect("/community#board");
}

export async function votePost(form: FormData) {
  const account = await member();
  if (!account) redirect("/sign-in");
  const post_id = String(form.get("post_id") || "");
  if (!/^[0-9a-f-]{36}$/.test(post_id)) return;
  const { data } = await account.client.from("community_votes").select("post_id").eq("post_id", post_id).eq("user_id", account.user.id).maybeSingle();
  if (data) await account.client.from("community_votes").delete().eq("post_id", post_id).eq("user_id", account.user.id);
  else await account.client.from("community_votes").insert({ post_id, user_id: account.user.id });
  revalidatePath("/community");
}

export async function reportPost(form: FormData) {
  const account = await member();
  if (!account) redirect("/sign-in");
  const post_id = String(form.get("post_id") || "");
  if (!/^[0-9a-f-]{36}$/.test(post_id)) return;
  await account.client.from("community_reports").insert({ post_id, user_id: account.user.id });
  revalidatePath("/community");
}

export async function votePoll(form: FormData) {
  const account = await member();
  if (!account) redirect("/sign-in");
  const choice = String(form.get("choice") || "");
  if (!["vice-city", "keys", "grassrivers"].includes(choice)) return;
  const { error } = await account.client.from("community_poll_votes").upsert({ user_id: account.user.id, choice }, { onConflict: "user_id" });
  if (!error) revalidatePath("/community");
}

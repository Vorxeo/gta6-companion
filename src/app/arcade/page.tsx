import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth/server";
import { hasActiveSubscription } from "@/lib/auth/policy";
import ArcadeGame from "@/components/ArcadeGame";
import "./arcade.css";
export const dynamic="force-dynamic";
export default async function ArcadePage(){const client=await authClient();if(!client)redirect("/sign-in?next=arcade");let user;try{const r=await client.auth.getUser();if(!r.error)user=r.data.user;}catch{}if(!user||!user.email_confirmed_at)redirect("/sign-in?next=arcade");if(process.env.WORKSPACE_ACCESS==="subscription"){const {data,error}=await client.from("subscriptions").select("status,current_period_end").eq("user_id",user.id).maybeSingle();if(error||!hasActiveSubscription(data))redirect("/pricing?access=subscription-required");}return <ArcadeGame userId={user.id}/>;}

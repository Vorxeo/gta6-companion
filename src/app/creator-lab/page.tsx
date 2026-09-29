import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth/server";
import { hasActiveSubscription } from "@/lib/auth/policy";
import CreatorLab from "@/components/CreatorLab";
import "./lab.css";
export const dynamic="force-dynamic";
export default async function CreatorLabPage(){const client=await authClient();if(!client)redirect("/sign-in?next=creator-lab");let user;try{const result=await client.auth.getUser();if(!result.error)user=result.data.user;}catch{}if(!user?.email_confirmed_at)redirect("/sign-in?next=creator-lab");if(process.env.WORKSPACE_ACCESS==="subscription"){const {data,error}=await client.from("subscriptions").select("status,current_period_end").eq("user_id",user.id).maybeSingle();if(error||!hasActiveSubscription(data))redirect("/pricing?access=subscription-required");}return <CreatorLab userId={user.id}/>;}

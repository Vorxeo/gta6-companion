import Link from "next/link";
import "../../community.css";
import { notFound } from "next/navigation";
import { authClient } from "@/lib/auth/server";
import { communityCopy } from "@/lib/community-copy";
import type { Locale } from "@/lib/i18n";
export const dynamic="force-dynamic";
export default async function Post({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{lang?:string;reveal?:string}>}){
  const {id}=await params; if(!/^[0-9a-f-]{36}$/.test(id))notFound();
  const query=await searchParams;const locale:Locale=query.lang==="pt-BR"?"pt-BR":query.lang==="es"?"es":"en";const t=communityCopy[locale];
  const client=await authClient();if(!client)notFound();const {data,error}=await client.from("community_posts").select("title,body,author_name,kind,source_url,spoiler").eq("id",id).eq("status","published").maybeSingle();if(error||!data)notFound();
  return <div className="community-page"><header><Link href={`/community?lang=${locale}#board`}>← {t.home}</Link></header><main><span className="merged-kicker">{t[data.kind as "observation"|"theory"|"crew"]}</span>{data.spoiler&&query.reveal!=="1"?<section className="community-hero"><h1>⚠ SPOILER</h1><Link href={`/community/post/${id}?lang=${locale}&reveal=1`}>{t.showSpoiler}</Link></section>:<article className="community-detail"><h1>{data.title}</h1><p>{data.body}</p><span>{data.author_name}</span>{data.source_url&&<a href={data.source_url} target="_blank" rel="nofollow noreferrer">{t.open} ↗</a>}</article>}</main></div>;
}

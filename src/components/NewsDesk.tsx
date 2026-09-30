"use client";
import Link from "next/link";
import { ArrowUpRight, Newspaper, UsersRound } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { editorialCopy, officialNews } from "@/lib/editorial";

export default function NewsDesk({locale}: {locale: Locale}) {
  const t=editorialCopy[locale];
  return <section className="news-desk" id="news" aria-labelledby="news-title">
    <div className="news-heading"><div><span className="merged-kicker"><Newspaper size={14}/> GTA VI / NEWSWIRE</span><h2 id="news-title">{t.news}</h2><p>{t.newsIntro}</p></div><span>{t.latest}</span></div>
    <div className="news-grid">{officialNews.map((item,index)=><article className="news-item" key={item.href}>
      <div className="news-item-art"><span>0{index+1}</span><strong>{item.tag}</strong></div>
      <div className="news-item-copy"><time dateTime={item.date}>{new Intl.DateTimeFormat(locale,{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(`${item.date}T12:00:00Z`))}</time><h3>{item.title}</h3><a href={item.href} target="_blank" rel="noopener noreferrer">{t.source}<ArrowUpRight size={16}/></a></div>
    </article>)}</div>
    <div className="news-actions"><a href="https://www.rockstargames.com/newswire?tag_id=729" target="_blank" rel="noopener noreferrer">{t.all}<ArrowUpRight size={17}/></a><Link href={`/community?lang=${locale}`}><UsersRound size={17}/>{t.community}<ArrowUpRight size={17}/></Link></div>
  </section>;
}

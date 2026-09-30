"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Gamepad2, ShieldCheck } from "lucide-react";
import { browserLocale, isLocale, type Locale } from "@/lib/i18n";
import { editorialCopy, officialStores } from "@/lib/editorial";
export default function BuyPage() {
  const [locale,setLocale]=useState<Locale>("en");
  useEffect(()=>{let value=browserLocale(navigator.language);try{const saved=localStorage.getItem("vi-language");if(isLocale(saved))value=saved;}catch{}setLocale(value);},[]);
  const t=editorialCopy[locale];
  return <main className="editorial-page buy-page"><title>{`${t.buy} — GTA VI Companion`}</title><header><Link href="/">← {t.back}</Link><select aria-label="Language" value={locale} onChange={e=>setLocale(e.target.value as Locale)}><option value="en">English</option><option value="es">Español</option><option value="pt-BR">Português (BR)</option><option value="nl">Nederlands</option></select></header><section className="buy-hero"><span className="merged-kicker">GTA VI / NOV 19 2026</span><h1>{t.buy}</h1><p>{t.buyIntro}</p></section><div className="buy-grid">{officialStores.map((store,index)=><a href={store.href} target="_blank" rel="noopener noreferrer" key={store.key} className="buy-store"><span className="buy-icon"><Gamepad2 size={26}/></span><span className="buy-store-name">{t[store.key]}</span><span className="buy-store-detail">{store.detail}</span><span className="buy-store-link">{t.buyCta}<ArrowUpRight size={17}/></span><span className="buy-store-index">0{index+1}</span></a>)}</div><p className="buy-notice"><ShieldCheck size={18}/>{t.buyNotice}</p><nav><Link href="/news">{t.news} ↗</Link><Link href={`/community?lang=${locale}`}>{t.community} ↗</Link><Link href="/pricing">{t.plans} ↗</Link></nav></main>;
}

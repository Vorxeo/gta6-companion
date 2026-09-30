"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import NewsDesk from "@/components/NewsDesk";
import { AmbientCity } from "@/components/Atmosphere";
import { browserLocale, isLocale, type Locale } from "@/lib/i18n";
import { editorialCopy } from "@/lib/editorial";
export default function NewsPage() {
  const [locale,setLocale]=useState<Locale>("en");
  useEffect(()=>{let value=browserLocale(navigator.language);try{const saved=localStorage.getItem("vi-language");if(isLocale(saved))value=saved;}catch{}setLocale(value);},[]);
  return <main className="editorial-page app"><AmbientCity/><title>{`${editorialCopy[locale].news} — GTA VI Companion`}</title><header><Link href="/">← {editorialCopy[locale].back}</Link><select aria-label="Language" value={locale} onChange={e=>setLocale(e.target.value as Locale)}><option value="en">English</option><option value="es">Español</option><option value="pt-BR">Português (BR)</option><option value="nl">Nederlands</option></select></header><NewsDesk locale={locale}/><nav><Link href={`/community?lang=${locale}`}>{editorialCopy[locale].community} ↗</Link><Link href="/buy">{editorialCopy[locale].buy} ↗</Link><Link href="/pricing">{editorialCopy[locale].plans} ↗</Link></nav></main>;
}

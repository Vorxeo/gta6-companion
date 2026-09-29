"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { browserLocale, isLocale, type Locale } from "@/lib/i18n";
import "./pro-gate.css";
const copy = {
  en: {workspace:"Personal workspace",arcade:"Arcade","creator-lab":"Creator Lab",message:"Unlock this experience with Pro.",plans:"View Pro plans"},
  es: {workspace:"Espacio personal",arcade:"Arcade","creator-lab":"Laboratorio creativo",message:"Desbloquea esta experiencia con Pro.",plans:"Ver planes Pro"},
  "pt-BR": {workspace:"Espaço pessoal",arcade:"Fliperama","creator-lab":"Laboratório criativo",message:"Desbloqueie esta experiência com o Pro.",plans:"Ver planos Pro"},
  nl: {workspace:"Persoonlijke werkruimte",arcade:"Arcade","creator-lab":"Creator Lab",message:"Ontgrendel deze ervaring met Pro.",plans:"Bekijk Pro-abonnementen"},
};
export default function ProGate({ feature }: { feature: "workspace" | "arcade" | "creator-lab" }) {
  const [locale,setLocale] = useState<Locale>("en");
  useEffect(() => {
    let language=browserLocale(navigator.language);
    try { const saved=localStorage.getItem("vi-language");if(isLocale(saved))language=saved; } catch {}
    setLocale(language);
  }, []);
  const t=copy[locale];
  return <main className="pro-gate"><Link href="/">← VI Companion</Link><div className="pro-gate-stage">
    <div className="pro-gate-preview" aria-hidden="true"><span>VI</span><div/><div/><div/></div>
    <div className="pro-gate-overlay"><LockKeyhole size={42}/><span>COMPANION PRO</span><h1>{t[feature]}</h1>
      <p>{t.message}</p><Link href="/pricing">{t.plans}<ArrowUpRight size={18}/></Link></div>
  </div></main>;
}

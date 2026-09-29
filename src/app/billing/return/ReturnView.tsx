"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { browserLocale,isLocale,type Locale } from "@/lib/i18n";
const copy={en:{paid:"Payment confirmed. Your Pro access is ready.",processing:"We are confirming your payment.",billing:"Manage billing"},es:{paid:"Pago confirmado. Tu acceso Pro está listo.",processing:"Estamos confirmando tu pago.",billing:"Gestionar facturación"},"pt-BR":{paid:"Pagamento confirmado. Seu acesso Pro está pronto.",processing:"Estamos confirmando seu pagamento.",billing:"Gerenciar cobrança"},nl:{paid:"Betaling bevestigd. Je Pro-toegang is klaar.",processing:"We bevestigen je betaling.",billing:"Facturering beheren"}};
export default function ReturnView({paid}:{paid:boolean}){
  const [locale,setLocale]=useState<Locale>("en");
  useEffect(()=>{let language=browserLocale(navigator.language);try{const saved=localStorage.getItem("vi-language");if(isLocale(saved))language=saved;}catch{}setLocale(language);},[]);
  const t=copy[locale];return <main className="billing-view"><h1>VI Companion Pro</h1><p>{paid?t.paid:t.processing}</p><Link href="/billing">{t.billing} →</Link></main>;
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { browserLocale, isLocale, type Locale } from "@/lib/i18n";
import { cancelSubscription } from "./actions";
const copy={
  en:{back:"Back",title:"Billing",error:"Billing is temporarily unavailable.",canceled:"Renewal canceled.",signIn:"Sign in",active:"Pro access through",noPlan:"No active Pro plan.",plans:"View plans",cancel:"Cancel renewal",ended:"Renewal canceled. Access continues until the paid period ends.",provision:"Payment recorded. Recurring billing is being set up; contact support if it does not appear soon."},
  es:{back:"Volver",title:"Facturación",error:"La facturación no está disponible por ahora.",canceled:"Renovación cancelada.",signIn:"Iniciar sesión",active:"Acceso Pro hasta",noPlan:"No hay un plan Pro activo.",plans:"Ver planes",cancel:"Cancelar renovación",ended:"Renovación cancelada. El acceso continúa hasta el final del periodo pagado.",provision:"Pago registrado. La renovación se está configurando; contacta con soporte si no aparece pronto."},
  "pt-BR":{back:"Voltar",title:"Cobrança",error:"A cobrança está indisponível no momento.",canceled:"Renovação cancelada.",signIn:"Entrar",active:"Acesso Pro até",noPlan:"Nenhum plano Pro ativo.",plans:"Ver planos",cancel:"Cancelar renovação",ended:"Renovação cancelada. O acesso continua até o fim do período pago.",provision:"Pagamento registrado. A renovação está sendo configurada; contate o suporte se não aparecer em breve."},
};
export default function BillingView({signedIn,active,status,currency,interval,end,linked,error,canceled}:{signedIn:boolean;active:boolean;status?:string;currency?:string;interval?:string;end?:string;linked:boolean;error:boolean;canceled:boolean}){
  const [locale,setLocale]=useState<Locale>("en");
  useEffect(()=>{let language=browserLocale(navigator.language);try{const saved=localStorage.getItem("vi-language");if(isLocale(saved))language=saved;}catch{}setLocale(language);},[]);
  const t=copy[locale];
  return <main className="billing-view"><Link href="/">← {t.back} · VI Companion</Link><h1>{t.title}</h1>
    {error&&<p role="alert">{t.error}</p>}{canceled&&<p>{t.canceled}</p>}
    {!signedIn?<p><Link href="/sign-in?next=billing">{t.signIn} →</Link></p>:active?<>
      <p>Companion Pro · {currency} · {interval}</p><p>{t.active}: {end?new Intl.DateTimeFormat(locale,{dateStyle:"long"}).format(new Date(end)):"—"}</p>
      {status==="canceled"?<p>{t.ended}</p>:linked?<form action={cancelSubscription}><button type="submit">{t.cancel}</button></form>:<p>{t.provision}</p>}
    </>:<p>{t.noPlan} <Link href="/pricing">{t.plans} →</Link></p>}
  </main>;
}

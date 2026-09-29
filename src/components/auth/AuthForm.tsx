"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Globe2, Eye, EyeOff } from "lucide-react";
import { browserLocale, isLocale, type Locale } from "@/lib/i18n";
import { authCopy } from "@/lib/auth/copy";
import { submitAuth, type AuthResult } from "@/lib/auth/actions";
import "./auth.css";
export type AuthMode = "signin" | "signup" | "forgot" | "reset";
export default function AuthForm({mode,configured,panel="tracker",next="",confirmationError=false}: {mode:AuthMode;configured:boolean;panel?:string;next?:string;confirmationError?:boolean}) {
  const [locale,setLocale] = useState<Locale>("en");
  const [ready,setReady] = useState(false);
  const [show,setShow] = useState(false);
  const [state,action,pending] = useActionState(submitAuth, {status:"idle"} as AuthResult);
  useEffect(() => {
    let language = browserLocale(navigator.language);
    try { const saved=localStorage.getItem("vi-language"); if(isLocale(saved)) language=saved; } catch {}
    setLocale(language); setReady(true);
  },[]);
  useEffect(() => { document.documentElement.lang=locale; if(ready) try{localStorage.setItem("vi-language",locale);}catch{} },[locale,ready]);
  const t=authCopy[locale];
  const text = mode === "signin" ? t.signinText : mode === "signup" ? t.signupText : mode === "forgot" ? t.forgotText : t.resetText;
  const route = (kind:string) => `/${kind}?panel=${panel}${next?`&next=${encodeURIComponent(next)}`:""}`;
  return <div className="auth-page">
    <title>{`${t[mode]} — VI Companion`}</title>
    <header className="auth-header"><Link href="/" className="auth-brand">VI <span>COMPANION ✦</span></Link><label className="language-switch"><Globe2 size={15}/><select aria-label={t.language} value={locale} onChange={e=>setLocale(e.target.value as Locale)}><option value="en">English</option><option value="es">Español</option><option value="pt-BR">Português (BR)</option><option value="nl">Nederlands</option></select></label></header>
    <main className="auth-main"><section className="auth-story"><span className="eyebrow">{t.eyebrow}</span><h1>{t.intro}</h1><div className="auth-emblem" aria-hidden="true">VI<span>✦</span></div><p><ShieldCheck size={19}/>{t.protect}</p><Link href="/pricing">{t.plans}<ArrowRight size={16}/></Link></section>
      <section className="auth-card"><h2>{t[mode]}</h2><p>{text}</p>
        {!configured && <div className="auth-notice" role="status">{t.unavailable}</div>}
        {confirmationError && <p className="auth-error" role="alert">{t.confirmation}</p>}
        <form action={action}><input type="hidden" name="mode" value={mode}/><input type="hidden" name="panel" value={panel}/><input type="hidden" name="next" value={next}/><fieldset disabled={!configured || pending}>
          {mode !== "reset" && <label>{t.email}<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>}
          {mode !== "forgot" && <label>{mode === "reset" ? t.newPassword : t.password}<div className="auth-password"><input name="password" type={show?"text":"password"} autoComplete={mode === "signin"?"current-password":"new-password"} minLength={mode === "signin"?1:12} maxLength={128} required aria-describedby={mode !== "signin" ? "password-hint":undefined}/><button type="button" aria-label={show?t.hide:t.show} aria-pressed={show} onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>}
          {(mode === "signup" || mode === "reset") && <small id="password-hint">{t.hint}</small>}
          {mode === "signin" && <Link className="auth-forgot" href={route("forgot-password")}>{t.forgotLink}</Link>}
          <button className="auth-submit" type="submit">{pending?t.working:t[mode]}<ArrowRight size={18}/></button>
        </fieldset></form>
        {state.status !== "idle" && <p className={state.status === "sent" || state.status === "updated" ? "auth-notice":"auth-error"} role="status">{t[state.status]}</p>}
        {state.status === "updated" && <Link className="auth-submit" href="/workspace">{t.open}</Link>}
        <p className="auth-switch">{mode === "signin"?t.noAccount:t.haveAccount} <Link href={route(mode === "signin"?"sign-up":"sign-in")}>{mode === "signin"?t.signup:t.signin}</Link></p><p className="auth-local">{t.note}</p><Link className="auth-back" href="/"><ArrowLeft size={14}/>{t.home}</Link>
      </section></main>
  </div>;
}

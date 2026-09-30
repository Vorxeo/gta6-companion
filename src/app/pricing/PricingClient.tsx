"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Sparkles, Globe2, Cloud, Route, Users, Plus } from "lucide-react";
import { Tilt } from "@/components/Atmosphere";
import { browserLocale, isLocale, type Locale } from "@/lib/i18n";
import { prices, formatPrice, pricingCopy, type Currency } from "@/lib/pricing";
import { suggestedCurrency } from "@/lib/currency-choice";
import { startCheckout } from "./actions";
import "./pricing.css";

export default function Pricing({available,brlAvailable,terms,privacy,error,country}: {available:boolean;brlAvailable:boolean;terms:string;privacy:string;error:string;country:string|null}) {
  const [locale, setLocale] = useState<Locale>("en");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [currencyPinned, setCurrencyPinned] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [motion, setMotion] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let language = browserLocale(navigator.language);
    let animate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      const saved = localStorage.getItem("vi-language");
      if (isLocale(saved)) language = saved;
      const preference = localStorage.getItem("vi-motion");
      if (preference === "true" || preference === "false") animate = preference === "true";
    } catch { /* Pricing remains usable without storage. */ }
    setLocale(language);
    let savedCurrency: Currency | null = null;
    try { const saved = localStorage.getItem("vi-currency"); if (saved === "EUR" || saved === "USD" || saved === "BRL") savedCurrency = saved; } catch {}
    setCurrencyPinned(!!savedCurrency);
    setCurrency(savedCurrency || suggestedCurrency(country, language));
    setMotion(animate);
    setReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    if (ready) try { localStorage.setItem("vi-language", locale); } catch { /* Session-only language. */ }
  }, [locale, ready]);
  useEffect(() => {
    if (ready && !currencyPinned) setCurrency(suggestedCurrency(country, locale));
  }, [country, locale, ready, currencyPinned]);
  const changeCurrency = (value: Currency) => {
    setCurrency(value);
    setCurrencyPinned(true);
    try { localStorage.setItem("vi-currency", value); } catch {}
  };
  const t = pricingCopy[locale];
  const price = prices[currency][annual ? "annual" : "monthly"];
  const canCheckout = available && (currency !== "BRL" || brlAvailable);
  const icons = [Cloud, Route, Users];
  return (
    <div className={`pricing-page app ${motion ? "motion-enabled" : "motion-off"}`}>
      <title>{`${t.nav} — GTA VI Companion`}</title>
      <header className="pricing-header">
        <Link href="/" className="pricing-brand" aria-label={t.back}>VI <span>COMPANION</span><span className="pricing-brand-star">✦</span></Link>
        <div className="pricing-header-actions">
          <Link href="/" className="pricing-back"><ArrowLeft size={15}/><span>{t.back}</span></Link>
          <Link href="/billing" className="pricing-back">{t.billingLink}</Link>
          <Link href={`/community?lang=${locale}`} className="pricing-back">{locale==="nl"?"Gemeenschap":locale==="pt-BR"?"Comunidade":locale==="es"?"Comunidad":"Community"}</Link>
          <label className="language-switch"><Globe2 size={15}/><select aria-label={t.language} value={locale} onChange={e => setLocale(e.target.value as Locale)}>
            <option value="en">English</option><option value="es">Español</option><option value="pt-BR">Português (BR)</option><option value="nl">Nederlands</option>
          </select></label>
        </div>
      </header>
      <main className="pricing-main" id="pricing-main">
        <section className="pricing-hero">
          <div className="pricing-orbit" aria-hidden="true"><i/><i/><span>VI</span></div>
          <span className="pricing-kicker"><Sparkles size={14}/>{t.eyebrow}</span>
          <h1>{t.title}<br/><em>{t.accent}</em></h1>
          <p>{t.intro}</p>
        </section>
        <div className="pricing-options">
          <div className="billing-toggle" role="group" aria-label={t.billing}>
            <button aria-pressed={!annual} onClick={() => setAnnual(false)}>{t.monthly}</button>
            <button aria-pressed={annual} onClick={() => setAnnual(true)}>{t.annual}<span>{t.saving}</span></button>
          </div>
          <label className="pricing-currency">{t.currency}<select value={currency} onChange={e => changeCurrency(e.target.value as Currency)}>
            <option value="BRL">BRL · R$</option><option value="USD">USD · $</option><option value="EUR">EUR · €</option>
          </select></label>
        </div>
        <p className="pricing-notice">{t.notice}</p>
        {error && <p role="alert" className="pricing-notice">{t.error}</p>}
        <section className="pricing-plans" aria-label={t.nav}>
          <Tilt className="pricing-tilt"><article className="price-card explorer-card">
            <span className="plan-status"><span/>{t.freeTag}</span>
            <h2>{t.free}</h2><p className="plan-description">{t.freeDesc}</p>
            <div className="plan-price"><strong>{formatPrice(0, currency, locale)}</strong></div>
            <p className="price-detail">{t.forever}</p>
            <Link className="plan-cta free-cta" href={`/community?lang=${locale}`}>{t.freeCta}<ArrowUpRight size={18}/></Link>
            <h3>{t.included}</h3><ul>{t.freeFeatures.map(f => <li key={f}><Check size={17}/>{f}</li>)}</ul>
            <p className="plan-footnote">{t.local}</p>
          </article></Tilt>
          <Tilt className="pricing-tilt"><article className="price-card pro-card">
            <span className="plan-status"><Sparkles size={13}/>{t.proTag}</span>
            <h2>Companion <em>Pro</em></h2><p className="plan-description">{t.proDesc}</p>
            <div className="plan-price" aria-live="polite"><strong>{formatPrice(price, currency, locale)}</strong><span>{annual ? t.perYear : t.perMonth}</span></div>
            <p className="price-detail">{annual ? t.annualNote : t.monthlyNote}</p>
            {currency === "BRL" && <p className="price-detail">{t.brlMethod}</p>}
            <form action={startCheckout} className="pricing-checkout">
              <input type="hidden" name="currency" value={currency}/><input type="hidden" name="interval" value={annual?"annual":"monthly"}/>
              <input type="hidden" name="locale" value={locale}/>
              {canCheckout && <label className="pricing-consent"><input type="checkbox" name="consent" required/>{t.consent}</label>}
              {terms && privacy && <p className="pricing-legal"><a href={terms} target="_blank" rel="noopener noreferrer">{t.terms}</a> · <a href={privacy} target="_blank" rel="noopener noreferrer">{t.privacy}</a></p>}
              <button className="plan-cta pro-cta" type="submit" disabled={!canCheckout}>{t.proCta}<ArrowUpRight size={18}/></button>
              {!available && <p className="pricing-checkout-status">{t.unavailable}</p>}{currency==="BRL" && !brlAvailable && <p className="pricing-checkout-status">{t.brlOnly}</p>}
            </form>
            <h3>{t.planned}</h3><ul>{t.proFeatures.map(f => <li key={f}><Plus size={17}/>{f}</li>)}</ul>
            <p className="plan-footnote">{t.proNote}</p>
          </article></Tilt>
        </section>
        <section className="pricing-comparison">
          <h2>{t.comparison}</h2>
          <div className="comparison-scroll"><table><caption className="sr-only">{t.comparison}</caption><thead><tr><th scope="col">{t.feature}</th><th scope="col">Explorer</th><th scope="col">Pro</th></tr></thead>
            <tbody>{t.rows.map((row,i) => <tr key={row}><th scope="row">{row}</th><td>{i < 4 ? t.now : <span aria-label={t.notIncluded}>—</span>}</td><td><span className={i < 4 ? "" : "planned-pill"}>{i < 4 ? t.now : t.future}</span></td></tr>)}</tbody>
          </table></div>
        </section>
        <section className="pro-roadmap" id="pro-roadmap" tabIndex={-1}>
          <span className="pricing-kicker">{t.roadmapEyebrow}</span><h2>{t.roadmapTitle}</h2>
          <div className="pro-benefits">{t.benefits.map((benefit,i) => { const Icon = icons[i]; return <article key={benefit.title}><div className={`benefit-icon benefit-${i}`}><Icon size={27}/></div><span className="benefit-status">{t.plannedStatus}</span><h3>{benefit.title}</h3><p>{benefit.text}</p></article>; })}</div>
        </section>
        <section className="pricing-faq"><h2>{t.faq}</h2>{t.questions.map(item => <details key={item.q}><summary>{item.q}<Plus size={18}/></summary><p>{item.a}</p></details>)}</section>
        <section className="pricing-end"><Sparkles size={28}/><h2>{t.endTitle}</h2><p>{t.endText}</p><Link href="/#discover" className="plan-cta pro-cta">{t.freeCta}<ArrowUpRight size={18}/></Link></section>
      </main>
      <footer className="pricing-footer"><Link href="/">VI COMPANION</Link><p>{t.footer}</p></footer>
    </div>
  );
}

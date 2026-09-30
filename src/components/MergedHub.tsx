"use client";
import Link from "next/link";
import { ArrowUpRight, ScanSearch, Gamepad2, BookOpen, ShieldCheck, Sparkles, LockKeyhole } from "lucide-react";
import NewsDesk from "./NewsDesk";
import { editorialCopy } from "@/lib/editorial";
import { Tilt } from "./Atmosphere";
import { mergeCopy } from "@/lib/merge-copy";
import type { Locale } from "@/lib/i18n";
export default function MergedHub({locale,isPro=false}: {locale:Locale;isPro?:boolean}) {
  const t=mergeCopy[locale], e=editorialCopy[locale];
  const demoLabel:Record<Locale,string>={en:"Play the free 3D heist demo",es:"Jugar la demo 3D gratis","pt-BR":"Jogar a demo 3D grátis",nl:"Speel de gratis 3D-demo"};
  const cards=[{icon:ScanSearch,number:"01",eyebrow:t.board,title:t.boardTitle,text:t.boardText,link:t.boardLink,href:`/community?lang=${locale}`,external:false},{icon:Gamepad2,number:"02",eyebrow:t.arcade,title:t.arcadeTitle,text:t.arcadeText,link:t.arcadeLink,href:"/arcade",external:false},{icon:BookOpen,number:"03",eyebrow:t.guide,title:t.guideTitle,text:t.guideText,link:t.guideLink,href:"/guide",external:false},{icon:Sparkles,number:"04",eyebrow:t.lab,title:t.labTitle,text:t.labText,link:t.labLink,href:"/creator-lab",external:false}];
  return <section className="merged-hub" id="network"><div className="merged-intro"><span className="merged-kicker">{t.eyebrow}</span><h2>{t.title}</h2><p>{t.intro}</p><span className="merged-side-note">{t.clue}</span></div>
    <div className="merged-grid">{cards.map(card=>{const locked=!isPro&&(card.href==="/arcade"||card.href==="/creator-lab");return <Tilt key={card.number} className="merged-tilt"><article className={`merged-card ${locked?"merged-card-locked":""}`}><div className="merged-card-head"><span>{card.number} / {card.eyebrow}</span>{locked?<LockKeyhole size={25}/>:<card.icon size={25}/>}</div><h3>{card.title}</h3><p>{card.text}</p>{card.external?<a href={card.href} target="_blank" rel="noreferrer">{card.link}<ArrowUpRight size={17}/></a>:<Link href={locked?"/pricing":card.href}>{locked?`Pro · ${card.link}`:card.link}<ArrowUpRight size={17}/></Link>}</article></Tilt>;})}</div>
    <Link className="merged-demo-link" href="/arcade/demo"><Gamepad2 size={18}/>{demoLabel[locale]}<ArrowUpRight size={17}/></Link>
    <NewsDesk locale={locale}/>
    <section className="official-music"><div><span className="merged-kicker">{e.music}</span><h3>{e.musicTitle}</h3><p>{e.musicText}</p><small>{e.musicNote}</small></div><a href="https://www.rockstargames.com/newswire/article/7599a881942544/announcing-grand-theft-auto-vi-the-album-coming-november-19" target="_blank" rel="noopener noreferrer">{e.musicLink}<ArrowUpRight size={17}/></a></section>
    <p className="merged-footnote"><ShieldCheck size={16}/>{t.privateNote}</p>
  </section>;
}

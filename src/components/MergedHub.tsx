"use client";
import Link from "next/link";
import { ArrowUpRight, Newspaper, ScanSearch, Gamepad2, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import CoastRadio from "./CoastRadio";
import { Tilt } from "./Atmosphere";
import { mergeCopy } from "@/lib/merge-copy";
import type { Locale } from "@/lib/i18n";
export default function MergedHub({locale}: {locale:Locale}) {
  const t=mergeCopy[locale];
  const cards=[{icon:Newspaper,number:"01",eyebrow:t.news,title:t.newsTitle,text:t.newsText,link:t.newsLink,href:"https://www.rockstargames.com/newswire?tag_id=729",external:true},{icon:ScanSearch,number:"02",eyebrow:t.board,title:t.boardTitle,text:t.boardText,link:t.boardLink,href:`/community?lang=${locale}`,external:false},{icon:Gamepad2,number:"03",eyebrow:t.arcade,title:t.arcadeTitle,text:t.arcadeText,link:t.arcadeLink,href:"/arcade",external:false},{icon:BookOpen,number:"04",eyebrow:t.guide,title:t.guideTitle,text:t.guideText,link:t.guideLink,href:"/guide",external:false},{icon:Sparkles,number:"05",eyebrow:t.lab,title:t.labTitle,text:t.labText,link:t.labLink,href:"/creator-lab",external:false}];
  return <section className="merged-hub" id="after-dark"><div className="merged-intro"><span className="merged-kicker">{t.eyebrow}</span><h2>{t.title}</h2><p>{t.intro}</p><span className="merged-side-note">{t.clue}</span></div>
    <div className="merged-grid">{cards.map(card=><Tilt key={card.number} className="merged-tilt"><article className="merged-card"><div className="merged-card-head"><span>{card.number} / {card.eyebrow}</span><card.icon size={25}/></div><h3>{card.title}</h3><p>{card.text}</p>{card.external?<a href={card.href} target="_blank" rel="noreferrer">{card.link}<ArrowUpRight size={17}/></a>:<Link href={card.href}>{card.link}<ArrowUpRight size={17}/></Link>}</article></Tilt>)}</div>
    <CoastRadio locale={locale}/>
    <p className="merged-footnote"><ShieldCheck size={16}/>{t.privateNote}</p>
  </section>;
}

"use client";

import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowUpRight,Trophy} from "lucide-react";
import {browserLocale,isLocale,type Locale} from "@/lib/i18n";
import {arcadeCopy} from "@/lib/arcade-copy";

type Entry={name:string;score:number;date:string};
const scoreKey="neon-getaway-godot-local-v1";

function readBoard(key:string):Entry[]{
  try{
    const parsed:unknown=JSON.parse(localStorage.getItem(key)||"[]");
    if(!Array.isArray(parsed))return[];
    return parsed.filter((item):item is Entry=>!!item&&typeof item.name==="string"&&item.name.length<=16&&Number.isInteger(item.score)&&item.score>=0&&item.score<=2000&&typeof item.date==="string").slice(0,10);
  }catch{return[];}
}

export default function ArcadeGame({userId,demo=false}:{userId:string;demo?:boolean}){
  const boardKey=`${scoreKey}:${userId}`;
  const [locale,setLocale]=useState<Locale>("en");
  const [board,setBoard]=useState<Entry[]>([]);
  const [score,setScore]=useState<number|null>(null);
  const [alias,setAlias]=useState("");
  const frame=useRef<HTMLIFrameElement>(null);
  useEffect(()=>{let selected=browserLocale(navigator.language);try{const saved=localStorage.getItem("vi-language");if(isLocale(saved))selected=saved;}catch{}setLocale(selected);setBoard(readBoard(boardKey));},[boardKey]);
  useEffect(()=>{
    const onScore=(event:MessageEvent)=>{
      if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow)return;
      const data=event.data as {source?:unknown;type?:unknown;score?:unknown};
      if(data?.source!=="neon-getaway"||data.type!=="score"||!Number.isInteger(data.score)||typeof data.score!=="number"||data.score<0||data.score>2000)return;
      setScore(data.score);
    };
    window.addEventListener("message",onScore);
    return()=>window.removeEventListener("message",onScore);
  },[]);
  const t=arcadeCopy[locale];
  const credits:Record<Locale,{character:string;cars:string}>={en:{character:"Character",cars:"Cars"},es:{character:"Personaje",cars:"Coches"},"pt-BR":{character:"Personagem",cars:"Carros"},nl:{character:"Personage",cars:"Auto's"}};
  const save=()=>{
    if(score===null||demo)return;
    const name=alias.trim().replace(/[^\p{L}\p{N} _-]/gu,"").slice(0,16);
    if(!name)return;
    const next=[...board,{name,score,date:new Date().toISOString().slice(0,10)}].sort((a,b)=>b.score-a.score).slice(0,10);
    try{localStorage.setItem(boardKey,JSON.stringify(next));setBoard(next);setAlias("");setScore(null);}catch{}
  };
  return <div className="arcade-page heist-page"><header><Link href="/" className="arcade-logo">VI COMPANION ✦</Link><Link href="/" className="arcade-return"><ArrowLeft size={16}/>{t.back}</Link></header><main>
    <div className="heist-heading"><div><span className="merged-kicker">{t.eyebrow}</span><h1>{t.title}</h1><p>{demo?t.demoIntro:t.intro}</p></div><span className="heist-edition">GODOT 4.5 / ORIGINAL 3D</span></div>
    <div className="heist-layout"><section className="heist-stage godot-stage" aria-label={t.title}>
      <iframe ref={frame} title="Neon Getaway Godot 3D" src={`${demo?"/arcade-godot":"/arcade/build"}/index.html?lang=${encodeURIComponent(locale)}`} allow="autoplay; fullscreen" loading="eager"/>
    </section><aside className="heist-side"><div className="heist-side-card"><span className="merged-kicker">{t.contract}</span><h2>{demo?t.demoGoal:t.goal}</h2><p>{t.contractText}</p><p>{t.move}</p><p>{demo?t.demoBoard:t.localBoard}</p>{demo&&<Link className="heist-pro-link" href="/pricing">{t.unlockPro} <ArrowUpRight size={14}/></Link>}</div>
    <div className="heist-side-card heist-board"><div className="heist-board-title"><Trophy size={20}/><h2>{t.leaderboard}</h2></div><small>{t.localBoard}</small>{demo?<Link className="heist-pro-link" href="/pricing">{t.unlockPro} ↗</Link>:<><ol>{board.length?board.map((entry,i)=><li key={`${entry.date}-${i}`}><b>{String(i+1).padStart(2,"0")}</b><span>{entry.name}</span><strong>{entry.score}</strong></li>):<li className="heist-empty">{t.noScores}</li>}</ol>{score!==null&&<div className="heist-save"><input aria-label={t.alias} maxLength={16} placeholder={t.alias} value={alias} onChange={event=>setAlias(event.target.value)}/><button onClick={save}>{t.save} {score}</button></div>}</>}</div></aside></div>
    <p className="heist-disclaimer">{demo?t.demoNote:t.fanNote} <Link href="/community">{t.community} ↗</Link></p>
    <p className="heist-credits">{credits[locale].character}: <a href="https://github.com/gdquest-demos/godot-3d-mannequin" target="_blank" rel="noopener noreferrer">GDQuest, Luciano Muñoz &amp; contributors (CC BY 4.0)</a> · {credits[locale].cars}: <a href="https://kenney.nl/assets/car-kit" target="_blank" rel="noopener noreferrer">Kenney (CC0)</a></p>
  </main></div>;
}

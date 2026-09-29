"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Gamepad2 } from "lucide-react";
import { arcadeCopy } from "@/lib/arcade-copy";
import { browserLocale, isLocale, type Locale } from "@/lib/i18n";
type World={x:number;y:number;px:number;py:number;dx:number;dy:number;policeX:number;policeY:number;carrying:boolean;score:number;remaining:number;running:boolean;last:number};
const initial=():World=>({x:80,y:100,px:290,py:230,dx:460,dy:330,policeX:500,policeY:90,carrying:false,score:0,remaining:75,running:false,last:0});
const clamp=(x:number,max:number)=>Math.max(14,Math.min(max-14,x));
function draw(ctx:CanvasRenderingContext2D,w:World){
  ctx.clearRect(0,0,600,420);ctx.fillStyle="#131d2b";ctx.fillRect(0,0,600,420);
  ctx.fillStyle="#273443";for(let x=0;x<600;x+=100){ctx.fillRect(x+18,0,42,420);}for(let y=0;y<420;y+=105){ctx.fillRect(0,y+24,600,38);}
  for(let x=0;x<600;x+=100)for(let y=0;y<420;y+=105){ctx.fillStyle=(x+y)%3===0?"#43314a":"#34354b";ctx.fillRect(x+64,y+65,32,36);ctx.fillStyle="#ffd3a68c";ctx.fillRect(x+70,y+70,5,7);}
  ctx.strokeStyle="#ddbcb834";ctx.setLineDash([8,10]);for(let x=39;x<600;x+=100){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,420);ctx.stroke();}for(let y=43;y<420;y+=105){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(600,y);ctx.stroke();}ctx.setLineDash([]);
  const circle=(x:number,y:number,r:number,color:string,glow=0)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=glow;ctx.fill();ctx.shadowBlur=0;};
  if(!w.carrying){circle(w.px,w.py,16,"#ffd18c",24);ctx.fillStyle="#423546";ctx.fillRect(w.px-7,w.py-6,14,12);}else{circle(w.dx,w.dy,21,"#9df1d5",30);circle(w.x,w.y-16,5,"#ffd18c",10);}
  circle(w.policeX,w.policeY,13,"#859dff",15);ctx.fillStyle="#fff";ctx.font="bold 12px sans-serif";ctx.fillText("★",w.policeX-6,w.policeY+4);
  circle(w.x,w.y,14,"#ff8fb6",21);ctx.fillStyle="#2c1f3c";ctx.fillRect(w.x-8,w.y-5,16,10);ctx.fillStyle="#f7efff";ctx.font="bold 10px sans-serif";ctx.fillText("VI",w.x-6,w.y+3);
}
export default function ArcadeGame({userId}: {userId:string}){
  const [locale,setLocale]=useState<Locale>("en"),[ready,setReady]=useState(false),[stats,setStats]=useState({score:0,time:75,running:false,ended:false}),[best,setBest]=useState(0);
  const canvas=useRef<HTMLCanvasElement>(null),world=useRef<World>(initial()),keys=useRef(new Set<string>()),frame=useRef(0);
  const t=arcadeCopy[locale];
  useEffect(()=>{let value=browserLocale(navigator.language);try{const saved=localStorage.getItem("vi-language");if(isLocale(saved))value=saved;setBest(Number(localStorage.getItem(`vi-arcade-best:${userId}`)||0)||0);}catch{}setLocale(value);setReady(true);},[userId]);
  useEffect(()=>{const down=(e:KeyboardEvent)=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault();keys.current.add(e.key.toLowerCase());};const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());window.addEventListener("keydown",down);window.addEventListener("keyup",up);return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);cancelAnimationFrame(frame.current);};},[]);
  useEffect(()=>{const ctx=canvas.current?.getContext("2d");if(ctx)draw(ctx,world.current);},[]);
  const start=()=>{world.current=initial();world.current.running=true;world.current.last=performance.now();setStats({score:0,time:75,running:true,ended:false});cancelAnimationFrame(frame.current);const tick=(now:number)=>{
    const w=world.current;if(!w.running)return;const dt=Math.min(.04,(now-w.last)/1000);w.last=now;w.remaining=Math.max(0,w.remaining-dt);
    const k=keys.current;const x=Number(k.has("arrowright")||k.has("d"))-Number(k.has("arrowleft")||k.has("a"));const y=Number(k.has("arrowdown")||k.has("s"))-Number(k.has("arrowup")||k.has("w"));const m=Math.hypot(x,y)||1;w.x=clamp(w.x+x/m*170*dt,600);w.y=clamp(w.y+y/m*170*dt,420);
    const angle=Math.atan2(w.y-w.policeY,w.x-w.policeX);w.policeX=clamp(w.policeX+Math.cos(angle)*65*dt,600);w.policeY=clamp(w.policeY+Math.sin(angle)*65*dt,420);
    if(Math.hypot(w.x-w.policeX,w.y-w.policeY)<25){w.carrying=false;w.x=80;w.y=100;w.policeX=500;w.policeY=90;}
    if(!w.carrying&&Math.hypot(w.x-w.px,w.y-w.py)<29)w.carrying=true;
    if(w.carrying&&Math.hypot(w.x-w.dx,w.y-w.dy)<33){w.score++;w.carrying=false;w.px=100+((w.score*131)%400);w.py=70+((w.score*71)%250);w.dx=100+((w.score*203)%400);w.dy=70+((w.score*121)%250);}
    if(w.remaining===0||w.score>=5){w.running=false;setStats({score:w.score,time:Math.ceil(w.remaining),running:false,ended:true});if(w.score>best){setBest(w.score);try{localStorage.setItem(`vi-arcade-best:${userId}`,String(w.score));}catch{}}}
    else {setStats(current => current.score === w.score && current.time === Math.ceil(w.remaining) ? current : {score:w.score,time:Math.ceil(w.remaining),running:true,ended:false});frame.current=requestAnimationFrame(tick);}const ctx=canvas.current?.getContext("2d");if(ctx)draw(ctx,w);
  };frame.current=requestAnimationFrame(tick);};
  const touch=(key:string,press:boolean)=>{if(press)keys.current.add(key);else keys.current.delete(key);};
  return <div className="arcade-page"><header><Link href="/" className="arcade-logo">VI COMPANION ✦</Link><Link href="/" className="arcade-return"><ArrowLeft size={16}/>{t.back}</Link></header><main><span className="merged-kicker">{t.eyebrow}</span><h1>{t.title}</h1><p>{t.intro}</p><div className="arcade-score"><span>{t.delivered} <strong>{stats.score}/5</strong></span><span>{t.time} <strong>{stats.time}s</strong></span><span>{t.best} <strong>{best}</strong></span></div><div className="arcade-canvas"><canvas ref={canvas} width={600} height={420} role="img" aria-label={t.intro}/>{!stats.running&&<div className="arcade-overlay"><Gamepad2 size={38}/><h2>{stats.ended?(stats.score>=5?t.win:t.lose):t.goal}</h2><button onClick={start} disabled={!ready}>{stats.ended?t.restart:t.start}<ArrowUpRight size={18}/></button></div>}</div><div className="arcade-hints"><p>{t.move}</p><p>{stats.running?(world.current.carrying?t.drop:t.pickup):t.goal}</p></div><div className="arcade-touch" aria-label={t.move}><button onPointerDown={()=>touch("arrowup",true)} onPointerUp={()=>touch("arrowup",false)} onPointerCancel={()=>touch("arrowup",false)}>↑</button><div>{[["arrowleft","←"],["arrowdown","↓"],["arrowright","→"]].map(([key,label])=><button key={key} onPointerDown={()=>touch(key,true)} onPointerUp={()=>touch(key,false)} onPointerCancel={()=>touch(key,false)}>{label}</button>)}</div></div></main></div>;
}

"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { mergeCopy } from "@/lib/merge-copy";
import type { Locale } from "@/lib/i18n";
type Sound = { context: AudioContext; gain: GainNode; voices: OscillatorNode[]; timer: ReturnType<typeof setInterval> };
export default function CoastRadio({locale}: {locale:Locale}) {
  const t=mergeCopy[locale];
  const [station,setStation]=useState<0|1>(0), [playing,setPlaying]=useState(false), [volume,setVolume]=useState(45);
  const sound=useRef<Sound|null>(null);
  const stop=()=>{const current=sound.current; if(!current) return; clearInterval(current.timer); current.voices.forEach(v=>{try{v.stop();}catch{}}); void current.context.close(); sound.current=null; setPlaying(false);};
  useEffect(()=>{const onHide=()=>{if(document.hidden) stop();}; const onFocus=(event:Event)=>{if((event as CustomEvent<string>).detail!=="radio") stop();};document.addEventListener("visibilitychange",onHide);window.addEventListener("vi-audio-focus",onFocus);return()=>{document.removeEventListener("visibilitychange",onHide);window.removeEventListener("vi-audio-focus",onFocus);stop();};},[]);
  const start=(next:0|1)=>{
    stop();
    try {
      const context=new AudioContext();
      const gain=context.createGain();gain.gain.value=volume/100*0.12;gain.connect(context.destination);
      const filter=context.createBiquadFilter();filter.type="lowpass";filter.frequency.value=next===0?1400:900;filter.connect(gain);
      const voices=["sine","triangle","sine","sine"].map((kind,i)=>{const voice=context.createOscillator();voice.type=kind as OscillatorType;const level=context.createGain();level.gain.value=i===0?0.65:i===3?0.11:0.25;voice.connect(level);level.connect(filter);voice.start();return voice;});
      const chords=next===0?[[110,220,277,440],[98,196,247,392],[130.8,261.6,329.6,523.2],[87.3,174.6,220,349.2]]:[[82.4,164.8,196,329.6],[92.5,185,220,370],[73.4,146.8,174.6,293.6],[82.4,164.8,196,329.6]];
      let step=0; const advance=()=>{const values=chords[step++%chords.length];voices.forEach((voice,i)=>voice.frequency.setTargetAtTime(values[i],context.currentTime,.13));}; advance();
      const timer=setInterval(advance,next===0?2800:2300);sound.current={context,gain,voices,timer};setStation(next);setPlaying(true);window.dispatchEvent(new CustomEvent("vi-audio-focus",{detail:"radio"}));void context.resume();
    } catch { stop(); }
  };
  return <section className="coast-radio" aria-label={t.radio}>
    <div><span className="merged-kicker">{t.radio}</span><h3>{t.original}</h3></div>
    <div className="radio-controls"><div role="group" aria-label={t.station}><button aria-pressed={station===0} onClick={()=>playing?start(0):setStation(0)}>{t.sunsetFm}</button><button aria-pressed={station===1} onClick={()=>playing?start(1):setStation(1)}>{t.nightDrive}</button></div>
    <button className="radio-play" onClick={()=>playing?stop():start(station)} aria-label={playing?t.pause:t.play}>{playing?<Pause size={17}/>:<Play size={17}/>}<span>{playing?t.pause:t.play}</span></button>
    <label className="radio-volume"><Volume2 size={16}/><span className="sr-only">{t.volume}</span><input aria-label={t.volume} type="range" min="0" max="100" value={volume} onChange={e=>{const value=Number(e.target.value);setVolume(value);if(sound.current)sound.current.gain.gain.value=value/100*.12;}}/></label></div>
  </section>;
}

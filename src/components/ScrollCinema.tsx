"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { Messages } from "@/lib/i18n";

export function ScrollCinema({ motion, t }: { motion: boolean; t: Messages }) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const onFocus = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "scene") return;
      if (video.current) video.current.muted = true;
      setSound(false);
    };
    window.addEventListener("vi-audio-focus", onFocus);
    return () => window.removeEventListener("vi-audio-focus", onFocus);
  }, []);

  useEffect(() => {
    const root = section.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin: "700px" });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = section.current, v = video.current;
    if (!motion) { v?.pause(); return; }
    if (!root || !v || !near || failed) return;
    let frame = 0, target = 0, visible = false, last = 0;
    v.pause();
    v.playbackRate = 0.8;
    v.preservesPitch = true;
    const seek = (now: number) => {
      frame = requestAnimationFrame(seek);
      const elapsed = Math.min(0.06, Math.max(0, (now - (last || now)) / 1000));
      last = now;
      if (!visible || document.hidden || !Number.isFinite(v.duration)) { v.pause(); return; }
      const delta = target - v.currentTime;
      if (delta > 0.09) {
        // Native playback keeps dialogue and picture in sync and never races to a distant scroll target.
        if (v.paused) void v.play().catch(() => { v.muted = true; setSound(false); });
      } else if (delta < -0.09 && !v.seeking) {
        v.pause();
        v.currentTime = Math.max(target, v.currentTime - elapsed * 0.8);
      } else v.pause();
    };
    const update = () => {
      const rect = root.getBoundingClientRect();
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
      const p = Math.max(0, Math.min(1, -rect.top / Math.max(1, root.offsetHeight - window.innerHeight)));
      target = p * (Number.isFinite(v.duration) ? Math.max(0, v.duration - 0.05) : 0);
      root.style.setProperty("--scene-scale", String(1.08 - p * 0.06));
      root.style.setProperty("--scene-rotation", `${1.2 - p * 2.4}deg`);
    };
    const slowWheel = (event: WheelEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.top >= window.innerHeight || rect.bottom <= 0 || event.ctrlKey || event.defaultPrevented) return;
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (pixels > 0 && Number.isFinite(v.duration) && rect.bottom <= innerHeight + 140 && v.currentTime < v.duration - 0.25) {
        event.preventDefault();
        if (rect.bottom > innerHeight) window.scrollBy(0, rect.bottom - innerHeight);
        return;
      }
      if (Math.abs(pixels) <= 55) return;
      event.preventDefault();
      window.scrollBy(0, Math.sign(pixels) * 55);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("wheel", slowWheel, { passive: false });
    v.addEventListener("loadedmetadata", update);
    update();
    frame = requestAnimationFrame(seek);
    return () => {
      cancelAnimationFrame(frame);
      v.pause();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("wheel", slowWheel);
      v.removeEventListener("loadedmetadata", update);
      root.style.removeProperty("--scene-scale");
      root.style.removeProperty("--scene-rotation");
    };
  }, [motion, near, failed]);

  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    v.muted = sound;
    v.volume = 0.55;
    setSound(!sound);
    if (sound) return;
    // The click authorizes native sound playback; the scroll loop controls when to pause.
    void v.play().catch(() => { v.muted = true; setSound(false); });
  };

  return (
    <>
      <div className="scene-caption">
        <span>{motion ? t.videoScroll : t.videoControls}</span>
        <div className="scene-actions">
          <a href="#cinema-end">{t.skipCinema} ↓</a>
        </div>
      </div>
      <section id="cinema" ref={section}
        className={`scroll-scene ${motion && !failed ? "scroll-scene-active" : ""}`}
        aria-label={t.cinemaLabel}>
        <div className="scroll-scene-sticky">
          <video ref={video}
            src={near && motion ? "/media/leonida-scroll.mp4" : undefined}
            poster="/media/leonida-scene.jpg"
            preload="auto" muted={!sound} playsInline controls={false}
            disablePictureInPicture disableRemotePlayback tabIndex={-1}
            onError={() => setFailed(true)} aria-label={t.videoLabel} />
          <button className="scene-sound" type="button" onClick={toggleSound} aria-pressed={sound} disabled={!near || failed || !motion}>
            {sound ? <Volume2 size={16}/> : <VolumeX size={16}/>}
            {sound ? t.soundOff : t.soundOn}
          </button>
        </div>
      </section>
      <div className="scene-caption" id="cinema-end" tabIndex={-1}>
        <span role={failed ? "status" : undefined}>{failed ? t.videoError : t.officialArt}</span>
        <a href="https://www.rockstargames.com/VI/media/videos" target="_blank" rel="noreferrer">{t.original} ↗</a>
      </div>
    </>
  );
}

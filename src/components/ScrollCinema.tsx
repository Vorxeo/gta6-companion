"use client";
import { useEffect, useRef, useState } from "react";
import type { Messages } from "@/lib/i18n";

export function ScrollCinema({ motion, t }: { motion: boolean; t: Messages }) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);

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
    if (!root || !v || !motion || !near || failed) return;
    let frame = 0, target = 0, visible = false;
    v.pause();
    const seek = () => {
      frame = 0;
      if (!visible || v.seeking || !Number.isFinite(v.duration)) return;
      const delta = target - v.currentTime;
      if (Math.abs(delta) > 0.025) {
        // Short keyframe intervals keep bidirectional scrubbing responsive.
        v.currentTime = Math.abs(delta) < 0.08 ? target : v.currentTime + delta * 0.3;
      }
    };
    const schedule = () => {
      if (!frame && visible) frame = requestAnimationFrame(seek);
    };
    const update = () => {
      const rect = root.getBoundingClientRect();
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
      const p = Math.max(0, Math.min(1, -rect.top / Math.max(1, root.offsetHeight - window.innerHeight)));
      target = p * (Number.isFinite(v.duration) ? Math.max(0, v.duration - 0.05) : 0);
      root.style.setProperty("--scene-scale", String(1.08 - p * 0.06));
      root.style.setProperty("--scene-rotation", `${1.2 - p * 2.4}deg`);
      schedule();
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    v.addEventListener("loadedmetadata", update);
    v.addEventListener("seeked", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      v.removeEventListener("loadedmetadata", update);
      v.removeEventListener("seeked", schedule);
      root.style.removeProperty("--scene-scale");
      root.style.removeProperty("--scene-rotation");
    };
  }, [motion, near, failed]);

  return (
    <>
      <div className="scene-caption">
        <span>{motion ? t.videoScroll : t.videoControls}</span>
        <a href="#cinema-end">{t.skipCinema} ↓</a>
      </div>
      <section id="cinema" ref={section}
        className={`scroll-scene ${motion && !failed ? "scroll-scene-active" : ""}`}
        aria-label={t.cinemaLabel}>
        <div className="scroll-scene-sticky">
          <video ref={video}
            src={near && motion ? "/media/leonida-scroll.mp4" : undefined}
            poster="/media/leonida-scene.jpg"
            preload="auto" muted playsInline controls={false}
            disablePictureInPicture disableRemotePlayback tabIndex={-1}
            onError={() => setFailed(true)} aria-label={t.videoLabel} />
        </div>
      </section>
      <div className="scene-caption" id="cinema-end" tabIndex={-1}>
        <span role={failed ? "status" : undefined}>{failed ? t.videoError : t.officialArt}</span>
        <a href="https://www.rockstargames.com/VI/media/videos" target="_blank" rel="noreferrer">{t.original} ↗</a>
      </div>
    </>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { Messages } from "@/lib/i18n";
export function ScrollCinema({ motion, t }: { motion: boolean; t: Messages }) {
  const section = useRef<HTMLElement>(null),
    video = useRef<HTMLVideoElement>(null),
    [progress, setProgress] = useState(0),
    [failed, setFailed] = useState(false),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const root = section.current,
      v = video.current;
    if (v && v.readyState >= 1) setLoaded(true);
    if (!root || !v || !motion) return;
    v.pause();
    let frame = 0;
    let target = 0;
    const seek = () => {
      frame = 0;
      if (
        Number.isFinite(v.duration) &&
        v.duration > 0 &&
        !v.seeking &&
        Math.abs(v.currentTime - target) > 0.06
      )
        v.currentTime = target;
    };
    const update = () => {
      const rect = root.getBoundingClientRect();
      const p = Math.max(
        0,
        Math.min(
          1,
          -rect.top / Math.max(1, root.offsetHeight - window.innerHeight),
        ),
      );
      setProgress(p);
      target =
        p * (Number.isFinite(v.duration) ? Math.max(0, v.duration - 0.05) : 0);
      if (!frame) frame = requestAnimationFrame(seek);
    };
    const finish = () => {
      if (Math.abs(v.currentTime - target) > 0.06 && !frame)
        frame = requestAnimationFrame(seek);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    v.addEventListener("loadedmetadata", update);
    v.addEventListener("seeked", finish);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      v.removeEventListener("loadedmetadata", update);
      v.removeEventListener("seeked", finish);
    };
  }, [motion]);
  const active = motion;
  return (
    <section
      id="cinema"
      ref={section}
      className={`cinema ${active ? "" : "cinema-static"}`}
      aria-label={t.cinemaLabel}
    >
      <div className="cinema-sticky">
        <video
          ref={video}
          src="/media/gtavi-cover.mp4"
          poster="/media/leonida-poster.jpg"
          preload="auto"
          muted
          playsInline
          controls={!active}
          onLoadedMetadata={() => setLoaded(true)}
          onError={() => setFailed(true)}
          aria-label={t.videoLabel}
        />
        <div className="cinema-shade" />
        <div className="cinema-top">
          <span>{t.officialArt}</span>
          <a
            href="https://www.rockstargames.com/VI/media/videos"
            target="_blank"
            rel="noreferrer"
          >
            {t.original} <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="cinema-title">
          <span className="eyebrow">{t.cinemaEyebrow}</span>
          <h2>
            {progress < 0.33 ? (
              <>
                {t.cinema1}
                <br />
                <em>{t.cinema1b}</em>
              </>
            ) : progress < 0.66 ? (
              <>
                {t.cinema2}
                <br />
                <em>{t.cinema2b}</em>
              </>
            ) : (
              <>
                {t.cinema3}
                <br />
                <em>{t.cinema3b}</em>
              </>
            )}
          </h2>
          <p>
            {failed
              ? t.videoError
              : !loaded
                ? t.videoLoading
                : active
                  ? t.videoScroll
                  : t.videoControls}
          </p>
        </div>
        <a className="cinema-skip" href="#discover">
          {t.skipCinema} ↑
        </a>
        <div className="cinema-bottom">
          <span>
            <ArrowDown size={14} /> {active ? t.scrollExplore : t.playback}
          </span>
          <div className="cinema-progress">
            <i style={{ transform: `scaleX(${progress})` }} />
          </div>
          <span>
            {String(Math.round(progress * 100)).padStart(2, "0")} / 100
          </span>
        </div>
      </div>
    </section>
  );
}

"use client";
import { useRef, type ReactNode, type CSSProperties } from "react";
export function Tilt({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      style={style}
      onPointerMove={(e) => {
        if (
          e.pointerType === "touch" ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5,
          y = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.setProperty("--art-x", `${x * 9}px`);
        e.currentTarget.style.setProperty("--art-y", `${y * 7}px`);
        e.currentTarget.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
        e.currentTarget.style.setProperty("--my", `${(y + 0.5) * 100}%`);
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--art-x", "0px");
        ref.current?.style.setProperty("--art-y", "0px");
      }}
    >
      {children}
    </div>
  );
}
export function AmbientCity() {
  return <div className="ambient-city" aria-hidden="true">
    <div className="ambient-city-glow" />
    <div className="ambient-city-skyline" />
    <div className="ambient-city-road"><div className="ambient-city-lanes" /></div>
    <div className="ambient-city-sign"><span>VICE CITY</span><strong>VI</strong></div>
    <div className="ambient-city-palm ambient-city-palm-left" />
    <div className="ambient-city-palm ambient-city-palm-right" />
  </div>;
}
export function Skyline() {
  return (
    <div className="city" aria-hidden="true">
      <div className="sun" />
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="skyline">
        {Array.from({ length: 24 }, (_, i) => (
          <i
            key={i}
            style={
              {
                "--h": `${35 + ((i * 47) % 130)}px`,
                "--w": `${18 + ((i * 13) % 32)}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="water" />
      <div className="road" />
      {[0, 1, 2].map((i) => (
        <div className={`palm palm-${i}`} key={i}>
          <div className="trunk" />
          {Array.from({ length: 7 }, (_, j) => (
            <i
              key={j}
              style={{ "--a": `${j * 28 - 85}deg` } as CSSProperties}
            />
          ))}
        </div>
      ))}
      <div className="city-grain" />
    </div>
  );
}

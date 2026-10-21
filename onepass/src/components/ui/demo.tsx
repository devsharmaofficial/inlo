"use client";

import * as React from "react";
import { HoloCard, type HoloCardHandle } from "@/components/ui/holo-card";

/* Live controls (21st Demo Controls). */
const settings = {
  maxTilt: 14,
  foil: 1,
};

/* Geist + Geist Mono from Google Fonts */
function useGeist() {
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("geist-font")) return;
    const l = document.createElement("link");
    l.id = "geist-font";
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@500;600&display=swap";
    document.head.appendChild(l);
  }, []);
}

export default function HoloCardDemo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  useGeist();
  const card = React.useRef<HoloCardHandle>(null);
  const [shown, setShown] = React.useState(false);
  const [needsMotion, setNeedsMotion] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const DOE = (typeof DeviceOrientationEvent !== "undefined" ? DeviceOrientationEvent : undefined) as unknown as
        | { requestPermission?: unknown }
        | undefined;
      if (window.matchMedia("(hover: none)").matches && typeof DOE?.requestPermission === "function") {
        setNeedsMotion(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const pill =
    "h-8 rounded-full px-3.5 text-[13px] font-medium outline-none transition-transform active:scale-[.97] focus-visible:ring-2 focus-visible:ring-[#1C382C] cursor-pointer";

  return (
    <div
      className="flex min-h-[500px] w-full flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10"
      style={{
        fontFamily: "Geist, var(--font-sans), -apple-system, BlinkMacSystemFont, Inter, 'Segoe UI', Roboto, sans-serif",
        /* subtle dot grid */
        backgroundColor: "#F7F7F2",
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,.07) 0 1px, transparent 1.4px)",
        backgroundSize: "20px 13px",
        backgroundPosition: "-6px -1px",
      }}
    >
      <HoloCard
        ref={card}
        maxTilt={s.maxTilt}
        foil={s.foil}
        onReveal={setShown}
        holder="Aryan Sharma"
        number="INLO 2026 8491 0428"
        expires="10 CREDITS"
        tier="Titanium Pass"
        cardType="pass"
      />

      <p
        className="m-0 mt-2 max-w-[380px] text-center text-[13px] leading-[18px] tracking-[-0.01em]"
        style={{ color: "rgba(60,60,67,.7)" }}
      >
        Move the cursor over the pass or tilt your phone. Drag to spin, tap to flip for the instant check-in QR code.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => card.current?.flip()}
          className={pill}
          style={{ background: "#1C382C", color: "#fff" }}
        >
          {shown ? "Flip to Pass Front" : "Flip for QR Code"}
        </button>
        {needsMotion && (
          <button
            type="button"
            onClick={async () => {
              if (await card.current?.enableMotion()) setNeedsMotion(false);
            }}
            className={pill}
            style={{ background: "rgba(118,118,128,.12)", color: "#1C382C" }}
          >
            Use motion
          </button>
        )}
      </div>
    </div>
  );
}

export { HoloCardDemo };

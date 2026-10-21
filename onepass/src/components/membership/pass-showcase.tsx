"use client";

import * as React from "react";
import { Sparkles, RotateCw, Eye, EyeOff, ShieldCheck, Zap, Smartphone } from "lucide-react";
import { HoloCard, type HoloCardHandle } from "@/components/ui/holo-card";
import { Badge } from "@/components/ui/badge";

export function PassShowcase() {
  const cardRef = React.useRef<HoloCardHandle>(null);
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

  return (
    <section className="relative overflow-hidden rounded-[--radius-2xl] border-2 border-[--color-forest]/30 bg-gradient-to-br from-[#1A3327] via-[#10221B] to-[#0A1612] text-white p-8 sm:p-12 shadow-xl">
      {/* Background radial glows */}
      <div
        className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[--color-accent]/15 blur-[90px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-[--color-forest]/30 blur-[90px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left column: Context & Benefits */}
        <div className="lg:col-span-7 space-y-5">
          <Badge variant="accent" className="font-[750] gap-1 px-3 py-1 text-xs">
            <Sparkles size={12} className="text-amber-800" />
            The Inlo Pass Standard
          </Badge>

          <h2 className="text-display text-3xl sm:text-4xl font-[800] text-white tracking-tight">
            One pass for every court, pool, gym &amp; studio.
          </h2>

          <p className="text-body text-white/80 leading-relaxed text-sm sm:text-base">
            Every Inlo credit pack issues a cryptographic Titanium Pass. Replaces fragmented membership cards,
            registration paperwork, and front-desk friction across Bengaluru with a unified 2-second check-in standard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-[--radius-md] bg-white/5 border border-white/10">
              <Zap size={16} className="text-[--color-accent] mb-1.5" />
              <p className="text-xs font-[700] text-white">Instant Check-in</p>
              <p className="text-[11px] text-white/60">Single-use dynamic token</p>
            </div>
            <div className="p-3.5 rounded-[--radius-md] bg-white/5 border border-white/10">
              <ShieldCheck size={16} className="text-[--color-accent] mb-1.5" />
              <p className="text-xs font-[700] text-white">Zero Lock-In</p>
              <p className="text-[11px] text-white/60">Credits never auto-renew</p>
            </div>
            <div className="p-3.5 rounded-[--radius-md] bg-white/5 border border-white/10">
              <Sparkles size={16} className="text-[--color-accent] mb-1.5" />
              <p className="text-xs font-[700] text-white">Pearl Titanium</p>
              <p className="text-[11px] text-white/60">Thin-film foil hologram</p>
            </div>
          </div>

          {/* Interactive controls */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5 text-xs">
            <span className="text-white/50 text-[11px] uppercase tracking-wider mr-1">
              Interact:
            </span>
            <button
              type="button"
              onClick={() => cardRef.current?.flip()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-[600] transition-colors cursor-pointer border border-white/15"
            >
              <RotateCw size={13} />
              Flip Pass
            </button>
            <button
              type="button"
              onClick={() => cardRef.current?.reveal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-[600] transition-colors cursor-pointer border border-white/15"
            >
              {shown ? <EyeOff size={13} /> : <Eye size={13} />}
              {shown ? "Hide Pass ID" : "Reveal Pass ID"}
            </button>
            {needsMotion && (
              <button
                type="button"
                onClick={async () => {
                  if (await cardRef.current?.enableMotion()) setNeedsMotion(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-[600] transition-colors cursor-pointer border border-white/15"
              >
                <Smartphone size={13} />
                Enable Gyro Motion
              </button>
            )}
          </div>
        </div>

        {/* Right column: Interactive HoloCard */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full flex justify-center py-2">
            <HoloCard
              ref={cardRef}
              holder="Aryan Sharma"
              number="INLO 2026 8491 0428"
              expires="50 CREDITS"
              cvv="842"
              tier="Titanium Pass"
              cardType="pass"
              onReveal={setShown}
              maxTilt={16}
              foil={1.15}
            />
          </div>
          <p className="text-[11px] text-white/50 text-center mt-3 font-mono">
            Hover to tilt with light · Drag to spin · Tap to flip
          </p>
        </div>
      </div>
    </section>
  );
}

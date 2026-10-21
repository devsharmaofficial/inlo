"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Zap, RotateCw, Eye, EyeOff, Smartphone } from "lucide-react";
import { HoloCard, type HoloCardHandle } from "@/components/ui/holo-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

interface AccountPassHeroProps {
  user: {
    id: string;
    fullName?: string;
    email?: string;
  } | null;
  balance: number;
  balanceInr: number;
}

export function AccountPassHero({ user, balance, balanceInr }: AccountPassHeroProps) {
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

  const memberName = user?.fullName || "Aryan Sharma";
  // Generate a formatted 16-character pass ID
  const passDigits = user
    ? user.id.replace(/-/g, "").padEnd(12, "0").slice(0, 8).toUpperCase()
    : "84910428";
  const passId = `INLO 2026 ${passDigits.slice(0, 4)} ${passDigits.slice(4, 8)}`;
  const securityPin = `${((Math.abs(balance) * 43 + 317) % 900) + 100}`;

  return (
    <div className="relative overflow-hidden rounded-[--radius-2xl] border-2 border-[--color-forest]/30 bg-gradient-to-br from-[#183126] via-[#12241D] to-[#0A1612] text-white p-6 sm:p-10 shadow-2xl">
      {/* Subtle decorative glow accents */}
      <div
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[--color-accent]/15 blur-[80px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[--color-forest]/30 blur-[80px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Balances, Status, and Direct CTA */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[--radius-pill] bg-white/10 text-white text-xs font-[700] backdrop-blur-md border border-white/15">
              <Sparkles size={12} className="text-[--color-accent]" />
              Inlo Titanium Pass · Active
            </span>
            <span className="text-xs text-white/60 font-mono">
              {user ? `Pass: inlo-${user.id.slice(0, 8)}` : "Demo Mode: user-member-1"}
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-white/70 font-[650] mb-1">
              Available Booking Credits
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-display text-5xl sm:text-6xl font-[800] text-white tracking-tight tabular-nums">
                {balance}
              </span>
              <span className="text-xl font-[700] text-[--color-accent]">
                credits
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/80 font-[500] mt-1.5">
              Estimated value: <strong className="text-white font-[700]">{formatINR(balanceInr)}</strong> · Locked at ₹70 / credit
            </p>
          </div>

          {/* Pass Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" variant="primary" className="font-[700] gap-1.5 shadow-md">
              <Link href={ROUTES.membership}>
                <Zap size={16} className="fill-current" />
                Buy more credits
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white/10 text-white border-white/25 hover:bg-white/20 font-[600]"
            >
              <Link href={ROUTES.bookings}>View passes</Link>
            </Button>
          </div>

          {/* Interactive Card Micro-Controls */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/50 text-[11px] uppercase tracking-wider mr-1">
              Pass Controls:
            </span>
            <button
              type="button"
              onClick={() => cardRef.current?.flip()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-[600] transition-colors cursor-pointer border border-white/10"
            >
              <RotateCw size={13} />
              Flip Pass
            </button>
            <button
              type="button"
              onClick={() => cardRef.current?.reveal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-[600] transition-colors cursor-pointer border border-white/10"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-[600] transition-colors cursor-pointer border border-white/10"
              >
                <Smartphone size={13} />
                Enable 3D Motion
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Holographic Pearl Titanium Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full flex justify-center py-2">
            <HoloCard
              ref={cardRef}
              holder={memberName}
              number={passId}
              expires={`${balance} CREDITS`}
              cvv={securityPin}
              tier="Titanium Pass"
              cardType="pass"
              onReveal={setShown}
              maxTilt={16}
              foil={1.1}
            />
          </div>
          <p className="text-[11px] text-white/50 text-center mt-3 font-mono">
            Hover to tilt · Drag to spin · Tap to flip
          </p>
        </div>
      </div>
    </div>
  );
}

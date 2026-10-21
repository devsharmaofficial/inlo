"use client";

import * as React from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { QrCode as QrIcon, RotateCw, Sparkles, CheckCircle2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  HoloCard — Pearl titanium holographic sports & wellness pass.     */
/*  Tilts with the cursor or phone gyro, spins with 3D inertia,        */
/*  flips on tap to reveal the scannable cryptographic QR code.        */
/*  Supports both sports Pass mode (default) and classic Bank mode.    */
/* ------------------------------------------------------------------ */

export type HoloCardHandle = {
  flip: () => void;
  reveal: (show?: boolean) => void;
  /** iOS asks for permission before motion can be read; call this from a tap */
  enableMotion: () => Promise<boolean>;
};

export type HoloCardProps = {
  holder?: string;
  /** Pass number / member identifier */
  number?: string;
  /** Available credits or validity text */
  expires?: string;
  /** Pass verification security code */
  cvv?: string;
  /** Tier title: e.g. "Titanium Pass", "All-Access Pass" */
  tier?: string;
  /** Custom logo for top left */
  logo?: React.ReactNode;
  /** Custom network mark for bottom right */
  network?: React.ReactNode;
  /** Max tilt in degrees. Default 14. */
  maxTilt?: number;
  /** 0–1.5, strength of the hologram. Default 1. */
  foil?: number;
  /** Follow phone gyro where allowed. Default true. */
  motion?: boolean;
  onFlip?: (side: "front" | "back") => void;
  onReveal?: (shown: boolean) => void;
  className?: string;

  /** "pass" (default sports access pass) or "bank" (traditional payment card) */
  cardType?: "pass" | "bank";
  holderLabel?: string;
  expiresLabel?: string;
  cvvLabel?: string;
  backNote?: string;
  qrValue?: string;
  activities?: string[];
  city?: string;
};

const INK = "#14251D";
const FONT = "var(--font-sans), Geist, -apple-system, BlinkMacSystemFont, Inter, 'Segoe UI', Roboto, sans-serif";
const MONO = "var(--font-mono), 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9 .02' numOctaves='2' seed='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const CSS = `
.hc-face{position:absolute;inset:0;border-radius:20px;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;color:${INK};
  background:linear-gradient(135deg,#ffffff 0%,#f0f3f1 35%,#fafbf9 60%,#e4ebe6 100%);
  box-shadow:inset 0 0 0 .5px rgba(20,37,29,.1),inset 0 1px 0 rgba(255,255,255,.95)}
.hc-layer{position:absolute;pointer-events:none}
.hc-grain{inset:0;opacity:.28;mix-blend-mode:soft-light;background-image:${GRAIN};background-size:200px 200px}
.hc-film{inset:-30%;mix-blend-mode:multiply;opacity:calc(var(--ho,.6) * var(--foil,1));
  background:linear-gradient(115deg,#ffd9ec 0%,#ffe6cf 12%,#fff6c9 22%,#d4f7e4 34%,#c9ecff 46%,#d9d4ff 58%,#f6d0ff 70%,#ffd9ec 82%,#ffe6cf 100%);
  background-size:300% 300%;background-position:var(--hx,50%) var(--hy,50%);
  -webkit-mask-image:radial-gradient(85% 110% at var(--mx,50%) var(--my,50%),#000 0%,rgba(0,0,0,.55) 50%,rgba(0,0,0,.15) 85%);
  mask-image:radial-gradient(85% 110% at var(--mx,50%) var(--my,50%),#000 0%,rgba(0,0,0,.55) 50%,rgba(0,0,0,.15) 85%)}
.hc-film2{inset:-30%;mix-blend-mode:color;opacity:calc(var(--ho,.6) * .55 * var(--foil,1));
  background:conic-gradient(from var(--ca,0deg) at var(--mx,50%) var(--my,50%),#ff9ad5,#ffc58f,#fff08f,#9ff0c6,#8fd6ff,#b8a6ff,#ff9ad5);
  -webkit-mask-image:radial-gradient(60% 80% at var(--mx,50%) var(--my,50%),#000,transparent 75%);
  mask-image:radial-gradient(60% 80% at var(--mx,50%) var(--my,50%),#000,transparent 75%)}
.hc-lines{inset:0;mix-blend-mode:soft-light;opacity:calc(var(--ho,.6) * .45 * var(--foil,1));
  background:repeating-linear-gradient(115deg,rgba(255,255,255,.9) 0 1px,transparent 1px 3px)}
.hc-streak{inset:-40%;mix-blend-mode:soft-light;opacity:.85;transform:translateX(var(--st,0%));
  background:linear-gradient(115deg,transparent 42%,rgba(255,255,255,.95) 49%,rgba(255,255,255,.95) 51%,transparent 58%)}
.hc-glare{inset:0;mix-blend-mode:screen;background:radial-gradient(45% 65% at var(--mx,50%) var(--my,50%),rgba(255,255,255,.6),rgba(255,255,255,0) 65%)}
.hc-edge{inset:0;border-radius:20px;padding:1px;
  background:linear-gradient(var(--ea,135deg),#fff,rgba(20,37,29,.08) 30%,rgba(20,37,29,.05) 70%,rgba(255,255,255,.9));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.hc-chip{width:42px;height:32px;border-radius:7px;position:relative;overflow:hidden;
  background:linear-gradient(135deg,#e9d6a2,#b89850 45%,#f4e3b0 60%,#9c7c3a);box-shadow:inset 0 0 0 .5px rgba(0,0,0,.35)}
.hc-chip:before,.hc-chip:after{content:"";position:absolute;border:1px solid rgba(80,60,20,.45)}
.hc-chip:before{left:30%;right:30%;top:-1px;bottom:-1px;border-top:0;border-bottom:0}
.hc-chip:after{top:35%;bottom:35%;left:-1px;right:-1px;border-left:0;border-right:0}
.hc-label{display:block;font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(20,37,29,.55);margin-bottom:2px}
`;

const Layers = () => (
  <>
    <div className="hc-layer hc-grain" />
    <div className="hc-layer hc-film" />
    <div className="hc-layer hc-film2" />
    <div className="hc-layer hc-lines" />
    <div className="hc-layer hc-streak" />
    <div className="hc-layer hc-glare" />
  </>
);

export const HoloCard = React.forwardRef<HoloCardHandle, HoloCardProps>(function HoloCard(
  {
    holder = "Aryan Sharma",
    number = "INLO-2026-8491-0428",
    expires = "50 CREDITS",
    cvv = "842",
    tier = "Titanium Pass",
    logo,
    network,
    maxTilt = 14,
    foil = 1.1,
    motion = true,
    onFlip,
    onReveal,
    className = "",
    cardType = "pass",
    holderLabel,
    expiresLabel,
    qrValue,
    city = "Bengaluru",
  },
  ref,
) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const shadowRef = React.useRef<HTMLDivElement>(null);
  const qrCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const [side, setSide] = React.useState<"front" | "back">("front");
  const [, setQrGenerated] = React.useState(false);

  const isPass = cardType === "pass";

  // Clean pass identifier for display: e.g. "INLO · 2026 · 8491 · 0428"
  const rawDigits = number.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const formattedPassId =
    rawDigits.length >= 12
      ? `${rawDigits.slice(0, 4)} · ${rawDigits.slice(4, 8)} · ${rawDigits.slice(8, 12)}${
          rawDigits.length > 12 ? ` · ${rawDigits.slice(12, 16)}` : ""
        }`
      : number.toUpperCase();

  // QR Token string
  const tokenToEncode =
    qrValue ||
    `inlo://pass/${number.replace(/\s+/g, "-")}/${holder.replace(/\s+/g, "-").toLowerCase()}?tier=${encodeURIComponent(tier)}`;

  // Generate QR Code onto canvas
  React.useEffect(() => {
    if (!qrCanvasRef.current) return;
    QRCode.toCanvas(qrCanvasRef.current, tokenToEncode, {
      width: 140,
      margin: 1,
      color: {
        dark: "#14251D",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then(() => setQrGenerated(true))
      .catch(() => setQrGenerated(false));
  }, [tokenToEncode, side]);

  const s = React.useRef({
    tx: 0,
    ty: 0,
    ttx: 0,
    tty: 0,
    ry: 0,
    vry: 0,
    target: 0,
    drag: false,
    lastX: 0,
    lastT: 0,
    moved: 0,
    lx: 0.5,
    ly: 0.35,
    tlx: 0.5,
    tly: 0.35,
    raf: 0,
  });
  const reduce = React.useRef(false);

  const buzz = (p: number | number[]) => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(p);
      }
    } catch {
      /* ignore */
    }
  };

  /* animation loop: ease tilt and light, spin with inertia, settle on a face */
  React.useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const st = s.current;
    const loop = () => {
      st.tx += (st.ttx - st.tx) * 0.12;
      st.ty += (st.tty - st.ty) * 0.12;
      st.lx += (st.tlx - st.lx) * 0.12;
      st.ly += (st.tly - st.ly) * 0.12;
      if (!st.drag) {
        st.vry *= 0.95;
        st.ry += st.vry;
        if (Math.abs(st.vry) < 1.2) st.ry += (st.target - st.ry) * (reduce.current ? 1 : 0.09);
        else st.target = Math.round(st.ry / 180) * 180;
      }
      const ry = st.ry + st.ty;
      const spin = ((ry % 360) + 360) % 360;
      const sweep = Math.sin((spin * Math.PI) / 180);
      const card = cardRef.current;
      if (card) {
        card.style.transform = `rotateX(${st.tx}deg) rotateY(${ry}deg)`;
        const mx = st.lx * 100 + sweep * 40;
        const my = st.ly * 100;
        card.style.setProperty("--mx", `${mx}%`);
        card.style.setProperty("--my", `${my}%`);
        card.style.setProperty("--hx", `${mx * 1.6}%`);
        card.style.setProperty("--hy", `${my * 1.2}%`);
        card.style.setProperty(
          "--ho",
          (0.45 + Math.min(0.5, (Math.abs(st.tx) + Math.abs(st.ty)) / 26 + Math.abs(sweep) * 0.4)).toFixed(3)
        );
        card.style.setProperty("--ca", `${st.ty * 6 + spin}deg`);
        card.style.setProperty("--st", `${st.ty * 4 + sweep * 60}%`);
        card.style.setProperty("--ea", `${135 + st.ty * 3}deg`);
      }
      const sh = shadowRef.current;
      if (sh) sh.style.transform = `translateX(${-st.ty * 1.4}px) scaleX(${(1 - Math.abs(sweep) * 0.45).toFixed(3)})`;
      const face = Math.round(st.target / 180) % 2 === 0 ? "front" : "back";
      setSide((prev) => (prev === face ? prev : face));
      st.raf = requestAnimationFrame(loop);
    };
    st.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(st.raf);
  }, []);

  React.useEffect(() => onFlip?.(side), [side, onFlip]);

  const flip = React.useCallback(() => {
    const st = s.current;
    st.target = Math.round(st.ry / 180) * 180 + 180;
    st.vry = 0;
    buzz(10);
  }, []);

  const reveal = React.useCallback(() => {
    flip();
    onReveal?.(true);
  }, [flip, onReveal]);

  /* phone tilt */
  const gyroOn = React.useRef(false);
  const listenGyro = React.useCallback(() => {
    if (gyroOn.current) return;
    gyroOn.current = true;
    window.addEventListener("deviceorientation", (e) => {
      if (e.beta == null || e.gamma == null) return;
      const st = s.current;
      const m = reduce.current ? 0 : maxTilt;
      st.ttx = Math.max(-m, Math.min(m, -(e.beta - 45) * 0.5));
      st.tty = Math.max(-m, Math.min(m, e.gamma * 0.6));
      st.tlx = 0.5 + e.gamma / 90;
      st.tly = 0.5 + (e.beta - 45) / 90;
    });
  }, [maxTilt]);

  const enableMotion = React.useCallback(async () => {
    const DOE = (typeof DeviceOrientationEvent !== "undefined" ? DeviceOrientationEvent : undefined) as unknown as
      | { requestPermission?: () => Promise<string> }
      | undefined;
    try {
      if (DOE?.requestPermission) {
        const r = await DOE.requestPermission();
        if (r !== "granted") return false;
      }
      listenGyro();
      return true;
    } catch {
      return false;
    }
  }, [listenGyro]);

  React.useEffect(() => {
    if (!motion || !window.matchMedia("(hover: none)").matches) return;
    const DOE = (typeof DeviceOrientationEvent !== "undefined" ? DeviceOrientationEvent : undefined) as unknown as
      | { requestPermission?: unknown }
      | undefined;
    if (DOE && typeof DOE.requestPermission !== "function") listenGyro();
  }, [motion, listenGyro]);

  React.useImperativeHandle(ref, () => ({ flip, reveal, enableMotion }), [flip, reveal, enableMotion]);

  /* pointer: tilt on hover, drag to spin, tap to flip */
  const onMove = (e: React.PointerEvent) => {
    if (!stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const st = s.current;
    const m = reduce.current ? 0 : maxTilt;
    st.tlx = px;
    st.tly = py;
    if (!st.drag) {
      if (e.pointerType === "mouse") {
        st.tty = (px - 0.5) * 2 * m;
        st.ttx = -(py - 0.5) * 2 * m;
      }
    } else {
      const now = performance.now();
      const dx = e.clientX - st.lastX;
      st.ry += dx * 0.6;
      st.vry = (dx * 0.6) / Math.max(1, (now - st.lastT) / 16);
      st.lastX = e.clientX;
      st.lastT = now;
      st.moved += Math.abs(dx);
    }
  };

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-hc-tap]")) return;
    const st = s.current;
    st.drag = true;
    st.moved = 0;
    st.lastX = e.clientX;
    st.lastT = performance.now();
    st.vry = 0;
    stageRef.current?.setPointerCapture(e.pointerId);
    buzz(6);
  };

  const onUp = () => {
    const st = s.current;
    if (!st.drag) return;
    st.drag = false;
    st.target = Math.round((st.ry + st.vry * 8) / 180) * 180;
    if (st.moved < 4) flip();
  };

  const defaultLogo = isPass ? (
    <div className="flex items-center gap-2 select-none">
      <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
        <Image
          src="/inlo-logo.png"
          alt="Inlo"
          width={28}
          height={28}
          className="object-contain rounded-md"
          priority
        />
      </div>
      <span className="text-[18px] font-[850] tracking-[-0.04em] text-[#14251D]">
        INLO
      </span>
    </div>
  ) : (
    <span className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.04em]">
      <span className="grid h-[22px] w-[22px] place-items-center rounded-[7px]" style={{ background: INK }}>
        <span className="h-2 w-2 rotate-45 rounded-[2px] bg-white" />
      </span>
      Logo
    </span>
  );

  const labelHolder = holderLabel ?? (isPass ? "Pass Holder" : "Card Holder");
  const labelExpires = expiresLabel ?? (isPass ? "Available Access" : "Expires");

  return (
    <div
      className={`relative w-full max-w-[380px] ${className}`}
      style={{ fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}
    >
      <style>{CSS}</style>
      <div
        ref={stageRef}
        className="relative w-full select-none"
        style={{ aspectRatio: "1.586", perspective: 1100, touchAction: "none" }}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => {
          const st = s.current;
          if (st.drag) return;
          st.ttx = 0;
          st.tty = 0;
          st.tlx = 0.5;
          st.tly = 0.35;
        }}
      >
        <div
          ref={shadowRef}
          className="pointer-events-none absolute -bottom-4 left-[10%] right-[10%] h-9 rounded-[50%] blur-[22px]"
          style={{ background: "rgba(20,37,29,.25)" }}
        />
        <div
          ref={cardRef}
          role="group"
          aria-roledescription="pass"
          aria-label={`${tier} for ${holder}. Drag to spin, tap to flip.`}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ transformStyle: "preserve-3d", willChange: "transform", ["--foil" as string]: String(foil) }}
        >
          {/* ============================================================ */}
          {/* FRONT FACE — AUTHENTIC TITANIUM SPORTS ACCESS PASS          */}
          {/* ============================================================ */}
          <div className="hc-face" aria-hidden={side !== "front"}>
            <Layers />
            <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                {logo ?? defaultLogo}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#14251D]/[0.07] border border-[#14251D]/15 text-[11px] font-[750] uppercase tracking-[.1em] text-[#14251D]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    {tier}
                  </span>
                </div>
              </div>

              {/* Pass Mid-Section (Sports Identity, NO debit chip, NO 16 credit dots) */}
              {isPass ? (
                <div className="my-auto space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#14251D]/60 uppercase">
                        Member Pass ID
                      </span>
                      <p
                        className="font-mono text-[16px] sm:text-[17px] font-[800] tracking-wider text-[#14251D]"
                        style={{ fontFamily: MONO, textShadow: "0 1px 0 rgba(255,255,255,.8)" }}
                      >
                        {formattedPassId}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono tracking-widest text-[#14251D]/60 uppercase">
                        City Network
                      </span>
                      <p className="text-[12px] font-[750] text-[#14251D] flex items-center justify-end gap-1">
                        <Sparkles size={11} className="text-[#14251D]/70" />
                        {city} · All Clubs
                      </p>
                    </div>
                  </div>

                  {/* Sports Privilege Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["Badminton", "Gyms", "Pools", "Yoga"].map((act) => (
                      <span
                        key={act}
                        className="px-2 py-0.5 rounded-md bg-[#14251D]/[0.05] border border-[#14251D]/10 text-[9.5px] font-[650] text-[#14251D]/80"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                /* Classic Bank Fallback if cardType === 'bank' */
                <div className="flex items-center justify-between">
                  <span className="hc-chip" />
                  <p className="font-mono text-lg font-medium">{number}</p>
                </div>
              )}

              {/* Bottom Footer Row */}
              <div className="flex items-end justify-between gap-3 pt-1 border-t border-[#14251D]/10">
                <div className="min-w-0 flex-1">
                  <span className="hc-label">{labelHolder}</span>
                  <b className="block truncate text-[14px] sm:text-[15px] font-[800] uppercase tracking-[-0.01em] text-[#14251D]">
                    {holder}
                  </b>
                </div>

                <div className="shrink-0 text-center">
                  <span className="hc-label">{labelExpires}</span>
                  <b className="text-[13px] sm:text-[14px] font-[800] tracking-tight tabular-nums text-emerald-800">
                    {expires}
                  </b>
                </div>

                <div className="shrink-0">
                  {network ?? (
                    <button
                      type="button"
                      data-hc-tap
                      onClick={flip}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#14251D] text-white hover:bg-[#1c382c] transition-colors shadow-xs cursor-pointer text-[11px] font-[700]"
                      aria-label="Flip pass to show QR code"
                    >
                      <QrIcon size={13} className="text-[--color-accent]" />
                      <span>Scan QR</span>
                      <RotateCw size={11} className="opacity-75" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="hc-layer hc-edge" />
          </div>

          {/* ============================================================ */}
          {/* BACK FACE — INSTANT CRYPTOGRAPHIC QR CODE ENTRY PASS         */}
          {/* ============================================================ */}
          <div
            className="hc-face"
            style={{ transform: "rotateY(180deg)" }}
            aria-hidden={side !== "back"}
          >
            <Layers />
            {/* Top Security Banner */}
            <div
              className="absolute inset-x-0 top-0 h-[34px] flex items-center justify-between px-5 text-[9.5px] font-mono tracking-widest text-white/70 uppercase select-none"
              style={{ background: "linear-gradient(180deg,#1e362a,#102018)" }}
            >
              <span className="flex items-center gap-1.5 text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                INLO CRYPTO-SECURE PASS
              </span>
              <span className="text-white/60">DESK &amp; TURNSTILE CHECK-IN</span>
            </div>

            <div className="absolute inset-0 pt-[42px] px-5 pb-3 flex items-center justify-between gap-4">
              {/* Scannable QR Code Canvas */}
              <div className="relative shrink-0 p-2 bg-white rounded-xl shadow-[0_4px_16px_rgba(20,37,29,0.14)] border border-black/10 flex items-center justify-center">
                <canvas
                  ref={qrCanvasRef}
                  width={112}
                  height={112}
                  className="block rounded-lg"
                  style={{ width: 104, height: 104 }}
                  aria-label={`Inlo check-in QR pass for ${holder}`}
                />
                {/* Center Inlo Watermark Emblem */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                  <div className="w-5 h-5 rounded-full bg-white p-0.5 shadow-sm border border-black/5 flex items-center justify-center">
                    <Image
                      src="/inlo-logo.png"
                      alt="Inlo"
                      width={14}
                      height={14}
                      className="object-contain rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Pass Verification Meta */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div>
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#14251D]/60 block">
                    Security Token
                  </span>
                  <p className="font-mono text-xs font-[750] text-[#14251D] truncate">
                    #{number.slice(-8).toUpperCase() || cvv}
                  </p>
                </div>

                <p className="text-[10px] leading-tight text-[#14251D]/75 font-[500]">
                  Present this QR at any reception desk or turnstile terminal in Bengaluru for 2-second check-in.
                </p>

                <div className="flex items-center gap-1 text-[9.5px] font-[650] text-emerald-800">
                  <CheckCircle2 size={11} className="text-emerald-700 shrink-0" />
                  <span>Verified Single-Use Token</span>
                </div>

                <button
                  type="button"
                  data-hc-tap
                  onClick={flip}
                  className="inline-flex items-center gap-1 text-[10.5px] font-[750] text-[#14251D] hover:underline cursor-pointer pt-0.5"
                >
                  <RotateCw size={11} />
                  <span>Flip back to card front</span>
                </button>
              </div>
            </div>

            <div className="hc-layer hc-edge" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default HoloCard;

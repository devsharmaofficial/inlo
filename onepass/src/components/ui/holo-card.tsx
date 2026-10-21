"use client";

import * as React from "react";
import Image from "next/image";
import QRCode from "qrcode";

/* ------------------------------------------------------------------ */
/*  HoloCard — Minimal Pearl Titanium Inlo Access Pass.               */
/*  Ultra-clean typography, generous whitespace, pristine alignment.   */
/*  Front: Member identity & credits on iridescent pearl titanium.    */
/*  Back: Perfectly centered scannable check-in QR code.              */
/* ------------------------------------------------------------------ */

export type HoloCardHandle = {
  flip: () => void;
  reveal: (show?: boolean) => void;
  enableMotion: () => Promise<boolean>;
};

export type HoloCardProps = {
  holder?: string;
  number?: string;
  expires?: string;
  cvv?: string;
  tier?: string;
  logo?: React.ReactNode;
  network?: React.ReactNode;
  maxTilt?: number;
  foil?: number;
  motion?: boolean;
  onFlip?: (side: "front" | "back") => void;
  onReveal?: (shown: boolean) => void;
  className?: string;
  cardType?: "pass" | "bank";
  qrValue?: string;
  city?: string;
};

const INK = "#14251D";
const FONT = "var(--font-sans), Geist, -apple-system, BlinkMacSystemFont, Inter, sans-serif";
const MONO = "var(--font-mono), 'Geist Mono', ui-monospace, Menlo, monospace";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9 .02' numOctaves='2' seed='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const CSS = `
.hc-face{position:absolute;inset:0;border-radius:22px;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;color:${INK};
  background:linear-gradient(135deg,#ffffff 0%,#f1f5f2 35%,#fcfdfc 62%,#e5ece7 100%);
  box-shadow:inset 0 0 0 .5px rgba(20,37,29,.12),inset 0 1px 0 rgba(255,255,255,.95)}
.hc-layer{position:absolute;pointer-events:none}
.hc-grain{inset:0;opacity:.25;mix-blend-mode:soft-light;background-image:${GRAIN};background-size:200px 200px}
.hc-film{inset:-30%;mix-blend-mode:multiply;opacity:calc(var(--ho,.6) * var(--foil,1));
  background:linear-gradient(115deg,#ffd9ec 0%,#ffe6cf 12%,#fff6c9 22%,#d4f7e4 34%,#c9ecff 46%,#d9d4ff 58%,#f6d0ff 70%,#ffd9ec 82%,#ffe6cf 100%);
  background-size:300% 300%;background-position:var(--hx,50%) var(--hy,50%);
  -webkit-mask-image:radial-gradient(85% 110% at var(--mx,50%) var(--my,50%),#000 0%,rgba(0,0,0,.55) 50%,rgba(0,0,0,.15) 85%);
  mask-image:radial-gradient(85% 110% at var(--mx,50%) var(--my,50%),#000 0%,rgba(0,0,0,.55) 50%,rgba(0,0,0,.15) 85%)}
.hc-film2{inset:-30%;mix-blend-mode:color;opacity:calc(var(--ho,.6) * .55 * var(--foil,1));
  background:conic-gradient(from var(--ca,0deg) at var(--mx,50%) var(--my,50%),#ff9ad5,#ffc58f,#fff08f,#9ff0c6,#8fd6ff,#b8a6ff,#ff9ad5);
  -webkit-mask-image:radial-gradient(60% 80% at var(--mx,50%) var(--my,50%),#000,transparent 75%);
  mask-image:radial-gradient(60% 80% at var(--mx,50%) var(--my,50%),#000,transparent 75%)}
.hc-lines{inset:0;mix-blend-mode:soft-light;opacity:calc(var(--ho,.6) * .4 * var(--foil,1));
  background:repeating-linear-gradient(115deg,rgba(255,255,255,.9) 0 1px,transparent 1px 3px)}
.hc-streak{inset:-40%;mix-blend-mode:soft-light;opacity:.8;transform:translateX(var(--st,0%));
  background:linear-gradient(115deg,transparent 42%,rgba(255,255,255,.95) 49%,rgba(255,255,255,.95) 51%,transparent 58%)}
.hc-glare{inset:0;mix-blend-mode:screen;background:radial-gradient(45% 65% at var(--mx,50%) var(--my,50%),rgba(255,255,255,.55),rgba(255,255,255,0) 65%)}
.hc-edge{inset:0;border-radius:22px;padding:1px;
  background:linear-gradient(var(--ea,135deg),#fff,rgba(20,37,29,.08) 30%,rgba(20,37,29,.05) 70%,rgba(255,255,255,.9));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
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
    tier = "Titanium Pass",
    logo,
    network,
    maxTilt = 14,
    foil = 1.1,
    motion = true,
    onFlip,
    onReveal,
    className = "",
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

  // Derive last 4 digits for pristine single-line display
  const last4 = number.replace(/\D/g, "").slice(-4) || "0428";
  const passCode = `INLO · 2026 · ${last4}`;

  // QR Token encoded into canvas
  const tokenToEncode =
    qrValue ||
    `inlo://pass/${last4}/${holder.replace(/\s+/g, "-").toLowerCase()}?tier=${encodeURIComponent(tier)}`;

  React.useEffect(() => {
    if (!qrCanvasRef.current) return;
    QRCode.toCanvas(qrCanvasRef.current, tokenToEncode, {
      width: 130,
      margin: 1,
      color: {
        dark: "#14251D",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    }).catch(() => {});
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
    if (st.moved < 5) flip();
  };

  const defaultLogo = (
    <div className="flex items-center gap-2 select-none">
      <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
        <Image
          src="/inlo-logo.png"
          alt="Inlo"
          width={24}
          height={24}
          className="object-contain rounded-md"
          priority
        />
      </div>
      <span className="text-[17px] font-[850] tracking-[-0.03em] text-[#14251D]">
        INLO
      </span>
    </div>
  );

  return (
    <div
      className={`relative w-full max-w-[370px] select-none ${className}`}
      style={{ fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}
    >
      <style>{CSS}</style>
      <div
        ref={stageRef}
        className="relative w-full cursor-pointer"
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
        {/* Soft realistic card shadow */}
        <div
          ref={shadowRef}
          className="pointer-events-none absolute -bottom-5 left-[8%] right-[8%] h-8 rounded-[50%] blur-[24px]"
          style={{ background: "rgba(20,37,29,.22)" }}
        />

        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-label={`${tier} for ${holder}. Click or tap to flip for QR check-in.`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              flip();
            }
          }}
          className="absolute inset-0 outline-none focus-visible:ring-2 focus-visible:ring-[#14251D] focus-visible:ring-offset-4 rounded-[22px]"
          style={{ transformStyle: "preserve-3d", willChange: "transform", ["--foil" as string]: String(foil) }}
        >
          {/* ============================================================ */}
          {/* FRONT FACE — MINIMALIST PEARL TITANIUM ATHLETE PASS          */}
          {/* ============================================================ */}
          <div className="hc-face" aria-hidden={side !== "front"}>
            <Layers />
            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-7">
              {/* Header: Logo on left, Minimal Tier on right */}
              <div className="flex items-center justify-between">
                {logo ?? defaultLogo}
                <span className="text-[10.5px] font-[750] uppercase tracking-[0.16em] text-[#14251D]/75">
                  {tier}
                </span>
              </div>

              {/* Center: Hero Credit Balance & Clean Single-line ID */}
              <div className="my-auto text-center space-y-1">
                <p className="text-3xl sm:text-4xl font-[850] tracking-tight text-[#14251D] tabular-nums">
                  {expires}
                </p>
                <p
                  className="text-[11.5px] font-mono tracking-[0.22em] text-[#14251D]/60 uppercase"
                  style={{ fontFamily: MONO }}
                >
                  {passCode}
                </p>
              </div>

              {/* Footer: Member Name on left, City on right */}
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-[14px] sm:text-[15px] font-[800] uppercase tracking-[-0.01em] text-[#14251D]">
                    {holder}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {network ?? (
                    <span className="text-[10.5px] font-[700] uppercase tracking-[0.14em] text-[#14251D]/65">
                      {city}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="hc-layer hc-edge" />
          </div>

          {/* ============================================================ */}
          {/* BACK FACE — PURE CENTERED SCANNABLE QR PASS                   */}
          {/* ============================================================ */}
          <div
            className="hc-face"
            style={{ transform: "rotateY(180deg)" }}
            aria-hidden={side !== "back"}
          >
            <Layers />
            <div className="absolute inset-0 flex flex-col items-center justify-between p-5 sm:p-6 text-center">
              {/* Top: Clean brand label */}
              <div className="text-[10px] font-[800] uppercase tracking-[0.2em] text-[#14251D]/70">
                INLO PASS · DIGITAL ACCESS
              </div>

              {/* Center: Crisp QR Code in White Capsule */}
              <div className="relative p-2.5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,37,29,0.1)] border border-black/[0.08] flex items-center justify-center">
                <canvas
                  ref={qrCanvasRef}
                  width={116}
                  height={116}
                  className="block rounded-lg"
                  style={{ width: 108, height: 108 }}
                  aria-label={`Inlo check-in QR pass for ${holder}`}
                />
                {/* Center Inlo Logo Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                  <div className="w-5 h-5 rounded-full bg-white p-0.5 shadow-xs border border-black/5 flex items-center justify-center">
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

              {/* Bottom: Minimal scan instruction & token */}
              <div className="space-y-0.5">
                <p className="text-[11px] font-[750] text-[#14251D] tracking-wide">
                  SCAN FOR RECEPTION ENTRY
                </p>
                <p className="text-[9.5px] font-mono tracking-widest text-[#14251D]/60 uppercase">
                  #{last4} · VERIFIED PASS
                </p>
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

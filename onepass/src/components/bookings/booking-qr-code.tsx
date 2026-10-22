"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import QRCode from "qrcode"
import { ShieldCheck, Download } from "lucide-react"

interface BookingQRCodeProps {
  /** The raw check-in token stored on the booking */
  token: string
  /** Booking reference ID shown below the QR */
  bookingId: string
  /** Activity name for labelling the QR */
  activityName: string
  /** Venue name for labelling the QR */
  venueName: string
  /** Session start ISO string */
  slotStartsAt: string
}

/**
 * Renders a high-density, scannable QR code for a booking check-in pass.
 * The QR code encodes the raw token string directly — the scanning side
 * submits that token to `/api/checkin/validate`.
 *
 * Security: the token is already cryptographically random (32 hex bytes).
 * No additional signing is done in the QR; the server validates the token.
 */
export function BookingQRCode({
  token,
  bookingId,
  activityName,
  venueName,
  slotStartsAt,
}: BookingQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!token || !canvasRef.current) return

    QRCode.toCanvas(canvasRef.current, token, {
      width: 256,
      margin: 2,
      color: {
        dark: "#0F1A13",   // forest-black for maximum contrast
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // highest, can recover if 30% is obscured
    })
      .then(() => {
        const url = canvasRef.current?.toDataURL("image/png") || null
        setDataUrl(url)
      })
      .catch(() => setError(true))
  }, [token])

  const sessionDate = new Date(slotStartsAt).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `inlo-pass-${bookingId}.png`
    a.click()
  }

  if (error) {
    return (
      <div className="rounded-[--radius-md] bg-[--color-surface-muted] border border-[--color-border] p-4 text-center text-xs text-[--color-muted]">
        Could not render QR code. Please use the pass token above.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Canvas — the scannable pass */}
      <div className="relative p-4 bg-white rounded-[--radius-lg] shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-[--color-border]">
        <canvas
          ref={canvasRef}
          id={`qr-canvas-${bookingId}`}
          aria-label={`QR check-in pass for ${activityName} at ${venueName}`}
          className="block"
          style={{ width: 200, height: 200 }}
        />
        {/* Inlo brand mark watermark in QR center */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div className="bg-white rounded-full p-1 shadow-md border border-black/5 flex items-center justify-center overflow-hidden">
            <Image
              src="/inlo-logo.png"
              alt="Inlo"
              width={26}
              height={26}
              className="object-contain rounded-full"
            />
          </div>
        </div>
      </div>

      {/* QR Meta Label */}
      <div className="text-center space-y-0.5">
        <p className="text-xs font-[650] text-[--color-foreground]">{activityName}</p>
        <p className="text-[11px] text-[--color-muted]">{venueName}</p>
        <p className="text-[10px] text-[--color-muted] font-mono">{sessionDate}</p>
      </div>

      {/* Security indicator */}
      <div className="inline-flex items-center gap-1.5 text-[10px] text-[--color-forest] font-[600]">
        <ShieldCheck size={12} />
        Single-use · Cryptographic token
      </div>

      {/* Download button */}
      {dataUrl && (
        <button
          onClick={handleDownload}
          id={`qr-download-${bookingId}`}
          aria-label="Download QR pass as PNG"
          className="inline-flex items-center gap-1.5 text-[11px] text-[--color-muted] hover:text-[--color-foreground] transition-colors px-3 py-1.5 rounded-[--radius-sm] border border-[--color-border] hover:border-[--color-forest] bg-[--color-surface] hover:bg-[--color-surface-muted]"
        >
          <Download size={12} />
          Save to phone / wallet
        </button>
      )}
    </div>
  )
}

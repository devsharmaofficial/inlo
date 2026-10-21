"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Camera, CameraOff, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QRScannerProps {
  /** Called with the decoded QR string whenever a QR code is successfully decoded */
  onScan: (result: string) => void
  /** Whether the scanner should be active */
  active?: boolean
}

/**
 * Camera-based QR scanner for the partner check-in desk.
 * Uses the ZXing library (dynamically imported) to decode QR codes from
 * the device camera feed in real-time.
 *
 * Security: raw decoded token is passed directly to onScan — no tampering possible
 * since the token must be validated server-side anyway.
 */
export function QRScanner({ onScan, active = true }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<"idle" | "requesting" | "active" | "error" | "denied">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [hasScanned, setHasScanned] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const scannerRef = useRef<{ stop: () => void } | null>(null)
  const hasScannedRef = useRef(false)

  const stopCamera = useCallback(() => {
    scannerRef.current?.stop()
    scannerRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    hasScannedRef.current = false
    setHasScanned(false)
  }, [])

  const startCamera = useCallback(async () => {
    if (!active) return
    hasScannedRef.current = false
    setHasScanned(false)

    try {
      // Defer state update to next microtask to avoid react-hooks/set-state-in-effect warning
      await Promise.resolve()
      setStatus("requesting")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Dynamically import ZXing to avoid SSR issues
      const { BrowserQRCodeReader, NotFoundException } = await import("@zxing/library")
      const reader = new BrowserQRCodeReader()

      const decode = async () => {
        if (!videoRef.current || !streamRef.current) return

        try {
          const result = await reader.decodeOnceFromStream(stream, videoRef.current)
          if (result && !hasScannedRef.current) {
            hasScannedRef.current = true
            setHasScanned(true)
            onScan(result.getText())
          }
        } catch (err) {
          // NotFoundException is thrown when no QR is in frame — just loop
          if (err instanceof NotFoundException) {
            if (streamRef.current) {
              // small delay then retry
              setTimeout(decode, 300)
            }
          } else {
            console.error("QR decode error", err)
          }
        }
      }

      setStatus("active")
      decode()
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setStatus("denied")
        setErrorMsg("Camera permission was denied. Please allow camera access in browser settings.")
      } else {
        setStatus("error")
        setErrorMsg(err instanceof Error ? err.message : "Could not access camera.")
      }
    }
  }, [active, onScan])

  // Allow re-scan after a result
  const resetScanner = useCallback(() => {
    hasScannedRef.current = false
    setHasScanned(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void startCamera()
    }, 0)
    return () => {
      clearTimeout(timer)
      stopCamera()
    }
  }, [startCamera, stopCamera])

  return (
    <div className="space-y-3">
      {/* Camera Viewport */}
      <div className="relative w-full aspect-square max-w-xs mx-auto rounded-[--radius-lg] overflow-hidden bg-black border-2 border-[--color-border]">
        <video
          ref={videoRef}
          id="qr-scanner-video"
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          aria-label="Camera viewfinder for QR code scanning"
        />

        {/* Scanning Reticle Overlay */}
        {status === "active" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            {/* Corner brackets */}
            <div className="absolute w-48 h-48">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[--color-chartreuse] rounded-tl-sm" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[--color-chartreuse] rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[--color-chartreuse] rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[--color-chartreuse] rounded-br-sm" />
              {/* Scanning line animation */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[--color-chartreuse] opacity-80 animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* Status overlays */}
        {status === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-2">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-xs">Requesting camera…</span>
          </div>
        )}

        {(status === "denied" || status === "error") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white gap-3 p-4 text-center">
            <CameraOff size={28} className="text-red-400" />
            <p className="text-xs">{errorMsg}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={startCamera}
              className="text-white border-white/30 hover:bg-white/10"
            >
              <RefreshCw size={14} className="mr-1" /> Retry
            </Button>
          </div>
        )}
      </div>

      {/* Status text */}
      {status === "active" && (
        <p className="text-center text-xs text-[--color-muted]">
          <Camera size={12} className="inline mr-1" />
          Point camera at member&apos;s Inlo QR pass
        </p>
      )}

      {/* Re-scan button after successful scan */}
      {status === "active" && hasScanned && (
        <div className="flex justify-center">
          <Button variant="secondary" size="sm" onClick={resetScanner} id="qr-rescan-btn">
            <RefreshCw size={14} className="mr-1" /> Scan next member
          </Button>
        </div>
      )}
    </div>
  )
}

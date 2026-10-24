"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Building2,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import {
  sendEmailOtpAction,
  verifyEmailOtpAction,
  sendPhoneOtpAction,
  verifyPhoneOtpAction,
  signInAction,
  signUpAction,
  quickDemoLoginAction,
} from "@/app/actions/auth-actions"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

type AuthMode = "email-otp" | "phone" | "password"

interface AuthCardProps {
  initialView?: "sign-in" | "sign-up"
}

export function AuthCard({ initialView = "sign-in" }: AuthCardProps) {
  const router = useRouter()
  const [view, setView] = React.useState<"sign-in" | "sign-up">(initialView)
  const [mode, setMode] = React.useState<AuthMode>("email-otp")

  // Form states
  const [email, setEmail] = React.useState("")
  const [fullName, setFullName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [otpCode, setOtpCode] = React.useState(["", "", "", "", "", ""])

  // Flow states
  const [otpStep, setOtpStep] = React.useState<"input" | "verify">("input")
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)
  const [quickLoading, setQuickLoading] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [bannerNotice, setBannerNotice] = React.useState<string | null>(null)
  const [resendTimer, setResendTimer] = React.useState(0)

  // OTP inputs refs for auto-focusing
  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendTimer])

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)
    const supabase = createClient()
    if (!supabase) {
      setError("Authentication client is unavailable.")
      setGoogleLoading(false)
      return
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
  }

  // Handle OTP digit changes with auto-advance
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...otpCode]
    newCode[index] = value.slice(-1)
    setOtpCode(newCode)

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // Handle Send OTP (Email)
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBannerNotice(null)
    setLoading(true)

    const res = await sendEmailOtpAction(email)
    setLoading(false)

    if (res.success) {
      setOtpStep("verify")
      setResendTimer(45)
      if (res.isSimulated && res.simulationCode) {
        setBannerNotice(`Sandbox Verification PIN: ${res.simulationCode}`)
        // Pre-fill digits for instant developer ease
        const digits = res.simulationCode.split("")
        setOtpCode(digits)
      } else {
        setBannerNotice(res.message || "Code sent to your email.")
      }
    } else {
      setError(res.error || "Failed to send verification code.")
    }
  }

  // Handle Verify OTP (Email)
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const token = otpCode.join("")
    if (token.length !== 6) {
      setError("Please enter the complete 6-digit code.")
      return
    }

    setLoading(true)
    const res = await verifyEmailOtpAction(email, token)
    setLoading(false)

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl)
      router.refresh()
    } else {
      setError(res.error || "Verification failed. Check the 6-digit PIN.")
    }
  }

  // Handle Send Phone OTP
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBannerNotice(null)
    setLoading(true)

    const res = await sendPhoneOtpAction(phone)
    setLoading(false)

    if (res.success) {
      setOtpStep("verify")
      setResendTimer(45)
      if (res.isSimulated && res.simulationCode) {
        setBannerNotice(`Test SMS Code: ${res.simulationCode}`)
        const digits = res.simulationCode.split("")
        setOtpCode(digits)
      } else {
        setBannerNotice(res.message || "SMS dispatched.")
      }
    } else {
      setError(res.error || "Failed to send SMS OTP.")
    }
  }

  // Handle Verify Phone OTP
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const token = otpCode.join("")
    if (token.length !== 6) {
      setError("Please enter the complete 6-digit code.")
      return
    }

    setLoading(true)
    const res = await verifyPhoneOtpAction(phone, token)
    setLoading(false)

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl)
      router.refresh()
    } else {
      setError(res.error || "Invalid SMS verification code.")
    }
  }

  // Handle Traditional Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (view === "sign-up") {
      const res = await signUpAction(fullName, email, password)
      setLoading(false)
      if (res.success && res.redirectUrl) {
        router.push(res.redirectUrl)
        router.refresh()
      } else {
        setError(res.error || "Account creation failed.")
      }
    } else {
      const res = await signInAction(email, password)
      setLoading(false)
      if (res.success && res.redirectUrl) {
        router.push(res.redirectUrl)
        router.refresh()
      } else {
        setError(res.error || "Sign in failed.")
      }
    }
  }

  // 1-Click Evaluation Login
  const handleQuickLogin = async (type: "athlete" | "partner" | "admin") => {
    setError(null)
    setQuickLoading(type)
    const res = await quickDemoLoginAction(type)
    setQuickLoading(null)
    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl)
      router.refresh()
    } else {
      setError(res.error || "Demo login failed.")
    }
  }

  return (
    <div className="rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] p-6 sm:p-8 shadow-md space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h2 text-[--color-foreground]">
          {view === "sign-up" ? "Create your account" : "Welcome to Inlo"}
        </h1>
        <p className="text-body text-[--color-muted] mt-1">
          {view === "sign-up"
            ? "Sign up to access your pass and credit wallet."
            : "Sign in to your Inlo account."}
        </p>
      </div>

      {/* Error and Info Alerts */}
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-[--radius-md] bg-[--color-danger]/10 border border-[--color-danger]/25 text-xs text-[--color-danger] flex items-start gap-2.5 animate-in fade-in"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {bannerNotice && (
        <div
          role="status"
          className="p-3.5 rounded-[--radius-md] bg-[--color-forest]/10 border border-[--color-forest]/30 text-xs text-[--color-forest] flex items-start gap-2.5 animate-in fade-in"
        >
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Google OAuth Button (Section 2 Pattern: Social Sign-In) */}
      <div>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-[--color-border] text-gray-800 font-[600] shadow-xs cursor-pointer"
          loading={googleLoading}
          disabled={loading || googleLoading || !!quickLoading}
          onClick={handleGoogleSignIn}
        >
          {/* Official Google multicolored icon mark */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
            />
          </svg>
          <span>Continue with Google</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-[--color-border]" />
        <span className="absolute bg-[--color-surface] px-3 text-[11px] font-[600] text-[--color-muted] uppercase tracking-wider">
          or
        </span>
      </div>

      {/* Auth Mode Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-[--radius-md] bg-[--color-surface-muted] border border-[--color-border] text-xs">
        <button
          type="button"
          onClick={() => {
            setMode("email-otp")
            setOtpStep("input")
            setError(null)
          }}
          className={cn(
            "py-1.5 px-2 rounded-[--radius-sm] font-[600] transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
            mode === "email-otp"
              ? "bg-[--color-surface] text-[--color-foreground] shadow-xs"
              : "text-[--color-muted] hover:text-[--color-foreground]"
          )}
        >
          <Mail size={13} />
          <span>Email OTP</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("phone")
            setOtpStep("input")
            setError(null)
          }}
          className={cn(
            "py-1.5 px-2 rounded-[--radius-sm] font-[600] transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
            mode === "phone"
              ? "bg-[--color-surface] text-[--color-foreground] shadow-xs"
              : "text-[--color-muted] hover:text-[--color-foreground]"
          )}
        >
          <Phone size={13} />
          <span>Phone SMS</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("password")
            setError(null)
          }}
          className={cn(
            "py-1.5 px-2 rounded-[--radius-sm] font-[600] transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
            mode === "password"
              ? "bg-[--color-surface] text-[--color-foreground] shadow-xs"
              : "text-[--color-muted] hover:text-[--color-foreground]"
          )}
        >
          <Lock size={13} />
          <span>Password</span>
        </button>
      </div>

      {/* ── MODE 1: EMAIL OTP ─────────────────────────────────────────── */}
      {mode === "email-otp" && (
        <div>
          {otpStep === "input" ? (
            <form onSubmit={handleSendEmailOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email-otp-input">Your email address</Label>
                <div className="relative">
                  <Input
                    id="email-otp-input"
                    type="email"
                    autoComplete="email"
                    placeholder="athlete@inlo.tech"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={16} className="absolute right-3 top-3 text-[--color-muted] pointer-events-none" />
                </div>
                <p className="text-[11px] text-[--color-muted]">
                  We will send a 6-digit verification code.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Send code
                <ArrowRight size={16} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmailOtp} className="space-y-5 animate-in fade-in">
              <div className="space-y-2 text-center">
                <span className="text-xs text-[--color-muted]">
                  Enter the 6-digit code sent to <strong className="text-[--color-foreground]">{email}</strong>
                </span>

                {/* Segmented 6-digit OTP Box */}
                <div className="flex justify-center gap-2 pt-2">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-[750] rounded-[--radius-md] border-2 border-[--color-border] bg-[--color-surface] text-[--color-foreground] focus:border-[--color-forest] focus:outline-none transition-colors"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  disabled={loading || otpCode.some((d) => !d)}
                >
                  Verify & continue
                  <ArrowRight size={16} />
                </Button>

                <div className="flex items-center justify-between text-xs text-[--color-muted] pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpStep("input")}
                    className="hover:text-[--color-foreground] underline cursor-pointer"
                  >
                    Change email
                  </button>
                  {resendTimer > 0 ? (
                    <span>Resend code in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      className="text-[--color-forest] font-[600] hover:underline cursor-pointer"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── MODE 2: PHONE SMS OTP ────────────────────────────────────── */}
      {mode === "phone" && (
        <div>
          {otpStep === "input" ? (
            <form onSubmit={handleSendPhoneOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone-input">Mobile phone number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 px-3 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-muted] text-xs font-[650] text-[--color-foreground]">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <Input
                    id="phone-input"
                    type="tel"
                    inputMode="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-[11px] text-[--color-muted]">
                  We will send a 6-digit verification code via SMS.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Send SMS code
                <ArrowRight size={16} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyPhoneOtp} className="space-y-5 animate-in fade-in">
              <div className="space-y-2 text-center">
                <span className="text-xs text-[--color-muted]">
                  Enter the 6-digit SMS code sent to <strong className="text-[--color-foreground]">+91 {phone}</strong>
                </span>

                <div className="flex justify-center gap-2 pt-2">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-[750] rounded-[--radius-md] border-2 border-[--color-border] bg-[--color-surface] text-[--color-foreground] focus:border-[--color-forest] focus:outline-none transition-colors"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  disabled={loading || otpCode.some((d) => !d)}
                >
                  Verify SMS & sign in
                  <ArrowRight size={16} />
                </Button>

                <div className="flex items-center justify-between text-xs text-[--color-muted] pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpStep("input")}
                    className="hover:text-[--color-foreground] underline cursor-pointer"
                  >
                    Change phone
                  </button>
                  {resendTimer > 0 ? (
                    <span>Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      className="text-[--color-forest] font-[600] hover:underline cursor-pointer"
                    >
                      Resend SMS
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── MODE 3: TRADITIONAL PASSWORD ──────────────────────────────── */}
      {mode === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {view === "sign-up" && (
            <div className="space-y-1.5">
              <Label htmlFor="signup-name">Full name</Label>
              <Input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Aryan Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="pwd-email">Email address</Label>
            <Input
              id="pwd-email"
              type="email"
              autoComplete="email"
              placeholder="athlete@inlo.tech"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pwd-password">Password</Label>
            <Input
              id="pwd-password"
              type="password"
              autoComplete={view === "sign-up" ? "new-password" : "current-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            loading={loading}
            disabled={loading}
          >
            {view === "sign-up" ? "Register with password" : "Sign in with password"}
            <ArrowRight size={16} />
          </Button>
        </form>
      )}

      {/* Quick 1-Click Evaluation Logins */}
      <div className="pt-4 border-t border-[--color-border] space-y-3">
        <span className="text-[11px] font-[650] text-[--color-muted] uppercase tracking-wider block text-center">
          Demo sign-in
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex flex-col h-auto py-2 px-1.5 gap-1 cursor-pointer"
            loading={quickLoading === "athlete"}
            disabled={loading || !!quickLoading}
            onClick={() => handleQuickLogin("athlete")}
          >
            <UserCheck size={15} className="text-[--color-forest]" />
            <span className="font-[600] text-[11px]">Athlete</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex flex-col h-auto py-2 px-1.5 gap-1 cursor-pointer"
            loading={quickLoading === "partner"}
            disabled={loading || !!quickLoading}
            onClick={() => handleQuickLogin("partner")}
          >
            <Building2 size={15} className="text-[--color-forest]" />
            <span className="font-[600] text-[11px]">Partner</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex flex-col h-auto py-2 px-1.5 gap-1 cursor-pointer"
            loading={quickLoading === "admin"}
            disabled={loading || !!quickLoading}
            onClick={() => handleQuickLogin("admin")}
          >
            <ShieldCheck size={15} className="text-[--color-forest]" />
            <span className="font-[600] text-[11px]">Admin</span>
          </Button>
        </div>
      </div>

      {/* Toggle View Link */}
      <p className="text-center text-xs text-[--color-muted]">
        {view === "sign-up" ? (
          <>
            Already have an account?{" "}
            <Link
              href={ROUTES.signIn}
              onClick={(e) => {
                e.preventDefault()
                setView("sign-in")
              }}
              className="text-[--color-forest] font-[600] hover:underline"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Inlo?{" "}
            <Link
              href={ROUTES.signUp}
              onClick={(e) => {
                e.preventDefault()
                setView("sign-up")
              }}
              className="text-[--color-forest] font-[600] hover:underline"
            >
              Create account
            </Link>
          </>
        )}
      </p>
    </div>
  )
}

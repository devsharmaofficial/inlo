"use client"

import { useState } from "react"
import { CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, Building2, Dumbbell, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const STEPS = [
  { id: 1, title: "Facility Details", icon: Building2 },
  { id: 2, title: "Sports & Capacity", icon: Dumbbell },
  { id: 3, title: "Owner & Settlement", icon: UserCheck },
]

const AVAILABLE_ACTIVITIES = [
  { id: "badminton", label: "Badminton Courts", icon: "🏸" },
  { id: "swimming", label: "Swimming Pool", icon: "🏊" },
  { id: "gym", label: "Gym & Strength Floor", icon: "🏋️" },
  { id: "yoga", label: "Yoga / Pilates Studio", icon: "🧘" },
]

export function PartnerApplyForm() {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1
  const [venueName, setVenueName] = useState("")
  const [locality, setLocality] = useState("Indiranagar")
  const [address, setAddress] = useState("")

  // Step 2
  const [activities, setActivities] = useState<string[]>(["badminton"])
  const [capacity, setCapacity] = useState("4")
  const [operatingHours, setOperatingHours] = useState("06:00 AM – 10:00 PM")

  // Step 3
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [payoutBank, setPayoutBank] = useState("HDFC Bank")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [queueId, setQueueId] = useState<string | null>(null)

  const toggleActivity = (act: string) => {
    setActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    )
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1)
    } else {
      setIsSubmitting(true)
      setTimeout(() => {
        const randomCode = Math.floor(100 + Math.random() * 900)
        setQueueId(`BLR-VAP-${randomCode}`)
        setIsSubmitting(false)
      }, 700)
    }
  }

  if (queueId) {
    return (
      <div className="rounded-[--radius-lg] border-2 border-[#244638] bg-[#F0F6F2] p-8 text-center animate-in fade-in-50">
        <div className="inline-flex p-3 rounded-full bg-[--color-forest] text-[--color-chartreuse] mb-4 shadow-sm">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-h2 font-[800] text-[#191B18] mb-2">
          Partner Application Submitted!
        </h3>
        <p className="text-sm text-[#4E5249] mb-5 max-w-md mx-auto leading-relaxed">
          Thank you, <strong>{contactName}</strong>. Our Bengaluru venue partnerships lead will visit <strong>{venueName}</strong> for a brief facility walk-through and verify your equipment within 48 business hours.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[--radius-md] bg-white border border-[#E2E5DC] text-xs font-mono text-[#191B18] shadow-xs">
          <ShieldCheck size={16} className="text-[--color-forest]" />
          <span>Pilot Partner Queue ID: <strong>{queueId}</strong></span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── STEPPER HEADER (Section 4 Component 12) ────────────────── */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id
            const Icon = step.icon

            return (
              <div key={step.id} className="flex flex-col items-center text-center z-10 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-[700] text-xs transition-all ${
                    isCompleted
                      ? "bg-[--color-forest] text-white shadow-xs"
                      : isCurrent
                      ? "bg-[--color-forest] text-white ring-4 ring-[--color-forest]/15"
                      : "bg-[--color-surface-muted] text-[--color-muted] border border-[--color-border]"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                </div>
                <span
                  className={`text-[11px] font-[650] mt-1.5 hidden sm:block ${
                    isCurrent ? "text-[--color-foreground]" : "text-[--color-muted]"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Connecting Progress Line */}
        <div className="absolute top-4 left-1/6 right-1/6 h-0.5 bg-[--color-border] -z-0" />
      </div>

      {/* ── STEP FORMS ────────────────────────────────────────────── */}
      <form onSubmit={handleNext} className="space-y-5 pt-2">
        {/* STEP 1: Facility Details */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in-50">
            <div>
              <Label htmlFor="venue-name" className="mb-1.5 block font-[600]">
                Venue / Facility Name *
              </Label>
              <Input
                id="venue-name"
                type="text"
                placeholder="e.g. Smash Zone Badminton & Fitness"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="locality-select" className="mb-1.5 block font-[600]">
                  Locality in Bengaluru *
                </Label>
                <select
                  id="locality-select"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full h-10 px-3 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] text-sm text-[--color-foreground] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
                >
                  <option value="Indiranagar">Indiranagar</option>
                  <option value="Domlur">Domlur</option>
                  <option value="Koramangala">Koramangala</option>
                  <option value="HSR Layout">HSR Layout</option>
                  <option value="Whitefield">Whitefield</option>
                  <option value="Other">Other Bengaluru Area</option>
                </select>
              </div>

              <div>
                <Label htmlFor="venue-address" className="mb-1.5 block font-[600]">
                  Street Address
                </Label>
                <Input
                  id="venue-address"
                  type="text"
                  placeholder="e.g. 100ft Road, 12th Main"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Sports & Capacity */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in-50">
            <div>
              <Label className="mb-2 block font-[600]">Activities Offered *</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {AVAILABLE_ACTIVITIES.map((act) => {
                  const isChecked = activities.includes(act.id)
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => toggleActivity(act.id)}
                      className={`flex items-center gap-2 p-3 rounded-[--radius-md] border text-left transition-all text-xs font-[650] ${
                        isChecked
                          ? "border-[--color-forest] bg-[--color-forest]/5 text-[--color-forest]"
                          : "border-[--color-border] bg-[--color-surface] text-[--color-muted] hover:border-[--color-forest]/40"
                      }`}
                    >
                      <span className="text-base">{act.icon}</span>
                      <span>{act.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="court-capacity" className="mb-1.5 block font-[600]">
                  Available Courts / Simultaneous Slots
                </Label>
                <Input
                  id="court-capacity"
                  type="number"
                  min="1"
                  max="20"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="operating-hours" className="mb-1.5 block font-[600]">
                  Operating Hours
                </Label>
                <Input
                  id="operating-hours"
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Owner & Settlement */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-person" className="mb-1.5 block font-[600]">
                  Owner / Manager Full Name *
                </Label>
                <Input
                  id="contact-person"
                  type="text"
                  placeholder="Karthik Reddy"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-phone" className="mb-1.5 block font-[600]">
                  Phone (WhatsApp active) *
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+91 98450 12345"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-email" className="mb-1.5 block font-[600]">
                  Email Address
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="manager@venue.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="payout-bank" className="mb-1.5 block font-[600]">
                  Bank Name for Settlements
                </Label>
                <Input
                  id="payout-bank"
                  type="text"
                  value={payoutBank}
                  onChange={(e) => setPayoutBank(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 rounded-[--radius-md] bg-[--color-surface-muted] border border-[--color-border] text-[11px] text-[--color-muted]">
              Settlement terms: 100% of ₹70 per validated pass redeemed, credited bi-weekly directly to your bank account.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[--color-border]">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="gap-1.5"
            >
              <ArrowLeft size={14} /> Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="gap-1.5 font-[700]"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : currentStep < 3 ? (
              <>
                Next Step <ArrowRight size={14} />
              </>
            ) : (
              "Submit Venue Application"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

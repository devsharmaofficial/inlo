"use client"

import { useState } from "react"
import { CheckCircle2, Send, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PartnerApplyForm() {
  const [venueName, setVenueName] = useState("")
  const [locality, setLocality] = useState("Indiranagar")
  const [activities, setActivities] = useState<string[]>([])
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [queueId, setQueueId] = useState<string | null>(null)

  const toggleActivity = (act: string) => {
    setActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!venueName.trim() || !contactName.trim() || !contactPhone.trim()) return

    setIsSubmitting(true)
    setTimeout(() => {
      const randomCode = Math.floor(100 + Math.random() * 900)
      setQueueId(`BLR-VAP-${randomCode}`)
      setIsSubmitting(false)
    }, 600)
  }

  if (queueId) {
    return (
      <div className="rounded-[--radius-lg] border-2 border-[#244638] bg-[#F0F6F2] p-8 text-center">
        <div className="inline-flex p-3 rounded-full bg-[--color-forest] text-[--color-chartreuse] mb-3">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-h2 font-[750] text-[#191B18] mb-2">
          Application Received
        </h3>
        <p className="text-sm text-[#4E5249] mb-4 max-w-md mx-auto">
          Thank you, <strong>{contactName}</strong>. Our Bengaluru venue partnerships lead will visit <strong>{venueName}</strong> for a brief facility walk-through within 2 business days.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-sm] bg-white border border-[#E2E5DC] text-xs font-mono text-[#191B18]">
          <ShieldCheck size={14} className="text-[--color-forest]" /> Pilot Partner Queue: {queueId}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="venue-name" className="mb-1.5 block">
          Venue / Facility Name
        </Label>
        <Input
          id="venue-name"
          type="text"
          placeholder="e.g. Smash Zone Sports Club"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="locality-select" className="mb-1.5 block">
            Locality in Bengaluru
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
          <Label htmlFor="contact-person" className="mb-1.5 block">
            Owner / Manager Name
          </Label>
          <Input
            id="contact-person"
            type="text"
            placeholder="Karthik Reddy"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Activity offerings checkboxes */}
      <div>
        <label className="block text-label mb-2 text-[--color-foreground]">
          Activities Offered
        </label>
        <div className="flex flex-wrap gap-2">
          {["Badminton", "Swimming", "Functional Fitness", "Yoga", "Squash", "Bouldering"].map(
            (act) => {
              const active = activities.includes(act)
              return (
                <button
                  type="button"
                  key={act}
                  onClick={() => toggleActivity(act)}
                  className={`px-3 py-1.5 rounded-[--radius-sm] text-xs font-[600] border transition-colors ${
                    active
                      ? "border-[--color-forest] bg-[--color-forest] text-[--color-background]"
                      : "border-[--color-border] bg-[--color-surface] text-[--color-muted] hover:text-[--color-foreground]"
                  }`}
                >
                  {act}
                </button>
              )
            }
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone-input" className="mb-1.5 block">
            Mobile Number
          </Label>
          <Input
            id="phone-input"
            type="tel"
            placeholder="+91 98450 12345"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="email-input" className="mb-1.5 block">
            Email Address
          </Label>
          <Input
            id="email-input"
            type="email"
            placeholder="karthik@smashzone.in"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={isSubmitting || !venueName.trim() || !contactName.trim() || !contactPhone.trim()}
        className="w-full"
      >
        <Send size={15} className="mr-1.5" />
        {isSubmitting ? "Submitting Application..." : "Submit Partner Application"}
      </Button>
    </form>
  )
}

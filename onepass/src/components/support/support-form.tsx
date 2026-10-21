"use client"

import { useState } from "react"
import { CheckCircle2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SupportForm() {
  const [role, setRole] = useState<"member" | "partner">("member")
  const [category, setCategory] = useState("booking")
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [bookingRef, setBookingRef] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ticketId, setTicketId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !contact.trim() || !message.trim()) return

    setIsSubmitting(true)

    // Simulate ticket creation with deterministic Bengaluru format
    setTimeout(() => {
      const generated = `TKT-${Math.floor(100000 + Math.random() * 900000)}`
      setTicketId(generated)
      setIsSubmitting(false)
    }, 600)
  }

  const handleReset = () => {
    setTicketId(null)
    setMessage("")
    setBookingRef("")
  }

  if (ticketId) {
    return (
      <div className="rounded-[--radius-lg] border-2 border-[#244638] bg-[#F0F6F2] p-6 text-center">
        <div className="inline-flex p-3 rounded-full bg-[--color-forest] text-[--color-chartreuse] mb-3">
          <CheckCircle2 size={28} />
        </div>
        <h3 className="text-h3 font-[750] text-[#191B18] mb-1">
          Support Ticket Created
        </h3>
        <p className="text-sm text-[--color-muted] mb-3">
          Your ticket reference code is:
        </p>
        <p className="inline-block px-4 py-1.5 rounded-[--radius-sm] bg-white border border-[#E2E5DC] font-mono text-base font-[700] text-[#191B18] mb-4">
          {ticketId}
        </p>
        <p className="text-xs text-[#191B18] max-w-md mx-auto leading-relaxed mb-6">
          Our Bengaluru pilot concierge team will contact you via WhatsApp/phone at{" "}
          <strong>{contact}</strong> within <strong>4 hours</strong>.
        </p>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          Submit another inquiry
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Role Selection */}
      <div>
        <label className="block text-label mb-2 text-[--color-foreground]">I am a...</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRole("member")}
            className={`flex-1 py-2 px-3 rounded-[--radius-md] text-xs font-[650] border transition-colors ${
              role === "member"
                ? "border-[--color-foreground] bg-[--color-foreground] text-[--color-background]"
                : "border-[--color-border] bg-[--color-surface] text-[--color-muted] hover:text-[--color-foreground]"
            }`}
          >
            Inlo Member
          </button>
          <button
            type="button"
            onClick={() => setRole("partner")}
            className={`flex-1 py-2 px-3 rounded-[--radius-md] text-xs font-[650] border transition-colors ${
              role === "partner"
                ? "border-[--color-foreground] bg-[--color-foreground] text-[--color-background]"
                : "border-[--color-border] bg-[--color-surface] text-[--color-muted] hover:text-[--color-foreground]"
            }`}
          >
            Venue Partner / Staff
          </button>
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <Label htmlFor="category-select" className="mb-1.5 block">
          Topic / Category
        </Label>
        <select
          id="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-10 px-3 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] text-sm text-[--color-foreground] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
        >
          <option value="booking">Booking / Digital Pass Issue</option>
          <option value="billing">Credit Balance / Payment Inquiry</option>
          <option value="venue">Venue Feedback / Facility Report</option>
          <option value="cancellation">Cancellation &amp; Refund Request</option>
          <option value="other">General Question</option>
        </select>
      </div>

      {/* Name & Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name-input" className="mb-1.5 block">
            Your Name
          </Label>
          <Input
            id="name-input"
            type="text"
            placeholder="Priya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="contact-input" className="mb-1.5 block">
            Mobile Number or Email
          </Label>
          <Input
            id="contact-input"
            type="text"
            placeholder="+91 98765 43210"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Optional Booking Reference */}
      <div>
        <Label htmlFor="ref-input" className="mb-1.5 block">
          Booking Reference (Optional)
        </Label>
        <Input
          id="ref-input"
          type="text"
          placeholder="e.g. bk-pilot-001"
          value={bookingRef}
          onChange={(e) => setBookingRef(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="msg-input" className="mb-1.5 block">
          How can we help?
        </Label>
        <textarea
          id="msg-input"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your question or issue in detail..."
          required
          disabled={isSubmitting}
          className="w-full p-3 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] text-sm text-[--color-foreground] placeholder:text-[--color-muted] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={isSubmitting || !name.trim() || !contact.trim() || !message.trim()}
        className="w-full"
      >
        <Send size={15} className="mr-1.5" />
        {isSubmitting ? "Submitting Ticket..." : "Submit Support Request"}
      </Button>
    </form>
  )
}

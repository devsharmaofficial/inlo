import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/constants"

/** /partner → /partner/dashboard */
export default function PartnerRootPage() {
  redirect(ROUTES.partner.dashboard)
}

import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/constants"

/** /admin → /admin/pilot */
export default function AdminRootPage() {
  redirect(ROUTES.admin.pilot)
}

# Inlo — Visual Design System & UI/UX Brief

> **Purpose:** A durable design contract for Antigravity. Read this file before creating or restyling any user-facing surface.  
> **Brand status:** Inlo is the current working brand used by the repository and inlo.tech; legal/trademark clearance is not established by this code audit. “OnePass” was an earlier internal label.  
> **Experience goal:** Premium urban activity marketplace—confident, useful, editorial, human, and operationally trustworthy. Not a generic AI-generated SaaS dashboard.

---

## 1. Creative direction

**Design concept: “A city with more ways to move.”** The interface should feel like a well-curated city guide combined with a considered membership product. A member should immediately understand what can be booked, where it is, how much it costs, and what will happen after tapping the CTA.

Blend three qualities:
- **Editorial clarity:** strong typography, intentional composition, real photography, expressive but restrained page headers.
- **Product precision:** clean filters, reliable availability states, clear credit math, strong hierarchy in booking/payment flows.
- **Human energy:** activity photographs, local neighbourhood cues, a small warm accent colour and confident microcopy.

### Do not imitate one reference site wholesale
Use references to study hierarchy, density, motion, image treatment, navigation and interaction patterns—not to copy a logo, page layout pixel-for-pixel, proprietary illustrations or branded visual identity. The result must be recognisably Inlo.

### Reference library
Use these as ongoing research sources; inspect relevant live examples before designing complex pages.

- [21st.dev](https://21st.dev/) — implementation-ready React/Tailwind components and distinctive interaction ideas. Prefer a small number of purposeful components over a page full of effects.
- [Mobbin](https://mobbin.com/) — study real shipped mobile/web flows: onboarding, location selection, search/filter sheets, subscription paywalls, checkout, booking confirmation, empty states and cancellation flows.
- [Awwwards](https://www.awwwards.com/) — editorial websites, art direction, typography, image composition and transitions. Take restraint and craft; do not sacrifice usability or performance to win an animation contest.
- [Dribbble](https://dribbble.com/) — explore concepts for activity cards, booking calendars, membership passes and venue detail pages. Treat shots as inspiration, not validated interaction design.
- [DESIGN.md / Google Labs format](https://github.com/google-labs-code/design.md) — use an explicit design file to keep the agent’s UI decisions consistent across pages.
- [shadcn/ui](https://ui.shadcn.com/) — accessible, source-owned primitives. Treat it as a starting point, not a finished product aesthetic.
- [Next.js App Router docs](https://nextjs.org/docs/app) — implement responsive page structures without putting all UI into one giant client component.

Research workflow: for every major flow, study 3–5 shipped examples in Mobbin or live products; write down the pattern that solves the same user problem; adapt only the useful parts to this brand. Keep a short note of inspiration decisions in design PRs.

## 2. Visual identity

### Atmosphere
Light-first, warm, precise, with a low-key editorial feel. It should not look sterile like a bank back office, nor loud like a gaming app.

- Canvas: warm paper rather than pure white.
- Text: ink-black / deep charcoal.
- Accent: vivid but controlled chartreuse used for primary actions and selected states—not every decorative element.
- Support colour: deep pine/forest for trust/success contexts and editorial contrast.
- Surfaces: white or near-white, hairline borders, restrained shadows only when elevation communicates hierarchy.
- Images: large, documentary-style, real activity and real venues. Authentic local photography beats generic gradient decoration.

### Design tokens
Implement these as CSS variables (or a similarly central token system). Avoid scattered hex values throughout component files.

```css
:root {
  --background: #F7F7F2;       /* warm paper */
  --surface: #FFFFFF;           /* primary cards / form surfaces */
  --surface-muted: #EFF0E8;      /* muted surface */
  --foreground: #191B18;        /* ink */
  --muted: #686D64;             /* secondary text */
  --border: #E2E5DC;            /* hairline borders */
  --accent: #C8F169;            /* signal chartreuse */
  --accent-foreground: #182014; /* dark text on accent */
  --forest: #244638;            /* deep secondary brand */
  --success: #22734E;
  --warning: #9A5B10;
  --danger: #B33B32;
  --info: #2B5F8A;
  --focus-ring: #487A30;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-pill: 999px;
}
```

Validate all colour tokens in the browser and run contrast checks. Use semantic aliases for destructive, success, warning and disabled states. Do not use colour alone to communicate status.

### Colour ratios and usage
- Primary action: chartreuse fill + dark ink label. Text/button contrast must be tested; if contrast is insufficient at a given size, darken the accent or use forest fill instead.
- Secondary action: transparent or white surface + ink border/label.
- Destructive: reserved for irreversible or destructive action, not as a brand colour.
- Success/warning/error: used only for meaning, accompanied by text/icon.
- Do not apply the accent to entire page backgrounds. Let whitespace, imagery and typography do the work.
- Avoid default purple/blue “AI gradient” palettes, neon rainbow gradients, glassmorphism and ambient glowing blobs.

## 3. Typography

### Font direction
Use **Manrope** or **Geist Sans** for interface and headings, with **Geist Mono** or **DM Mono** for prices, credit counts, booking IDs and tabular figures. Choose one primary sans family in the first build; do not mix four font families. A restrained editorial display face may be used only for a campaign headline if it strengthens the visual idea and remains consistent.

Preferred implementation: self-host via supported local font package or `next/font`; avoid blocking external font requests where possible. Use font weights intentionally; do not fake bold with heavy text-shadow.

### Type scale (desktop target; adapt fluidly)
| Token | Size / line height | Weight | Usage |
|---|---:|---:|---|
| Display | clamp(3rem, 6vw, 5.25rem) / 0.98–1.05 | 650–750 | Homepage/editorial hero only |
| H1 | clamp(2.25rem, 4vw, 3.5rem) / 1.05–1.12 | 650–750 | Page headline |
| H2 | clamp(1.75rem, 3vw, 2.5rem) / 1.12 | 650–700 | Section heading |
| H3 | 1.25–1.5rem / 1.2 | 600–700 | Card group / modal headings |
| Body large | 1.0625rem / 1.55 | 400–500 | Intro / lead copy |
| Body | 0.9375–1rem / 1.5–1.6 | 400–500 | Main reading text |
| Label | 0.75–0.875rem / 1.35 | 550–650 | Form labels, metadata |
| Data | 0.875–1rem / 1.3 | 500–650 mono/tabular | Prices, credits, booking refs |

Typography rules:
- Headlines should be concise and specific. No huge heading just to fill space.
- Use `font-variant-numeric: tabular-nums` for prices, credits, times and counters.
- Avoid excessive uppercase labels, widely tracked all-caps, and tiny low-contrast grey copy.
- Do not use gradients inside headline text.
- Keep body line length readable (roughly 55–75 characters where possible).

## 4. Layout and spacing

### Grid
- Max content width: approximately 1240–1320px on large screens.
- Desktop gutter: 32–48px; tablet: 24px; mobile: 16–20px.
- Use a consistent 4px spacing base, with common steps: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.
- Page sections should have distinct pacing: 64–96px between desktop marketing sections; denser 24–40px spacing inside transactional screens.
- Catalogue cards align to a clean grid. Avoid unequal card sizes unless the hierarchy is intentional and obvious.

### Corner radii and borders
- Buttons: 12px radius or pill for a clearly established pill control. Choose one primary geometry and use it consistently.
- Inputs: 10–12px radius.
- Cards: 16–20px radius; image corners follow the same container shape.
- Dialog/sheet: 20–24px radius.
- Borders: 1px semantic border; do not outline every nested element.
- Shadows: minimal, diffuse and rare. Use borders and spacing before shadows.

### Responsive behaviour
- Design at 360px, 390px, 768px, 1024px and 1440px widths.
- No horizontal page overflow, except deliberate horizontal carousels with clear affordance.
- Mobile uses bottom navigation for the member app if there are 4–5 top-level destinations; keep primary booking action reachable.
- Filter controls on mobile open a bottom sheet with clear “Apply” and “Reset” actions, counts where useful and state preservation.
- Sticky booking summary is allowed on venue detail only if it never covers essential content or browser safe areas.
- Desktop partner/admin portals may use a compact left rail and dense tables; consumer pages must not inherit admin density.

## 5. Imagery and art direction

### Use
- Real people participating in activities, with a range of bodies and backgrounds; candid rather than posed stock photography.
- Real partner photography wherever possible, with accurate venue attribution.
- Wide crops for hero storytelling; 4:3 or 3:2 for venue cards; portrait image only where the content benefits.
- Light that feels real: daylight, evening court lighting, tactile venue environments, movement and human detail.
- Consistent image treatment and aspect ratios so browsing remains calm.

### Avoid
- Generic AI-generated smiling gym people, uncanny hands/faces, invented venue images labelled as real partner facilities, repeated hero stock photos, or arbitrary mixed illustration styles.
- Images used as pure decoration when they reduce the visible availability/price information.
- Watermarks, random abstract 3D blobs, emoji as core iconography, and unrelated gradient backgrounds.

### Asset behaviour
- Use responsive images, explicit aspect ratios and meaningful alt text. Lazy-load below-the-fold assets; do not lazy-load the first visible hero image without testing its loading priority.
- Provide a designed fallback state for missing partner images; do not show a broken-image icon or repeat the same placeholder across the entire catalogue.
- Crop carefully with `object-position` based on the image content.

## 6. Iconography and motion

- Use one consistent outline icon set such as Lucide; stroke and optical size should be consistent.
- Icons support text, not replace labels for key actions.
- Motion should confirm an action, show hierarchy or support orientation—not merely demonstrate that animation is possible.
- Standard transitions: 140–220ms for hover/focus/state changes; 220–320ms for sheet/dialog transitions. Keep easing natural and consistent.
- Prefer opacity/transform over animating layout-heavy properties.
- Support `prefers-reduced-motion: reduce`; remove non-essential movement when requested.
- Avoid constant floating, endless marquee, cursor-follow effects, scroll-jacking, custom cursors, parallax stacks and long entrance animations in booking flows.

## 7. Component specifications

### 7.1 Buttons
Variants: `primary`, `secondary`, `ghost`, `destructive`, `link`. Sizes: `sm`, `md`, `lg`, `icon`.

- Primary action per screen is visually strongest; do not put two competing primary actions next to each other.
- Minimum interactive height: 44px on touch targets.
- Include default, hover, focus-visible, active, disabled, loading and success/error states where relevant.
- Loading buttons retain width and label context; disable duplicate submits and show progress without shifting the layout.
- Never use an inaccessible colour-only disabled style. Keep disabled text legible.
- Button copy names the action: “Confirm booking”, “Apply filters”, “Cancel booking” rather than “Continue” where clarity is possible.

### 7.2 Inputs and filters
- Always provide a visible label or a robust accessible name; placeholder is not the label.
- Validation is inline, specific and connected to the field. Avoid showing every possible validation error before the user interacts.
- Preserve user input after recoverable server errors.
- Date/time filters must make the selected value visible and easy to remove.
- Search should have an explicit empty state, clear affordance and a helpful suggestion when zero results are found.

### 7.3 Venue card
Use one repeatable component, not page-specific hand-rolled variants.

Information hierarchy:
1. Venue image and optional honest availability badge.
2. Venue name.
3. Activity/type and neighbourhood.
4. Rating only if sourced, current and attributable; otherwise omit it.
5. Price/cost expressed clearly in credits and, when useful, the applicable monetary context. Do not imply a universal rupee conversion unless pricing/legal terms establish it.
6. Short relevant feature such as “Pool access” or “Court booking” only when data confirms it.

Interaction: entire card may open detail; nested buttons must not create confusing click behaviour. Provide focus-visible state. Use consistent image ratio; avoid six different card styles in one viewport.

### 7.4 Credit and usage-cost display
- Label the unit (“credits”), not only a bare number. Show available balance, quote and final debit as distinct concepts.
- For fixed-price sessions, show the exact credit cost before booking confirmation.
- For metered sessions, before entry show the rate unit, rounding/minimum rule, estimated cost and a visually prominent **maximum debit**. State the no-checkout rule in plain language.
- After exit, show entry time, exit time, billable duration, rate-card version/reference, final debit and remaining balance. Provide “Report a problem” without forcing the member to find support elsewhere.
- A pending exit or disputed calculation must not look like a settled final charge.
- Use tabular numbers and clear status labels. Do not imply credits are cash or financial account balances.
- Distinguish plan-included, paid-pack, promotional and expired credits if policy treats them differently.

### 7.5 Slot picker
- Group by date; show local date, start time, duration (where applicable), cost and availability.
- Visually distinguish selected, available, unavailable, sold-out and stale states with text/state attributes, not colour alone.
- If availability is stale or a slot disappears, explain it and offer refreshed alternatives.
- No fake ticking countdown. A countdown appears only when an actual server-side hold/quote has an expiry.

### 7.6 Booking summary / confirmation
- Show venue, activity, address, date/time/timezone, cost, policy, status and reference.
- The confirm screen must state the credits being consumed and any monetary amount before commitment.
- Success screen offers a useful next step: directions, add-to-calendar or “View booking”.
- Do not celebrate success until the server confirms the booking.

### 7.7 Pass, entry and exit scan
- High contrast, sufficient quiet zone and scalable output; show a human-readable booking/session reference.
- Explain the current state plainly: “Ready to check in”, “Visit in progress”, “Checked out”, “Needs staff help” or “Pending confirmation”.
- Never present a decorative QR as functional. Tokens must be server-validated, scoped, short-lived where appropriate and protected against replay.
- For metered visits, show the accepted rate, estimate and hard maximum before entry. At exit, show a pending calculation state until the server confirms the debit.
- Provide a staff/manual fallback for camera, network or accessibility issues. Clearly distinguish “scan recorded” from “visit confirmed”.
- Never encode personal details or reusable secrets in a public URL. Do not imply GPS alone proves venue presence.

### 7.8 Tables in operations portal
- Tables should be practical: alignment, sortable headings only when sorting works, pagination if needed, clear status labels, meaningful empty states and row-level action menus.
- Do not compress body text below comfortable reading size.
- Use sticky table headers only where the table scrolls and it solves a real problem.
- Distinguish gross amount, platform fee, partner amount, refunds and net settlement as separate columns; show currency.

### 7.9 Dialogs / bottom sheets / toasts
- Use dialogs for explicit decisions and short focused tasks; use a route/page for complex multi-step workflows.
- Destructive confirmation names the consequence: e.g. “Cancel this booking?” with the policy outcome.
- Toasts report short-lived status only; important payment/booking outcomes also persist on the page.
- Mobile sheets need safe-area padding, accessible focus management, an obvious close affordance and scrollable content.

### 7.10 Skeleton and empty states
- Skeleton shape should approximate the content that will appear; no full-page shimmering skeleton for tiny delays.
- Use one quiet loading treatment; avoid simultaneous spinners on every card.
- Empty states answer: what happened, what can the user do now, and where can they go next?
- Differentiate “no venues nearby”, “no matching filters”, “not bookable on this date”, “no bookings yet” and “network error”.

## 8. Required pages and page-specific art direction

### A. Marketing / home `/`
- Header with text wordmark, “Explore”, “How it works” and one clear sign-in / join action.
- Hero has a specific promise, a compact explanation, a prominent discovery action and one strong activity photograph or art-directed image panel. Avoid a default centered heading + three gradient feature cards template.
- Give the city/locality context early. Explain credits in plain language with one real illustrative example, labelled as an example.
- Include a curated activity strip and venue preview only when accurate data/assets exist.
- Explain member and venue value separately; partner acquisition is a real product path.
- Trust section: transparent policies, verified venues only when verification actually exists, real partner/member quotes only with permission.
- Footer with support, terms, privacy, cancellation/refund policy and partner contact.

### B. Explore `/explore`
- Search bar and locality control at top; activity chips and filter button below.
- Result count and active filters visible without clutter.
- Desktop: balanced grid (typically 3 columns at wide view, 2 at medium); mobile: one column or a deliberately designed horizontal card format, not tiny 2-up cards with unreadable details.
- Cards prioritise image, venue, locality, activity and cost.
- Include sort semantics (recommended, distance, cost) only when implemented honestly.
- Empty/error/loading states are designed before polish pass.

### C. Venue detail `/venues/[slug]`
- Hero/gallery with appropriate image scale; title, area and activity type in the first viewport.
- A clear facts row for duration/facilities/access notes as relevant.
- Availability/slot selection and credit cost are prominent.
- Desktop can use a sticky booking panel; mobile gets a concise bottom booking bar after scrolling to relevant content.
- Surface cancellation and house rules before confirmation, not only in terms.
- Directions open an external maps link; do not request precise location unless needed.

### D. Membership / plan selection `/membership`
- Present plan choice as a decision aid, not a manipulative pricing wall.
- Show total price, billing cadence, what the member receives, exclusions, expiry/rollover, cancellation and renewal in plain language.
- Compare plans in aligned rows and label recommended plans only if there is a defensible reason.
- Avoid strikethrough fake prices, fake countdowns and tiny footnote disclosures.

### E. Checkout / payment `/checkout`
- Minimal distraction. Clear order summary, price, tax/fee disclosure, selected payment method and one primary pay action.
- Never collect card data directly. Use the approved provider’s secure checkout components.
- Handle pending, failed, cancelled and verified success states.
- A browser redirect is not proof of a successful payment. Show a pending verification state when the authoritative result has not arrived.

### F. Booking confirmation `/bookings/[id]`
- Clear success/pending/failed state, then when/where/what/cost/status.
- Pass/QR and booking reference; cancellation terms and support path.
- Avoid confetti by default. If used in a rare celebratory moment, keep motion brief and reduced-motion-safe.

### G. Member account `/account` and `/bookings`
- Simple navigation: upcoming, past, cancelled; booking status and actions are easy to understand.
- Credit / membership panel displays eligibility, available units, any expiry that truly applies and renewal state.
- Account and privacy controls are discoverable.

### H. Partner portal `/partner`
- Utility-first but still branded. Clear today/upcoming booking counts, schedule, booking lookup and availability management.
- Dense content may use a sidebar, practical table and compact form layout; no decorative metric cards with vanity numbers.
- Provide onboarding checklist and empty inventory state.
- Partner sees only their own venues/bookings/payout statements.

### I. Admin `/admin`
- Operational, not marketing-like. Strong filters, audit trail, status badges, reliable tables and confirm dialogs for sensitive changes.
- Separate venue moderation, bookings, payment events, ledger entries, partner settlement reports and audit log.
- Sensitive money/credit actions require a reason and show the previous/new values.

## 9. Navigation and responsive shell

### Member mobile navigation (candidate)
- Explore
- Bookings
- Membership/Credits
- Account

If a destination is rarely used, move it into Account rather than creating six or seven bottom tabs. Include visible current state and accessible labels.

### Desktop
- Header/nav remains restrained. Use contextual actions when logged in (credits/plan, bookings, profile).
- Avoid multiple sticky bars that compound into a large viewport obstruction.

### Partner/admin
- Distinct role-specific shell and navigation; do not rely on hiding links only. Every server route must also enforce authorisation.

## 10. UX content and microcopy

Voice: direct, calm, human and locally understandable. Avoid hype, empty superlatives and startup clichés.

Prefer:
- “Choose a time” over “Unlock your potential”.
- “12 credits for this session” over “Only 12”.
- “This slot was just booked. See other times.” over a generic error.
- “Your payment is being verified” over false success.
- “This venue has not published slots for Friday yet” over “No results”.

Never say “guaranteed”, “best”, “verified”, “real-time”, “unlimited” or “cheapest” unless the implementation and evidence support it. Keep credit policies plain and visible.

## 11. Accessibility and interaction quality

- Aim for WCAG 2.2 AA for the user-facing app.
- Keyboard: all actions work without a pointer; focus order follows reading order; focus visible and never trapped except correctly implemented modal flows.
- Forms: labels, descriptions and errors are associated programmatically.
- Images: meaningful alt text; decorative images use empty alt.
- Contrast: check text, focus outlines, disabled state, status chips and chartreuse controls.
- Motion: honor reduced-motion preference.
- Touch: target at least 44×44 CSS px for primary interactive elements where practical.
- State: avoid relying on hover-only interactions; touch equivalents must exist.
- Localisation readiness: store timestamps in a standard server representation and display venue-local date/time; currency is INR in the initial market. Keep copy outside business logic to ease later localisation.

## 12. Anti-slop quality gate — must pass every UI task

Reject and revise any screen that does any of the following:
- Uses the same generic “AI SaaS” hero on every page (centered giant heading, gradient blob, three floating cards, random logo strip).
- Uses arbitrary purple/blue gradients, glassmorphism panels, glowing borders, giant rounded cards everywhere or emoji as core icons.
- Invents ratings, reviews, customer logos, venue photos, venue availability, scarcity counters or member quotes.
- Has multiple competing CTAs, inconsistent spacing/radii or more than one visual style for the same component.
- Looks polished in a screenshot but omits loading, error, empty, selected, disabled or mobile states.
- Uses animation as a substitute for clear hierarchy or makes booking slower.
- Shows a credit cost, booking confirmation or payment success that is not based on server state.
- Leaves visible placeholder text, lorem ipsum, fake metrics, TODO badges or broken images in a release path.
- Relies on stock components without adapting spacing, typography, content hierarchy and interaction states to the product.

Before marking a phase done, inspect the actual browser rendering at 360px and desktop width. Check contrast, tab order, overflow, image crop, loading/error states and whether the first viewport makes the next action obvious. A code-only “looks good” assertion is not enough.

## 13. Suggested implementation approach

- Framework: Next.js App Router + TypeScript.
- Styling: Tailwind CSS plus a centrally tokenised theme.
- Primitives: shadcn/ui (current documented style) and Lucide icons, customised locally.
- Motion: CSS transitions first; add Motion/Framer Motion only for a specific interaction that genuinely benefits.
- Forms/validation: server-validated schemas (e.g. Zod) with consistent client error display.
- Images: responsive image component and explicit aspect ratios.
- Keep page sections/components semantically named (e.g. `VenueCard`, `SlotPicker`, `CreditCost`, `BookingSummary`) rather than abstractions such as `MagicCard1`.

Do not install every 21st.dev or animation library component automatically. Check license, bundle impact, dependency health, accessibility and whether the component serves a specific need. Prefer code that the project team can maintain.

## 14. Design review checklist

- [ ] The visual hierarchy is clear in the first 3 seconds.
- [ ] One primary CTA; it describes the true action.
- [ ] Price/credits and rules appear before commitment.
- [ ] Real data and imagery only; placeholders are visibly placeholders outside production flows.
- [ ] All interaction states designed and implemented.
- [ ] Mobile and desktop reviewed in browser.
- [ ] No horizontal overflow at 360px.
- [ ] Contrast, keyboard navigation, focus and reduced motion checked.
- [ ] Typography, colour, spacing and radii use tokens.
- [ ] Component feels like the same Inlo product across routes.
- [ ] No fake success, fake availability, or optimistic money/booking state.


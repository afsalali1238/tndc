# Architecture Decisions — NextDoorChef

> Full ADR log. Read MEMORY.md for the current summary.
> This file goes deeper on each decision's rationale.

---

## ADR-001: No Payments in Phase 1

**Status:** Active
**Context:** Building a two-sided marketplace from scratch with zero users on both sides.
**Decision:** Skip all payment infrastructure. WhatsApp is the order channel.
**Rationale:**
- Payments require legal entity setup, gateway approval (Telr requires UAE trade license)
- The first priority is proving demand — do people actually use this to find chefs?
- WhatsApp orders give chefs full control (they handle money directly)
- Can be added in 2–3 weeks once we have traction
**Consequences:** No commission revenue in Phase 1. Acceptable.

---

## ADR-002: Leaflet + OpenStreetMap (Not Google Maps)

**Status:** Active
**Context:** Map-based discovery is the core differentiator of the product.
**Decision:** Use Leaflet.js with OpenStreetMap tiles.
**Rationale:**
- Google Maps requires billing account + API key (AED 0 → AED X per load after free quota)
- OpenStreetMap UAE coverage is excellent — Dubai is very well mapped
- Leaflet is the same library used in cr8un8 (proven, working)
- `react-leaflet` + `react-leaflet-cluster` handles everything needed
**Consequences:** No Street View, no Google autocomplete. Both are Phase 2 concerns.

---

## ADR-003: Supabase as Single Backend

**Status:** Active
**Context:** Afsal is non-technical and needs to manage the platform himself.
**Decision:** Supabase handles DB (PostgreSQL + PostGIS), Auth, and Storage. No separate Express/FastAPI server.
**Rationale:**
- Supabase table editor = visual database admin (Afsal can approve chefs without code)
- PostGIS extension handles geo queries natively — no external geo service needed
- Free tier is generous enough for Phase 1
- Same pattern proven in cr8un8
**Consequences:** Supabase vendor dependency. Acceptable for this stage.

---

## ADR-004: Phone OTP Authentication (Not Email)

**Status:** Active
**Context:** Chefs need to authenticate to manage their profile (Phase 2). Buyers don't need accounts.
**Decision:** Supabase Auth with phone OTP via Twilio Verify.
**Rationale:**
- UAE expat demographic is phone-first; email auth feels corporate and slow
- WhatsApp number is already collected — phone auth matches the same number
- OTP is frictionless vs. password setup
**Consequences:** Twilio Verify costs ~$0.05/SMS in UAE. Negligible at Phase 1 volume.
**Phase 1 Note:** Authentication is not required in Phase 1. Only needed when chef self-service dashboard is built.

---

## ADR-005: WhatsApp as Sole Contact Channel

**Status:** Active
**Context:** Buyers need a way to contact chefs and place orders.
**Decision:** `wa.me` deep links with pre-filled messages. No in-app messaging.
**Rationale:**
- 95%+ UAE residents use WhatsApp daily — it's the native communication layer
- Building in-app messaging requires: backend WebSockets, push notifications, message storage, moderation
- WhatsApp gives chefs a familiar tool they already use
- Platform takes zero liability for transactions in Phase 1
**Consequences:** Platform cannot track order volume. Must use analytics events (Phase 2) to estimate.

---

## ADR-006: No Instagram Field on Chef Profile

**Status:** Active
**Context:** cr8un8 (the sister project) has both WhatsApp and Instagram on artist profiles.
**Decision:** NextDoorChef chefs have WhatsApp only.
**Rationale:**
- Food ordering is transactional — WhatsApp is sufficient and direct
- Instagram is a discovery channel, not an ordering channel
- Keeping the schema clean and the UI focused
**Consequences:** None significant. Chefs can share their Instagram in bio if they want.

---

## ADR-007: available_today Toggle on Dishes

**Status:** Active
**Context:** Home menus change daily — a chef might cook biryani on Fridays only.
**Decision:** `dishes.available_today` boolean, toggled per dish.
**Rationale:**
- Unlike craft listings (cr8un8), food has a freshness and preparation time component
- Buyers need to know if a dish is available before messaging
- Simple boolean is sufficient — no need for a calendar/schedule system in Phase 1
**Phase 1 Implementation:** Admin (Afsal) toggles availability in Supabase table editor.
**Phase 2:** Chef self-service toggle in dashboard.

---

## ADR-008: has_permit Displayed, Not Required

**Status:** Active
**Context:** UAE has food safety regulations for home cooking businesses, but enforcement is evolving.
**Decision:** Show "Licensed" badge if `has_permit=true`, but don't block unlicensed chefs.
**Rationale:**
- DET (Dubai Economy & Tourism) has started issuing home kitchen permits but many legitimate chefs don't have one yet
- Hard-requiring permits would eliminate 80%+ of early chefs
- Transparency to buyers (badge) balances safety with growth
**Legal Note:** Revisit this if UAE regulations become stricter. Add a platform disclaimer.
**Consequences:** Platform takes no legal responsibility for permit status in Phase 1.

---

## ADR-009: Framer Motion for Animations

**Status:** Active
**Decision:** Framer Motion for entrance animations and hover effects.
**Rationale:** Same proven choice as cr8un8. Declarative API, 60fps, small bundle impact.

---

## ADR-010: Skeleton Loading Everywhere

**Status:** Active
**Decision:** Every async data grid shows shimmer skeleton placeholders.
**Rationale:** Eliminates CLS (Cumulative Layout Shift), feels instant, professional finish.
**Pattern:** See `nextjs-patterns.md` for `SkeletonCard` component.

---

## Future ADRs (Not Decided Yet)

- **ADR-011:** Payment gateway selection (Telr vs Stripe UAE)
- **ADR-012:** Chef dashboard authentication strategy
- **ADR-013:** Review/rating system design
- **ADR-014:** Featured listing auction vs fixed price

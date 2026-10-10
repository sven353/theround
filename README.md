# The Round by Kuma Partners

Production codebase for [theround.kuma.partners](https://theround.kuma.partners/): a confidential, year-round executive peer board and operating rhythm for Founders, CEOs and Managing Directors in the Barcelona area.

Facilitated by Dr. Sven Mulfinger and operated by [Kuma Partners](https://kuma.partners).

The site is plain static HTML, CSS and vanilla JavaScript. There is no build step, no framework and no third-party request at runtime (fonts are self-hosted).

---

## 1. Repository structure

```text
.
├── README.md                         This file: architecture, inventory, changelog
├── _headers                          Netlify security and cache headers
├── favicon.ico                       Root multi-resolution favicon (16, 32, 48 px)
├── index.html                        Full page markup, metadata and JSON-LD schema
├── styles.css                        Design system, layout, components, motion
├── site.js                           All behaviour (see section 4)
└── assets/
    ├── logo-kuma.png                 Kuma Partners wordmark (header and footer)
    ├── logo-icon.png                 Transparent mark, 512 px
    ├── favicon-32x32.png             Browser tab icon
    ├── favicon-16x16.png             Browser tab icon
    ├── apple-touch-icon.png          iOS home-screen icon, 180 px on white
    ├── og-image.jpg                  Link preview image, 1200 × 630
    ├── fonts/
    │   ├── montserrat-latin-600-normal.woff2
    │   ├── montserrat-latin-700-normal.woff2
    │   ├── montserrat-latin-800-normal.woff2
    │   ├── montserrat-latin-400-italic.woff2
    │   ├── lato-latin-300-normal.woff2
    │   ├── lato-latin-400-normal.woff2
    │   ├── lato-latin-400-italic.woff2
    │   ├── lato-latin-700-normal.woff2
    │   ├── OFL-montserrat.txt        Open Font Licence
    │   └── OFL-lato.txt              Open Font Licence
    └── photos/                       Each as WebP + JPEG fallback
        ├── cadence-peer-board.webp / .jpg          Cadence card 1 (16:9)
        ├── cadence-sparring-barcelona.webp / .jpg  Cadence card 2 (16:9)
        ├── cadence-immersion-patio.webp / .jpg     Cadence card 3 (16:9)
        └── cadence-offsite-costa-brava.webp / .jpg Cadence card 4 (16:9)
```

Photo source files and their web names:

| Source file | Web file | Caption |
|---|---|---|
| The Round monthly meeting 1.jpeg | cadence-peer-board | Card 1: cropped to 16:9, desk nameplates blurred |
| Sven Mulfinger Listening.png | cadence-sparring-barcelona | Card 2: cropped to 16:9 |
| Sharpened Catalonia retreat image supplied 10 Oct 2026 (1024 × 616) | cadence-immersion-patio | Card 3: cropped to exact 16:9 (1024 × 576, 24 px off the top, 16 px off the bottom); replaces the earlier soft masia file |
| Offsite meeting Costa Brava.jpeg | cadence-offsite-costa-brava | Card 4: cropped to 16:9 at 35% from the top, `object-position: center 35%` |

Source files were renamed (no spaces or accents) and resized for the web (1024 px wide).


### Cadence card media rationale

The four in-person touchpoints (Board, Sparring, Immersion, Offsite) sit in a symmetrical 2 × 2 grid, each with a flush 16:9 photo, a mono meta line (`Monthly // 6 hours`), title, one paragraph and a mono footer tag. Card 05, the Member Accountability Ledger, spans the full width underneath on the navy radial: copy, Charter quote and the two actions (Charter drawer, Member Sign-In) on the left, a terminal-style panel with two anonymised entries on the right. The terminal footer labels the entries as illustrative; they are static, not live data.

The former three-photo proof ribbon (`#environment`) was removed on 10 Oct 2026 as redundant with the card photos. Its three image pairs were deleted from `assets/photos/` and the "Environment" link left the header and footer navigation.

---

## 2. Design system

Mirrors the design language of kuma.partners. All values live as CSS custom properties in `:root` at the top of `styles.css`.

### Colour tokens

Design direction since 10 Oct 2026: Swiss print monograph meets private executive intelligence brief. Typography, whitespace and 1 px hairlines carry the structure. No drop shadows on cards, no floating pills.

| Token | Value | Use |
|---|---|---|
| `--navy` | `#0B1523` (11, 21, 35) | Headings, primary buttons, hero, terms, ledger card |
| `--navy-hover` | `#16283D` | Primary button hover |
| `--teal` | `#1D6F8A` (29, 111, 138) | Accents, eyebrow bar, mono tags on light surfaces |
| `--teal-on-dark` | `#8DB7C5` | Subhead, mono tags and telemetry on navy |
| `--paper` | `#FDFDFC` | Warm canvas paper, default light surface (`.bg-white`, body) |
| `--cream` | `#F8F9FA` | Soft architectural cream, alternate sections |
| `--white` | `#FFFFFF` | Cards, drawers, modals, inputs |
| `--ink` | `#111827` | Body text |
| `--muted` | `#5A6D7C` | Slate, secondary text |
| `--hairline-color` | `rgba(0,0,0,.08)` | Every rule on light surfaces |
| `--hairline-dark` | `rgba(255,255,255,.12)` | Every rule on navy |
| `--card-border` | `rgba(0,0,0,.07)` | Cadence card outline |

### Surfaces

| Token | Value |
|---|---|
| `--navy-radial` | `radial-gradient(120% 85% at 50% 0%, #16283D 0%, #0B1523 100%)`, used by `.bg-navy` (hero, terms) and the ledger card |
| `--card-bg` | `#FFFFFF`, flat |
| `--card-sheen`, `--card-lift`, `--navy-focal-shadow` | `none` (kept as tokens so older selectors resolve cleanly) |

Card hover: no lift. The outline darkens to navy at 24% and the photo zooms 3% with a slight contrast lift, 0.4 s `cubic-bezier(.16,1,.3,1)`.

### Typography

| Role | Family | Weights |
|---|---|---|
| Headings, card titles | Montserrat | 700, letter-spacing -0.02em to -0.012em, `text-wrap: balance` |
| Hero h1 | Montserrat 700 | `clamp(2.4rem, 4.8vw, 4.2rem)`, max 22ch so it sets on two lines |
| Body, navigation, forms | Lato | 400 and 700 (line-height 1.65) |
| Hero subhead | Montserrat italic, teal-on-dark | 400 |
| Charter quote | Lato italic | 400 |
| Telemetry, status tags, frequencies, micro-specs, term labels, captions, scarcity note (`--font-mono`) | `ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace` | system fonts, nothing downloaded |

Fonts are served from `assets/fonts/` via `@font-face`. Google Fonts is deliberately not used, because loading it sends every visitor's IP address to Google, which German courts have treated as a GDPR breach.

### Shape and rhythm

- Every border is `1px solid var(--hairline-color)`. Never 2 px or 3 px.
- Radii: `--radius-xs`, `--radius-sm` and `--radius-md` are all 2 px (buttons, inputs, cards, tags); `--radius-lg` 4 px (modals). Bottom sheets on mobile use 16 px top corners. `--radius-pill` remains only for the FAQ plus icon.
- De-boxed sections: fact strip, Facilitation Engine pipeline, fit compact and guarantee strip, terms spec sheet. They use hairline rules (top, bottom and column dividers) instead of bordered cards.
- Container: 1120 px max width, 32 px side padding (24 px at 960 px and below, 1.25rem / 20 px below 768 px).
- Section padding: 96 px desktop, 80 px tablet, 64 px mobile.
- Eyebrows: Lato 700, 0.78rem, uppercase, 0.12em tracking, navy, with a 28 × 3 px teal bar before.

### Motion

- `.reveal-on-scroll`: fades in and rises 24 px, 650 ms `cubic-bezier(.16,1,.3,1)` (the single easing token `--ease-reveal`). No animation libraries.
- Buttons: sharp 2 px corners, 0.25 s colour change and a 1 px press on `:active`.
- `.reveal-stagger`: children enter at 0, 90, 180, 270 ms (fifth and later at 360 ms).
- Collapsibles (mobile menu, FAQ answers, "view all" FAQ) animate `grid-template-rows` from `0fr` to `1fr`.
- Hidden starting states only apply once `site.js` adds `class="js"` to `<html>`, so the page is fully readable without JavaScript.
- `prefers-reduced-motion: reduce` switches all motion off.

### Breakpoints

| Width | Change |
|---|---|
| 1100 px and below | Navigation collapses into the drop-down panel |
| 1024 px and below | Facilitation pipeline and terms go to 2 columns (the pipeline line stays continuous per row) |
| 960 px and below | Ledger anchor stacks (terminal under the copy), portal ledger table stacks |
| 860 px and below | FAQ goes to one column |
| 640 px and below | Older small-screen rules (typography, footer, dashboard metrics); most layout is now overridden by the block below |
| 767 px and below | Mobile layer (section 17b of `styles.css`): hero stacked with full-width CTA, fact strip in one column, cadence touchpoints and facilitation pipeline become swipe carousels, fit columns stack, terminal statuses stack, terms stay 2 × 2, drawers and portal become bottom sheets |

### Mobile layer (below 768 px)

All mobile layout lives in one `@media (max-width: 767px)` block, section 17b, placed after the older responsive rules so it wins without `!important`. Nothing in it applies at 768 px or wider.

- Hero: `92px 0 40px` padding plus the 1.25rem gutter; h1 `clamp(1.85rem, 7.5vw, 2.25rem)`, 12 px below; subhead 1.02rem / 1.5, 22 px below; CTA group stacked with a 12 px gap, primary button full width at 48 px minimum height, secondary link centred with a 44 px tap target.
- Fact strip: one column, hairline between cells.
- Cadence: `.cadence-touchpoints-grid` turns into a horizontal flex track with `scroll-snap-type: x mandatory`, hidden scrollbar and edge-to-edge bleed. Each card is `85vw` up to 340 px, snapped to centre. A `.mobile-swipe-hint` line sits under the track (hidden on desktop) and fades after the first swipe.
- Card 05 ledger anchor: copy and terminal stack; each terminal status sits on its own row above the sector line.
- Facilitation: header stacks; the 4-step pipeline becomes a snap carousel (78vw steps, max 300 px) with the connecting line kept continuous.
- Standards of fit: the two columns and the guarantee strip stack; the vertical divider becomes a horizontal one.
- Terms: 2 × 2 spec sheet with unbroken hairline dividers (gap 0, 10 px cell padding), values 1.1rem / 1.2, detail text 0.78rem / 1.35.
- Overlays: the Candidate Review drawer, the Charter drawer and the Member Portal slide up from the bottom (`sheetIn` keyframe), 92dvh tall with a 92vh fallback, 16 px top radius, bottom padding includes `env(safe-area-inset-bottom)`. The overlays still toggle via the `hidden` attribute, so no JavaScript changed for this.
- Touch: close buttons 44 × 44 px; form fields 16 px so iOS Safari does not zoom on focus.
- Copy: "Barcelona&nbsp;01" and every trailing "&nbsp;→" use a non-breaking space so a narrow screen never leaves "01" or the arrow alone on a line.

---

## 3. Page sections

Section order and background cadence:

| # | Section | Anchor | Background |
|---|---|---|---|
| A | Header and navigation: The Cadence, Facilitation, Standards of Fit, FAQ | | Translucent cream with blur |
| B | Hero: "Built for those who carry the ultimate call." Subhead positions The Round as a confidential board of vetted peers for Founders, CEOs and Managing Directors bearing final P&L responsibility | | Navy radial |
| B2 | Fact strip "at a glance": six hairline cells, each with a mono index tag (`01 // Cohort`, `02 // Board`, `03 // Sparring`, `04 // Retreats`, `05 // Confidentiality`, `06 // Governance`), a Montserrat title and a slate line. 3 × 2 on desktop, one column below 768 px | `#glance` | Cream |
| C | Operating architecture: symmetrical 2 × 2 grid of the four in-person touchpoints (Board, Sparring, Immersion, Offsite), then Card 05, the Member Accountability Ledger, as a full-width navy anchor with a terminal panel. The former 3-photo strip is gone | `#cadence` | Paper |
| E | Facilitation Engine: split header (copy left, "6 Hours" metric right) above a connected 4-step pipeline: one continuous hairline with a teal node per step, standardised title height, mono outcome tags | `#facilitation` | Cream |
| F | Standards of fit: bilateral governance compact, `[Admission mandate]` (Who sits at the table) against `[Unconditional exclusion]` (Who is kept out), each with a lead statement and three criteria with bold lead-in anchors (Sovereign responsibility, Radical candor, Total presence / Direct competitors, Commercial pitching, Passive observers), separated by a vertical hairline; below it a two-item guarantee strip (Cohort consent, Discretion compact) | `#fit` | Paper |
| G | Membership terms and governance | `#terms` | Navy radial |
| H | FAQ (10 questions) | `#faq` | White |
| I | Footer | | Cream |

Overlays: the Candidate Review drawer and The Round Charter drawer (both slide in from the right and share the `.drawer` styles), and the Member Portal modal. The Charter drawer lists all 11 points of Schedule 2 and ends with a Candidate Review button that hands over to the application drawer. It also opens from the footer and from the `#charter` link.

Call to action wording: "Request Candidate Review · Barcelona 01" in the hero, mobile menu and terms section; "Candidate Review" in the desktop header; "Request Candidate Review" in the footer. The drawer eyebrow reads "Barcelona 01 · Candidate admission review" and the submit button "Submit for Candidate Review". A privacy line under the button says candidate information is sent over an encrypted connection, treated under Chatham House discretion and never shared.

### Content sourced from The Round Membership Agreement, Version 1.1

| Item | Where it appears |
|---|---|
| Monthly 6-hour board (including private working lunch), hosted in rotation at members' private headquarters in the Barcelona area, 8 to 12 members. FAQ 5 adds that the host provides the meeting room, breakfast and lunch | Fact strip cell 02, cadence card 1, Facilitation Engine stat block, FAQ 1, 2, 5 |
| Monthly 55-minute 1:1 with Dr. Sven Mulfinger, 90-minute pods with 1 to 2 peers | Fact strip, cadence card 2, FAQ 1 |
| 24-Hour Immersion and 3 to 4 day Offsite, each replacing that month's board, programme and facilitation included | Cadence cards 3 and 4, terms, FAQ 6 |
| Ledger data deleted within 30 days of departure | Charter drawer privacy note, FAQ 7 |
| The Round Charter, Schedule 2 (11 points) | Charter drawer, quote in the Card 05 ledger anchor |
| Competitor exclusivity, non-solicitation, Chatham House beyond membership, AI only for anonymised prep | Fact strip, fit compact and guarantee strip, FAQ 3, 7, 8 |
| Membership fee not published (Option B): fixed-cycle retainer in continuous 6-month periods, billed semi-annually in advance; full fee schedule disclosed during candidate review | Terms card 1, FAQ 9, JSON-LD offer and price range |
| €1,000 admission and intake fee (diagnostic framing and onboarding), permanently waived for Founding Members | Terms card 2, FAQ 9, JSON-LD FAQ 9 |
| 30 days' written notice before period end | Terms, FAQ 9 |
| Barcelona 01 strictly capped at 12 seats, admission governed by cohort consent | Fact strip, terms CTA note, application drawer |
| Retreat facilitation included in the retainer, travel and lodging at cost | Terms card 4, FAQ 6 |
| More than three missed sessions per year triggers a review | FAQ 10 |

Any change to these terms must be made in the visible copy and in the JSON-LD block (section 5).

Editorial standard ("Content-First Editorial Reduction", 10 Oct 2026): the page reads as a private board memorandum, not a sales presentation. Cadence cards carry one short paragraph plus a single mono footer tag (`.cadence-footer-tag`), no bullet lists. Fit criteria open with a bold lead-in anchor and colon (`.fit-specs li strong`) for fast scanning; this is the one deliberate exception to the no-bold-label rule, requested on 10 Oct 2026. Admission language is collaborative: cohort consent, never veto rights. The board lunch is always a "private working lunch", never framed as networking or social time. Keep new copy to that density, use UK grammar without the serial comma and never claim data is "encrypted" beyond what is true (the connection is HTTPS).

Pricing policy (Option B): the membership fee is deliberately kept off the public site, out of the JSON-LD and out of this repository. Only the €1,000 admission fee is published. Do not reintroduce the fee figure in copy, schema or documentation.

---

## 4. Behaviour (`site.js`)

Configuration sits in the `CONFIG` object at the top of the file:

| Key | Purpose |
|---|---|
| `passcodeHash` | SHA-256 of the Member Portal passcode (instructions in the file comment) |
| `sessionTtlMs` | Portal session length after the last interaction (4 hours) |
| `nextSessionDate` | Shown in the portal header; hidden once the date has passed |
| `minutesPdfUrl` | Link for the minutes button; empty means "Request Monthly Minutes" by email |
| `contactEmail` | sven@kuma.partners, used in error messages and mailto links |
| `personalEmailDomains` | Blocked in the application form's work email field |

Ledger rows for the portal are in the `LEDGER` array just below `CONFIG`. Keep them anonymised by role.

Modules:

1. Header: shadow on scroll, mobile panel toggle, smooth scrolling with header offset, scroll-spy highlighting.
2. Brand logo fallback: shows the text "Kuma Partners" if `logo-kuma.png` fails to load.
3. Candidate Review drawer: opens from any `[data-open-apply]`, focus trap, Escape and backdrop close, body scroll lock, validation, Netlify AJAX submission, inline success state.
4. Member Portal: passcode check against the hash, session in `sessionStorage`, lockout after 5 failed attempts, ledger table, logout.
5. Scroll reveal and stagger via IntersectionObserver.
6. FAQ accordion: one answer open at a time; questions 5 to 10 sit in `#faq-extended` and are revealed by the "View all 10 questions" toggle; links like `#faq-q7` open that answer directly.
8. The Round Charter drawer: opens from any `[data-open-charter]`, focus trap, Escape and backdrop close, body scroll lock (kept if another overlay is still open), hands over to the application drawer from its own button.
9. Cookie Preferences: the site sets no cookies and no tracking, so the footer link shows a short explanatory note.
10. Cadence swipe hint: adds `is-dismissed` to `[data-swipe-hint]` once the mobile carousel has scrolled 24 px. No effect on desktop, where the hint is hidden.

### Netlify Forms

| Form name | Fields |
|---|---|
| `the-round-apply` | `name`, `email`, `company`, `stage` (labelled "Leadership context"), `inflection_point` (optional, max 600 characters), `privacy_consent`, honeypot `bot-field` |

Field `name` attributes are the Netlify column names: keep them stable. The `apply-*` values are element IDs used for labels and error messages, not submitted names.

`stage` submits one of these values: `founder-scaling` (Founder / CEO, scaling venture or growth stage), `acquired-company` (Acquisition / searcher, recently bought a company or MBI), `managing-merger` (CEO / MD managing an active merger or integration), `exited-founder` (Exited entrepreneur, active chairman or next venture), `pe-backed` (CEO / MD, PE-backed or mid-market enterprise), `corporate-director` (Managing Director, international group or regional P&L), `family-business` (CEO / principal, family business or succession). Submissions made before 10 Oct 2026 carry the old free-text stage labels.

Netlify detects the form from the static HTML on each deploy, but only if form detection is switched on for the site. On newer Netlify sites it is off by default.

1. Netlify dashboard › the site › Forms (or Site configuration › Forms) › Enable form detection.
2. Trigger a new deploy (Deploys › Trigger deploy › Clear cache and deploy site). Detection only runs during a deploy.
3. Check that `the-round-apply` now appears under Forms.
4. Set up email notifications under Forms › Form notifications.

A 404 on submission means the form is not registered: repeat steps 1 and 2. The browser console logs the status code (`[The Round] Form submission failed: 404`).

---

## 5. SEO and GEO

- Title, description, canonical, Open Graph and Twitter card tags in `<head>`, previewing `assets/og-image.jpg`.
- JSON-LD `@graph` with `Organization` (Kuma Partners), `ProfessionalService` (The Round, with founder and address; the offer carries currency and billing period but no price, and `priceRange` reads "Executive Advisory Retainer · Disclosed on Review") and `FAQPage` (all 10 questions).
- The FAQPage answers use exactly the same wording as the visible answers, as Google requires. All 10 answers are in the static HTML so crawlers and AI tools can read them.
- FAQ 4 describes traditional CEO peer networks generically. No third-party network is named anywhere on the site or in this repository.

---

## 6. Security notes

- The Member Portal gate runs in the browser. It keeps casual visitors out, but anyone can read `site.js`. Never put real member names or confidential data in `LEDGER`, and never commit the plain passcode. For real protection, enable Netlify password protection or Netlify Identity on the subdomain.
- Use a long passcode. A short or guessable one can be recovered from its hash.
- Do not put minutes PDFs in this repository: every file here is public. Link to a restricted location through `minutesPdfUrl` instead.
- `_headers` sets X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS and Permissions-Policy, plus a 7-day cache on `/assets/*`.

---

## 7. Deployment

1. Unzip over your local copy of the repository. Unzipping does not delete files, so remove any file that no longer appears in the structure above. Current list to delete: the old `app.js`, `assets/photos/cadence-sanctuary-table.*` and, since 10 Oct 2026, `assets/photos/round-deliberation-catalonia.*`, `round-terrace-immersion.*` and `round-alpine-sanctuary.*`.
2. Commit and push:

   ```bash
   git add -A
   git commit -m "Describe the change"
   git push origin main
   ```

3. Netlify settings: build command empty, publish directory `.` (root).
4. Custom domain `theround.kuma.partners` with HTTPS enforced.
5. After deploy, check: the application form arrives in Netlify Forms, the portal opens, and the link preview renders (for example with the LinkedIn Post Inspector).

---

## 8. Maintenance protocol

- Reuse the existing CSS custom properties. Do not introduce new colours, radii or border widths.
- Keep every border at 1 px.
- Keep the visible copy and the JSON-LD block in sync for any change to terms, locations, pricing or FAQ wording.
- Update this README with every change to code, design tokens, sections, legal terms, file paths or assets, and add an entry to the changelog below.

---

## 9. Open items

- Confirm usage rights for the Card 3 image (`cadence-immersion-patio`). If it was AI-generated or AI-enhanced rather than photographed at the actual retreat venue, decide whether the card should say so or use a real photo of the venue.
- Confirm that everyone recognisable in `cadence-offsite-costa-brava` has agreed to appear on the site.
- Confirm that everyone recognisable in `cadence-peer-board` has agreed to appear on the site.
- Replace `LEDGER` sample rows with real (anonymised) entries once the cohort starts.
- Set `minutesPdfUrl` when the first minutes are available.

---

## 10. Changelog

All dates 2026.

| Date | Change |
|---|---|
| 10 Oct | Card 03 image replaced with the sharp, high-resolution Catalonia retreat version (same file names, `.webp` and `.jpg`, exact 16:9). Alt text updated to "Secluded Catalonia masia retreat patio, seating area and covered outdoor kitchen". Card structure, layout and mobile snap unchanged. |
| 10 Oct | Clarified monthly board duration to specify inclusion of private working lunch across Fact Strip, Cadence Card 01, and Facilitation Engine header. |
| 10 Oct | Candidate Review drawer and FAQ contact: the FAQ sidebar's mailto link is replaced by a drawer trigger ("Request Candidate Review & Confidential Diagnostic"), so FAQ inquiries route into the form. Drawer intro shortened; "Stage" becomes "Leadership context" with seven options (adds acquisition/searcher, active merger, exited founder and family business); inflection point is now a two-line field, 600 characters, no counter; field labels set in mono caps. Netlify form tag, honeypot, hidden `form-name` and all field names unchanged (end-to-end submit tested). |
| 10 Oct | Tone restoration on the new layout: guarantee strip now reads Cohort consent ("review and consent to every incoming candidate") instead of veto rights; fit criteria restored with bold lead-in anchors and revised copy (Total presence, Direct competitors, Commercial pitching, Passive observers); Card 04 title restored to "The Annual Executive Offsite & Sanctuary"; terminal actionable status set to amber `#D97706`, active stays teal-on-dark. Layout (2 × 2 cadence, ledger anchor, connected pipeline, no photo strip) unchanged. |
| 10 Oct | Integrated Improvements 1–4: elevated Fact Strip indexes, Facilitation Engine horizontal pipeline, bilateral Standards of Fit governance grid, and symmetrical 2x2 Cadence touchpoints with full-width Ledger anchor span. Detail: proof ribbon and its three photo pairs removed, "Environment" dropped from header and footer navigation; section backgrounds re-sequenced (cream facts, paper cadence, cream facilitation, paper fit); `SwipeHint` in `site.js` now targets `.cadence-touchpoints-grid`; old cadence, engine, fit and proof-ribbon CSS retired. Netlify form markup unchanged (verified by diff). |
| 10 Oct | Optimized mobile viewport (<768px): above-the-fold CTA stacking, horizontal cadence touch carousel, 2x2 terms grid, and native bottom-sheet modal drawers. Laptop/desktop views kept completely untouched. Detail: hero padding 92/40 px, h1 and subhead margins tightened, primary CTA min-height 48 px, secondary link 44 px tap target; swipe hint now reads "← Swipe to explore formats →"; terms values 1.1rem with unbroken hairline dividers; the `sheetIn` keyframe moved inside the mobile media query. Verified: every CSS rule outside `@media (max-width: 767px)` is byte-identical to the previous build, and desktop screenshots at 768, 1024 and 1440 px match apart from photo-decoding noise that also appears between two runs of the unchanged baseline. |
| 10 Oct | Editorial design refactor. Tokens: paper `#FDFDFC`, ink `#111827`, hairlines `rgba(0,0,0,.08)`, system monospace stack, radii down to 2 px, easing `cubic-bezier(.16,1,.3,1)`, all card shadows removed. Hero moved onto the navy radial with a 2.4 to 4.2rem fluid h1 and a mono eyebrow. Pills replaced by mono tags (hero, cadence frequency, fit, engine, portal badges). Fact strip, Facilitation Engine, fit section, integrity compact and terms rebuilt as hairline layouts without boxes; fit is a 7:5 asymmetric spread with a vertical rule. Ledger telemetry restyled as a terminal with `[STATUS: …]` and `[DUE: …]` tags; Charter quote in Lato italic. Terms values tabular, scarcity note in mono (`// Barcelona 01 capped at 12 seats · Admission by cohort consent`). Mobile layer (below 768 px) updated for the new dividers. Netlify form markup and `site.js` untouched. |
| 10 Oct | Editorial reduction across `index.html`: new hero subhead (adds Managing Directors and P&L responsibility); new `#glance` fact strip under the hero; cadence cards cut to one paragraph plus a micro-spec line each; fit section rewritten as a two-column filter; terms lead and card details tightened ("Waived for Founding Members of Barcelona 01"); drawer eyebrow, intro and submit label reframed as an admission review, plus a privacy line. Meta description, OG/Twitter text and the JSON-LD service description synchronised. CSS: new section 07b (fact strip), `.fit-text`, `.form-privacy`, mobile rules for the strip; unused `.cadence-features` and `.fit-list` rules removed. `site.js` submit-label fallback updated. |
| 10 Oct | Mobile refactor below 768 px: stacked hero with full-width CTA, cadence swipe carousel with scroll snap and swipe hint, stacked telemetry badges, compact 2 × 2 terms grid, bottom-sheet drawers and portal with safe-area padding, 44 px close buttons, 16 px inputs, 1.25rem gutter. Non-breaking spaces keep "Barcelona 01" and trailing arrows together. New `SwipeHint` module in `site.js`. Desktop (768 px and up) verified pixel-identical. |
| 9 Oct | Netlify form hardening: raw `netlify` attribute added next to `data-netlify`, honeypot paragraph hidden inline, `form-name` re-asserted in the AJAX payload, failure status logged to the console. README now documents enabling form detection in Netlify. |
| 9 Oct | Updated Card 03 media to high-resolution Catalonia masia terrace photograph (`cadence-immersion-patio`). Alt text updated; `object-position: center 60%`. |
| 9 Oct | Updated Hero headline and subhead to authoritative positioning ('Built for those who carry the ultimate call'). Synchronized OpenGraph and meta descriptions. JSON-LD service description updated. |
| 9 Oct | Card 05 redesigned: operating-compact pill, new subtitle, illustrative ledger telemetry panel (two anonymised entries with status pills), Charter quote, and two actions (Charter, Member Sign-In). New The Round Charter drawer with the 11 points of Schedule 2 and a GDPR note. Charter link added to the footer. |
| 9 Oct | Refactored #terms to Option B: transitioned subscription fee to candidate-review disclosure to enhance executive exclusivity and alignment with high-touch advisory positioning. New eyebrow, lead and four governance cards; FAQ 9 rewritten in HTML and JSON-LD; numeric price removed from the JSON-LD offer; `.term-value--text` enlarged to 1.35rem. |
| 9 Oct | Updated Card 04 media to authentic Costa Brava retreat working session (`cadence-offsite-costa-brava`). Outdoor table crop (`cadence-sanctuary-table`) removed. Card 4 returns to the standard 16:9 frame with `object-position: center 35%`. |
| 9 Oct | Cadence card media: cards 1 to 4 now open with a flush 16:9 photo (peer board, sparring, finca courtyard, outdoor table) above a hairline divider, with a subtle zoom on hover; the ledger card stays typographic on navy. Four new image pairs added to `assets/photos/`. Nameplates blurred in the boardroom photo. Wide fourth card uses a 21:9 frame on desktop. |
| 9 Oct | Exclusivity and terms update: admission fee raised to €1,000 and permanently waived for Founding Members; date-gating removed from the page and from `site.js`; terms subhead and scarcity note (12 seats, cohort consent) rewritten; all calls to action renamed to Candidate Review; drawer headline and intro rewritten; FAQ 4 rewritten without naming any third-party network (HTML and JSON-LD); FAQ 9 updated in HTML and JSON-LD. Buttons now wrap on phones so the longer labels fit. |
| 9 Oct | README added. Plain passcode removed from the `site.js` comment. Navigation renamed (The Cadence, Facilitation, Environment, Standards of Fit, FAQ) with collapse at 1100 px. Apple-style card gradients, hero wash, 2 px hover lift with teal border, navy focal shadow on the ledger card. Integrity box extended to three points (non-solicitation added). Application fields renamed. Cookie Preferences note added. |
| 9 Oct | FAQ section (10 questions, accordion, "view all" toggle) and FAQPage JSON-LD added; footer moved to cream. |
| 9 Oct | Restructured to Membership Agreement v1.1: new hero, detailed cadence cards, Facilitation Engine, standards of fit, membership terms, application drawer. `app.js` renamed to `site.js`. Contact changed to sven@kuma.partners. Founding Member waiver date-gated. |
| 9 Oct | Favicon set, apple-touch icon, `favicon.ico` and Open Graph image generated from the transparent Kuma mark. |
| 9 Oct | Proof ribbon with three optimised photos added under the cadence cards. |
| 9 Oct | Design system realigned with kuma.partners: midnight navy and new teal, self-hosted Montserrat and Lato, 1 px hairlines, scroll reveal and stagger, grid-row collapsible navigation. |
| 29 Sep | Launch build: `_headers` added, passcode hashed, ledger columns and status labels finalised. |
| 29 Sep | Kuma Partners logo assets added, header lockup and text fallback. |
| 29 Sep | Narrative reframed as a year-round operating system: cadence, toolkit, retreats, caliber, application. |
| 29 Sep | Initial build: landing page, Netlify application form, client-side Member Portal. |

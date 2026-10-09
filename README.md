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
        ├── cadence-offsite-costa-brava.webp / .jpg Cadence card 4 (16:9)
        ├── round-deliberation-catalonia.webp / .jpg  Proof ribbon
        ├── round-terrace-immersion.webp / .jpg       Proof ribbon
        └── round-alpine-sanctuary.webp / .jpg        Proof ribbon
```

Photo source files and their web names:

| Source file | Web file | Caption |
|---|---|---|
| The round offsite Cataluña.png | round-deliberation-catalonia | Executive Board Deliberations · Closed-Door Sparring |
| offsite bavaria 3.jpg | round-terrace-immersion | The 24-Hour Immersion · Deep Working Sessions |
| IMG_1814.jpeg | round-alpine-sanctuary | Sanctuary & Headspace · Secluded Nature Environments |
| The Round monthly meeting 1.jpeg | cadence-peer-board | Card 1: cropped to 16:9, desk nameplates blurred |
| Sven Mulfinger Listening.png | cadence-sparring-barcelona | Card 2: cropped to 16:9 |
| Masia cataluña.jpeg (full resolution) | cadence-immersion-patio | Card 3: cropped to 16:9 at 60% from the top, `object-position: center 60%` |
| Offsite meeting Costa Brava.jpeg | cadence-offsite-costa-brava | Card 4: cropped to 16:9 at 35% from the top, `object-position: center 35%` |

Source files were renamed (no spaces or accents) and resized for the web (1024 px wide).


### Cadence card media rationale

Cards 1 to 4 carry a flush 16:9 photo above a hairline divider, anchoring each format in a real room or retreat setting: the boardroom, the 1:1 conversation, the Catalonia masia terrace and the Costa Brava offsite working session. Card 5, the Member Accountability Ledger, carries no photo and stays on the navy radial: it is the digital execution layer, and the contrast marks the shift from rooms to record. In place of a photo it shows an illustrative ledger panel (two anonymised entries with context, action, due date, sparring partner and status), a quote from The Round Charter, and two actions: "View The Round Charter (Schedule 2)" opens the Charter drawer, "Member Sign-In" opens the portal. The ledger entries are static illustrations, not live data.

---

## 2. Design system

Mirrors the design language of kuma.partners. All values live as CSS custom properties in `:root` at the top of `styles.css`.

### Colour tokens

| Token | Value | Use |
|---|---|---|
| `--navy` | `#0B1523` (11, 21, 35) | Headings, primary buttons, navy sections |
| `--navy-hover` | `#16283D` | Primary button hover |
| `--teal` | `#1D6F8A` (29, 111, 138) | Accents, eyebrow bar, links, buttons on navy |
| `--teal-on-dark` | `#8DB7C5` | Small accent text on navy |
| `--cream` | `#F8F9FA` | Alternate section background |
| `--ink` | `#1A1A1A` | Body text |
| `--muted` | `#5A6D7C` | Secondary text |
| `--hairline-color` | `#E2E8F0` | Every border |

### Surfaces

| Token | Value |
|---|---|
| `--hero-wash` | `linear-gradient(180deg, rgba(29,111,138,.08) 0%, transparent 60%)` |
| `--card-bg` | `linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)` |
| `--card-sheen` | `inset 0 1px 0 rgba(255,255,255,.9), 0 1px 3px rgba(11,21,35,.04)` |
| `--card-lift` (hover) | `inset 0 1px 0 rgba(255,255,255,.9), 0 8px 24px -12px rgba(11,21,35,.12)` |
| `--navy-radial` | `radial-gradient(120% 85% at 50% 0%, #152740 0%, #0B1523 100%)` |
| `--navy-focal-shadow` | `inset 0 1px 0 rgba(255,255,255,.15), 0 18px 40px -20px rgba(11,21,35,.45)` |

Card hover: lift 2 px, teal border, `--card-lift` shadow, 0.2 s ease.

### Typography

| Role | Family | Weights |
|---|---|---|
| Headings, badges, card titles | Montserrat | 600, 700, 800 (line-height 1.15 to 1.3) |
| Body, navigation, forms | Lato | 300, 400, 700 (line-height 1.6) |
| Subheads and quotes | Montserrat italic, teal | 400 |
| Counters, indices, metadata | `'SF Mono', 'Menlo', monospace` | |

Fonts are served from `assets/fonts/` via `@font-face`. Google Fonts is deliberately not used, because loading it sends every visitor's IP address to Google, which German courts have treated as a GDPR breach.

### Shape and rhythm

- Every border is `1px solid var(--hairline-color)`. Never 2 px or 3 px.
- Radii: `--radius-xs` 2 px (buttons, inputs), `--radius-sm` 4 px, `--radius-md` 6 px (cards), `--radius-lg` 8 px (panels, modals), `--radius-pill` 999 px (badges).
- Container: 1120 px max width, 32 px side padding (24 px at 960 px and below, 16 px at 640 px and below).
- Section padding: 96 px desktop, 80 px tablet, 64 px mobile.
- Eyebrows: Lato 700, 0.78rem, uppercase, 0.12em tracking, navy, with a 28 × 3 px teal bar before.

### Motion

- `.reveal-on-scroll`: fades in and rises 24 px, 650 ms `cubic-bezier(.2,.8,.2,1)`.
- `.reveal-stagger`: children enter at 0, 90, 180, 270 ms (fifth and later at 360 ms).
- Collapsibles (mobile menu, FAQ answers, "view all" FAQ) animate `grid-template-rows` from `0fr` to `1fr`.
- Hidden starting states only apply once `site.js` adds `class="js"` to `<html>`, so the page is fully readable without JavaScript.
- `prefers-reduced-motion: reduce` switches all motion off.

### Breakpoints

| Width | Change |
|---|---|
| 1100 px and below | Navigation collapses into the drop-down panel |
| 1024 px and below | Engine and terms grids go to 2 columns |
| 960 px and below | Cadence grid goes to 2 columns, ledger table stacks |
| 860 px and below | FAQ goes to one column |
| 768 px and below | Proof ribbon, fit cards and integrity box go to one column |
| 640 px and below | Everything single column, modals full screen |

---

## 3. Page sections

Section order and background cadence:

| # | Section | Anchor | Background |
|---|---|---|---|
| A | Header and navigation | | Translucent cream with blur |
| B | Hero: "Built for those who carry the ultimate call." Subhead positions The Round as a confidential board of peers for Founders and CEOs bearing final responsibility | | White with teal wash |
| C | Year-round cadence (4 photo cards + ledger card) | `#cadence` | Cream |
| D | Proof ribbon (3 photos) | `#environment` | Cream (inside C) |
| E | Facilitation Engine (4 cards) | `#facilitation` | White |
| F | Standards of fit and cohort integrity | `#fit` | Cream |
| G | Membership terms and governance | `#terms` | Navy radial |
| H | FAQ (10 questions) | `#faq` | White |
| I | Footer | | Cream |

Overlays: the Candidate Review drawer and The Round Charter drawer (both slide in from the right and share the `.drawer` styles), and the Member Portal modal. The Charter drawer lists all 11 points of Schedule 2 and ends with a Candidate Review button that hands over to the application drawer. It also opens from the footer and from the `#charter` link.

Call to action wording: "Request Candidate Review · Barcelona 01" in the hero, mobile menu and terms section; "Candidate Review" in the desktop header; "Request Candidate Review" in the footer. The drawer submit button reads "Submit for Review".

### Content sourced from The Round Membership Agreement, Version 1.1

| Item | Where it appears |
|---|---|
| Monthly 6-hour board, Barcelona area, 8 to 12 members, rotating hosts with breakfast and lunch | Cadence card 1, FAQ 1, 2, 5 |
| Monthly 55-minute 1:1 with Dr. Sven Mulfinger, 90-minute pods with 1 to 2 peers | Cadence card 2, FAQ 1 |
| 24-Hour Immersion and 3 to 4 day Offsite, each replacing that month's board, programme and facilitation included | Cadence cards 3 and 4, terms, FAQ 6 |
| Ledger data deleted within 30 days of departure | Charter drawer privacy note, FAQ 7 |
| The Round Charter, Schedule 2 (11 points) | Charter drawer, quote on cadence card 5 |
| Competitor exclusivity, non-solicitation, Chatham House beyond membership, AI only for anonymised prep | Integrity box, FAQ 3, 7, 8 |
| Membership fee not published (Option B): fixed-cycle retainer in continuous 6-month periods, billed semi-annually in advance; full fee schedule disclosed during candidate review | Terms card 1, FAQ 9, JSON-LD offer and price range |
| €1,000 admission and intake fee (diagnostic framing and onboarding), permanently waived for Founding Members | Terms card 2, FAQ 9, JSON-LD FAQ 9 |
| 30 days' written notice before period end | Terms, FAQ 9 |
| Barcelona 01 strictly capped at 12 seats, admission governed by cohort consent | Terms CTA note, application drawer |
| Retreat facilitation included in the retainer, travel and lodging at cost | Terms card 4, FAQ 6 |
| More than three missed sessions per year triggers a review | FAQ 10 |

Any change to these terms must be made in the visible copy and in the JSON-LD block (section 5).

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

### Netlify Forms

| Form name | Fields |
|---|---|
| `the-round-apply` | `name`, `email`, `company`, `stage`, `inflection_point` (optional), `privacy_consent`, honeypot `bot-field` |

Netlify detects the form from the static HTML on each deploy. Set up email notifications under Site settings › Forms.

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

1. Unzip over your local copy of the repository. Unzipping does not delete files, so remove any file that no longer appears in the structure above (for example the old `app.js`).
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

- Confirm usage rights for the masia photo (`cadence-immersion-patio`).
- Confirm that everyone recognisable in `cadence-offsite-costa-brava` has agreed to appear on the site.
- Confirm that everyone recognisable in `cadence-peer-board` has agreed to appear on the site.
- Replace `LEDGER` sample rows with real (anonymised) entries once the cohort starts.
- Set `minutesPdfUrl` when the first minutes are available.

---

## 10. Changelog

All dates 2026.

| Date | Change |
|---|---|
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

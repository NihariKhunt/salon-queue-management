# AGENTS.md — Salon Queue Management System

## Project Summary

A real-time, bilingual (English/Gujarati) queue management system for a walk-in hair salon, allowing customers to join from their phones, staff to manage the queue from their own devices, and a TV screen to display live status.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Real-time | Socket.IO on a Node.js backend |
| Language | JavaScript (or TypeScript if the team prefers) |

### Theme colours
| Token | Hex |
|-------|-----|
| Charcoal (primary background/text) | `#1F2937` |
| Gold (accents, CTAs, highlights) | `#D4A017` |

### Run the project
```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

---

## Docs

| Document | Purpose |
|----------|---------|
| [docs/01-brief.md](docs/01-brief.md) | Project overview, users, features, out-of-scope items |
| [docs/02-screens.md](docs/02-screens.md) | Full screen-by-screen reference: layout, behaviour, states |
| [docs/03-flows-rules.md](docs/03-flows-rules.md) | Customer flows, status model, queue rules, test checklist |

---

## Working Rules

### Before writing any code
1. **Read the three docs above in full** before touching any file.
2. Keep one **single source of truth** for all queue logic (statuses, transitions, "call next" selection). Do not duplicate this logic in multiple components.

### Scope discipline
3. Build **one screen or one feature per coding task**. Do not bundle multiple screens into a single PR or commit.
4. **Do not add** anything from the out-of-scope list: online payments, future appointments, SMS/WhatsApp messaging, loyalty features, or multi-branch support.
5. Do not add npm packages, services, or API calls that are not required by the assignment docs.

### Layouts and i18n
6. Customer-facing screens (`/`, `/join`, `/status/:id`) must be **mobile-first** and readable on a small phone screen.
7. All user-visible text must use a **language file** (e.g. `src/i18n/en.js` and `src/i18n/gu.js`). Never hard-code English strings directly in JSX unless they are developer-only labels.
8. Every service name must store both a `nameEn` and a `nameGu` field.
9. Any Gujarati string that has not been confirmed by a fluent speaker must be commented `// TODO: verify translation` in `gu.js`. Do **not** invent uncertain Gujarati text.

### Real-time updates
10. Status changes (called, in chair, done, no-show) must propagate to all open screens **without requiring a manual page refresh**.

### Queue rules (non-negotiable)
11. Statuses only move **forward** — never backwards.
12. A customer who requested a specific barber must **never** be assigned to a different barber.
13. Only **one active queue entry** per phone number at any time.
14. Online joining closes **30 minutes before that day's configured closing time**; walk-in entry via reception stays open.
15. If in doubt about a rule, refer to `docs/03-flows-rules.md` — do not invent behaviour.

---

## Checklist Before Marking a Task Complete

- [ ] Screen matches the layout described in `docs/02-screens.md`
- [ ] All labels exist in both `en.js` and `gu.js`
- [ ] Queue rule logic lives in one shared location (not duplicated)
- [ ] Empty state and error state are handled
- [ ] Responsive breakpoints match the target device noted in the screen doc
- [ ] No out-of-scope features have been added

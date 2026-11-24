# Salon Queue Management System

> **Live Deployment:** [https://salon-queue-management.vercel.app](https://salon-queue-management.vercel.app) *(Deploy via Vercel GitHub integration or `vercel deploy`)*  
> **Demo Staff PIN:** `1234` *(Required for Reception Desk, Barber Station, and Owner Admin screens)*  
> **GitHub Repository:** [https://github.com/NihariKhunt/salon-queue-management](https://github.com/NihariKhunt/salon-queue-management)

---

## 📌 Project Overview

A real-time, bilingual (**English & Gujarati**) queue management system for a walk-in hair salon. Built for the **MSc IT Vibe Coding Lab Assignment**, this platform enables:
1. **Remote Customers** to join the queue from their mobile browser, pick up to 3 services, select a preferred barber or "Any barber", and monitor their live token position and wait time.
2. **Receptionists** to manage desk walk-ins, call the next eligible customer, handle cancellations, and record no-shows on a landscape tablet layout.
3. **Barbers** to track their assigned customer, run an active service stopwatch, transition to "Done", view upcoming tickets, and toggle break status.
4. **Waiting Area Guests** to follow a high-contrast 1080p TV board displaying real-time barber statuses and a 5-ticket "Next Up" queue.
5. **Salon Owners** to configure service offerings, prices, durations, staff rosters, weekly hours schedules, and monitor daily statistics.

---

## 🎨 Theme & Design Specs

- **Primary Background / Text:** Charcoal (`#1F2937`)
- **Accent / Highlights / CTAs:** Gold (`#D4A017`)
- **Language Switcher:** Persistent English (`EN`) and Gujarati (`ગુજરાતી`) toggle on all navigation screens.
- **Barber Avatars:** Elegant initials circle avatars with color-coded status badges (Green = Available, Amber = On Break, Grey = Off Duty).

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18, Vite | Mobile-first SPA, high performance |
| **Routing** | React Router v6 | Client-side routing for 7 dedicated screens |
| **Styling** | Tailwind CSS | Responsive charcoal & gold utility design |
| **Real-time** | Socket.IO Client & Server | Sub-second state synchronization across all screens |
| **Backend** | Node.js, Express | REST API, state broadcasts & queue algorithms |
| **Persistence** | Persistent JSON DB (`server/data/salon_db.json`) + Client Dual-Mode Sync | Durable disk write-through & multi-tab BroadcastChannel |

---

## 🚀 Running the Project Locally

### 1. Prerequisites (Install Node.js)
If Node.js is not already installed on your machine:
1. Visit the official Node.js website: [https://nodejs.org](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** installer for Windows (e.g. `v20.x` or `v22.x`).
3. Run the downloaded `.msi` file and follow the setup wizard (ensure **"Add to PATH"** remains checked).
4. Restart your PowerShell or terminal window and verify by running:
   ```powershell
   node --version
   npm --version
   ```

### 2. Install Project Dependencies
Open your terminal in the project directory (`e:\salon queue`):
```powershell
# Install root, client, and server dependencies
npm run install:all
npm install --prefix server
npm install --prefix client
```

### 3. Start Development Server
Run both the backend server and frontend client concurrently with a single command:
```powershell
npm run dev
```

* **Frontend Client:** [http://localhost:5173](http://localhost:5173)
* **Backend Socket Server:** [http://localhost:3001](http://localhost:3001)

*(Note: Localhost operates only while these development terminal processes remain active.)*

---

## 📱 The Seven Screens

| # | Screen | URL | Target Device | Description |
|---|--------|-----|---------------|-------------|
| 1 | **Home** | `/` | Mobile | Live salon open/closed badge, queue summary, barber pills, and prominent "Join Queue" button. |
| 2 | **Join Queue** | `/join` | Mobile | 3-step registration: Personal details, Service multi-select (up to 3), and Barber selection with live summary. |
| 3 | **My Status** | `/status/:id` | Mobile | Customer token tracker: live position, wait estimate, 2nd-in-line alert, "It's your turn!" banner, cancel button. |
| 4 | **Reception** | `/reception` | Tablet | Barber chair cards, "Call Next", Walk-in modal, waiting list, over-60m warning, No-show & Cancel actions. *(Staff PIN: `1234`)* |
| 5 | **Barber View** | `/barber/:name` | Mobile | Active customer ticket, Start / Done actions, service timer, Next Up preview, Available/Break switch. *(Staff PIN: `1234`)* |
| 6 | **Waiting Area TV** | `/display` | TV (1080p) | Big-screen status board showing each barber's chair, next 5 tokens, and gold flashing banner when a ticket is called. |
| 7 | **Owner Settings**| `/admin` | Desktop/Tablet| Master data: Services CRUD (EN/GU), Barber roster, Weekly hours schedule, Online queue switch, Today's metrics. *(Staff PIN: `1234`)* |

---

## ⚖️ Queue Rules & Business Logic

1. **Forward-Only Transitions:**
   `Waiting ──► Called ──► In chair ──► Done`  
   `Waiting ──► Cancelled`  
   `Called  ──► No-show`  
   Statuses never move backwards.
2. **Strict Barber Preference:** A customer requesting a specific barber is never reassigned to another barber.
3. **Flexible "Any Barber":** Customers choosing "Any" are matched with whichever eligible barber calls next.
4. **Duplicate Prevention:** Exactly one active queue spot per 10-digit mobile number (`Waiting`, `Called`, or `In chair`).
5. **No-Show Rule:** Only reception can manually mark a no-show after a 10-minute grace period. Returning customers receive a brand-new token at the end of the queue.
6. **Online Cutoff Window:** Configurable by day of week; online joining closes **30 minutes before closing time**, while desk walk-ins remain accepted.
7. **Wait Estimation:** Total service minutes ahead divided by eligible available barbers. If no eligible barber is active, shows: *"Wait time unavailable — please ask reception."* (Never divides by zero).

---

## ✅ Test Checklist Verification (docs/03-flows-rules.md)

| # | Area | Test Description | Result | Details |
|---|------|------------------|:------:|---------|
| 1 | **Multiple Services & Totals** | Select up to 3 services on `/join` | **PASS** | Dynamic price and duration tally; enforces maximum 3 selections. |
| 2 | **Duplicate Phone Number** | Enter already-active 10-digit mobile | **PASS** | Rejects duplicate; automatically redirects customer to existing `/status/:id`. |
| 3 | **Barber Preference on "Call Next"** | Call next for specific vs "Any" | **PASS** | Barber A receives only Barber A requests or "Any"; never Barber B tickets. |
| 4 | **Call Notification (<5s)** | Reception calls ticket while `/status/:id` is open | **PASS** | Gold "It's your turn!" banner animates immediately without manual reload. |
| 5 | **Start / Done Multi-Screen Sync** | Barber clicks Start and Done | **PASS** | Status updates to "In chair" with timer, then "Done", broadcasting to TV and Reception. |
| 6 | **No-Show and Rejoin at End** | Reception marks No-show; customer rejoins | **PASS** | Spot released; customer rejoins at end with a new sequential token number. |
| 7 | **Closed Online Queue** | Master toggle closed or within 30m of closing | **PASS** | "Queue closed" banner displayed; join button disabled; reception walk-ins remain open. |
| 8 | **Gujarati Labels (Bilingual)** | Toggle language switch to ગુજરાતી | **PASS** | All user-visible labels switch dynamically; all unverified strings marked `// TODO: verify translation`. |
| 9 | **Wait-Time Live Updates** | Queue progresses or barbers change break status | **PASS** | Remaining wait estimates adjust dynamically; displays helpful fallback when barbers are on break. |
| 10 | **Phone / Tablet / TV Sync** | Multiple devices open simultaneously | **PASS** | Changes synchronize across all client views within 1 second via Socket.IO & BroadcastChannel. |

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub: `https://github.com/NihariKhunt/salon-queue-management`
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import `salon-queue-management`.
4. Set the **Framework Preset** to `Vite`.
5. Deploy! Vercel will automatically build the client using `vercel.json` and serve all 7 routes with client-side SPA routing.

# Screens Reference

This document describes every screen in the Salon Queue Management System: its purpose, URL, layout, interactive behaviour, responsive breakpoints, and what it shows when empty or when an error occurs.

---

## 1. Home — `/`

### Purpose
Landing page for anyone who opens the app. Shows whether the salon is open, gives a live snapshot of the queue, and lets customers start joining.

### Layout (top to bottom)
1. **Header bar** — salon name (large, gold on charcoal), current time
2. **Status badge** — green "Open" or red "Closed"; if closed, shows the reason (e.g. "Online joining paused 30 min before closing")
3. **Queue summary card** — total customers waiting, shortest estimated wait
4. **Barber availability strip** — one pill per barber: green (available), amber (on break), grey (off duty)
5. **Join Queue button** — prominent gold button; disabled and labelled "Queue Closed" when online joining is off

### Button behaviour
- **Join Queue** → navigates to `/join`; if the user's phone number already has an active spot, it redirects straight to `/status/:id`

### Responsive
| Breakpoint | Notes |
|------------|-------|
| Mobile (<640 px) | Single column, full-width cards |
| Tablet (≥768 px) | Barber pills in a two-column grid |
| TV / large | Not the primary target; still readable |

### Empty / error states
- If no barbers are on duty: "No barbers are on duty today."
- If the queue count cannot be loaded: "Live data unavailable — please refresh."

---

## 2. Join Queue — `/join`

### Purpose
Lets a customer register for the queue by providing their details and preferences.

### Layout (top to bottom)
1. **Progress indicator** — Step 1 of 3 / Step 2 of 3 / Step 3 of 3
2. **Step 1 — Personal details**
   - Name field (required, free text)
   - Phone field (required, exactly 10 digits, numeric keyboard)
   - Validation error shown inline below the field
3. **Step 2 — Service selection**
   - Grid of service cards (name in English + Gujarati, price, duration)
   - Each card is tappable; selected cards get a gold border and a tick
   - Maximum 3 selections enforced — extra taps show "You can select up to 3 services"
   - Running total (price and estimated minutes) shown at the bottom of the step
4. **Step 3 — Barber preference**
   - Barber cards with photo placeholder, name, and "On break" badge if applicable
   - "Any barber" option always listed first
   - If the preferred barber is on break, a yellow notice explains the wait may be longer
5. **Summary strip** — total price, total time, estimated wait in queue (live)
6. **Confirm button** — submits the form; shows a spinner while saving

### Button behaviour
- **Confirm** → on success, navigates to `/status/:id` with the new token
- If the phone number already has an active queue entry → redirects to that existing `/status/:id` and shows a toast "You're already in the queue"
- **Back** on each step → returns to the previous step without losing entered data

### Responsive
| Breakpoint | Notes |
|------------|-------|
| Mobile | Full-width steps, single-column service grid |
| Tablet | Two-column service card grid |

### Empty / error states
- No services configured: "No services are available right now. Please ask reception."
- All barbers on break: note shown; customer can still pick "Any barber"
- Network error on submit: "Could not save your spot — please try again."

---

## 3. My Status — `/status/:id`

### Purpose
Personal status page for a customer. Stays open on their phone while they wait.

### Layout (top to bottom)
1. **Token number** — very large, gold, e.g. "Token #42"
2. **Position in queue** — "You are #3 in line"
3. **Estimated wait** — "About 18 minutes" (updates live)
4. **Barber assigned** — shown once a barber calls them
5. **Status banner** (changes over time):
   - Waiting → grey banner "You're in the queue"
   - 2nd in line → amber banner "Get ready — almost your turn!"
   - Called → gold animated banner "It's your turn! Please go to [Barber Name]"
6. **Services list** — the services the customer selected with prices
7. **Cancel button** — text link; opens a confirmation modal ("Are you sure you want to leave the queue?")

### Button behaviour
- **Cancel → Confirm** → status set to Cancelled; page shows "You have left the queue. Scan to rejoin."
- **Cancel → Dismiss** → returns to status page

### Responsive
| Breakpoint | Notes |
|------------|-------|
| Mobile | Primary target; large text, easy to read in a noisy environment |
| Tablet | Centred card layout |

### Empty / error states
- Invalid or expired token: "This queue spot was not found. It may have been cancelled."
- Status = Done: "Your service is complete. Thank you for visiting!"

---

## 4. Reception Dashboard — `/reception`

### Purpose
Central control panel for the receptionist. Designed for a landscape tablet kept at the front desk.

### Layout (top to bottom, landscape)
**Left panel (40%)**
1. **Barber cards grid** — one card per barber showing: name, current customer token, status (available / in chair / on break)
2. **Add Walk-in button** — opens a slide-over drawer with the same fields as `/join` (name, phone, services, barber preference)

**Right panel (60%)**
3. **Waiting list** — ordered by arrival time; each row shows: token, customer name, services, barber preference, wait time (red if >60 min)
4. **Row actions** — tapping a row reveals: "Call Next for [Barber]", "Cancel", "Mark No-show"
5. **Queue summary footer** — total waiting, avg wait, no-shows today

### Button behaviour
- **Call Next** → assigns the earliest eligible customer to the barber; updates all screens instantly
- **Cancel** → opens confirmation modal; sets status to Cancelled
- **No-show** → opens confirmation modal; sets status to No-show (available only for Called customers)
- **Add Walk-in** → same validation as `/join`; on success adds token to list

### Responsive (this screen is landscape-tablet-primary)
| Breakpoint | Notes |
|------------|-------|
| Landscape tablet (≥1024 px) | Two-panel layout as above |
| Portrait tablet / phone | Stacks to single column; reduced functionality notice shown |

### Empty / error states
- No customers waiting: "Queue is clear — ready for the next customer."
- All barbers on break: amber banner "All barbers are currently on break."

---

## 5. Barber View — `/barber/:name`

### Purpose
Personal dashboard for a single barber. Designed for their own phone.

### Layout (top to bottom)
1. **Barber name** — header
2. **Availability toggle** — large pill switch: "Available" (green) / "On Break" (amber)
3. **Current customer card** — token, customer name, services, running service timer (MM:SS)
   - **Start button** (before service starts) → starts the timer, updates customer status to "In chair"
   - **Done button** (while timer running) → ends service, marks customer "Done", clears the card
4. **Next customer preview** — token, name, services (read-only); shown if someone is waiting for this barber
5. **History strip** — last 3 completed tokens (collapsed by default)

### Button behaviour
- **Available / On Break toggle** → updates the barber's status immediately on all screens
- **Start** → timer starts; customer moves to "In chair"
- **Done** → customer moves to "Done"; next customer preview promotes if one is waiting

### Responsive (phone-primary)
| Breakpoint | Notes |
|------------|-------|
| Mobile | Full-width, large touch targets |
| Tablet | Centred card, same content |

### Empty / error states
- No current customer: "No customer in chair right now."
- No next customer: "No one waiting for you yet."

---

## 6. Waiting Area TV — `/display`

### Purpose
Passive display screen shown on a TV or monitor in the waiting area. Auto-refreshes; no user interaction needed.

### Layout (top to bottom)
1. **Header** — salon name, current time (large)
2. **Barber status row** — one tile per barber: barber name, current customer token (or "Free"), service in progress
3. **Divider**
4. **Next-up list** — 5 rows, each showing: position number, token number, estimated wait time
5. **Newly called highlight** — when a token is just called, its tile flashes gold for 10 seconds

### Responsive
| Breakpoint | Notes |
|------------|-------|
| TV / 1080p | Full screen, font size 2–4 rem |
| This screen is display-only; no mobile interaction expected |

### Empty / error states
- No customers waiting: "Queue is empty" message in the Next-up section
- No barbers on duty: "Salon is not currently open"

---

## 7. Owner Settings — `/admin`

### Purpose
Configuration panel for the salon owner to manage the master data and monitor today's stats.

### Layout (top to bottom)
1. **Services table** — columns: English name, Gujarati name, Duration (min), Price (₹), Enabled toggle; row actions: Edit, Delete; "Add Service" button above the table
2. **Barbers on duty** — toggle each barber as on duty or off duty; "Add barber" form (name only for now)
3. **Online queue & hours** — online queue open/closed master toggle; below it a **weekly hours table** with one row per day of the week (Monday–Sunday), each row having: Open checkbox, Opening time, Closing time. Online joining is disabled automatically 30 minutes before that day's closing time. If a day's Open checkbox is unchecked, the salon is closed that day.
4. **Today's stats bar** — Served count, Average wait (min), No-shows count (read-only, live)

### Button behaviour
- **Edit service** → inline edit row; Save / Cancel buttons appear
- **Delete service** → confirmation modal; only allowed if no active queue entries use that service
- **Add Service** → blank inline row appears at the bottom of the table
- **Online queue toggle** → immediate effect; `/join` Join button disables

### Responsive
| Breakpoint | Notes |
|------------|-------|
| Desktop / tablet | Table layout |
| Mobile | Stacked card view for each service |

### Empty / error states
- No services configured: "Add your first service to get started."
- No barbers added: "Add at least one barber before opening the queue."

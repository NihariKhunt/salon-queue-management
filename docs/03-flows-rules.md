# Flows, Queue Rules, and Test Checklist

---

## 1. Customer Flows

### 1a. Remote Customer Flow (online join)

```
Customer opens / (Home)
  │
  ├─ Queue is CLOSED → sees "Queue Closed" banner; cannot proceed
  │
  └─ Queue is OPEN
       │
       ▼
     /join — enters name, phone, selects up to 3 services, picks barber or "Any"
       │
       ├─ Phone number already has an active spot → redirect to existing /status/:id
       │
       └─ Valid new entry
            │
            ▼
          Token created (status: Waiting)
          Customer lands on /status/:id
            │
            ├─ Waits in queue → position and estimated wait update live
            │
            ├─ Becomes 2nd in line → "Get ready" banner appears
            │
            └─ Reception calls them
                 │
                 ▼
               Status: Called → "It's your turn!" banner + barber name shown
                 │
                 ├─ Customer arrives → Barber presses Start
                 │      │
                 │      ▼
                 │    Status: In chair → timer runs on /barber/:name
                 │      │
                 │      └─ Barber presses Done → Status: Done
                 │
                 └─ Customer does not arrive within 10 min
                        │
                        ▼
                      Reception marks No-show → Status: No-show
                        │
                        └─ Customer may rejoin at the END of the queue with a NEW token
```

### 1b. Walk-in Flow

```
Receptionist opens /reception
  │
  └─ Presses "Add Walk-in"
       │
       ▼
     Drawer opens — enters name, phone, services, barber preference
       │
       ├─ Phone number already has active spot → show existing token; do not create duplicate
       │
       └─ Valid entry → token created (status: Waiting); appears in waiting list immediately
            │
            └─ Follows the same Called → In chair → Done path as a remote customer
```

---

## 2. Status Model

### Allowed Statuses

| Status | Meaning |
|--------|---------|
| `Waiting` | Customer is in the queue, not yet called |
| `Called` | Reception has called this customer to a barber |
| `In chair` | Barber has pressed Start; service is running |
| `Done` | Barber has pressed Done; visit is complete |
| `Cancelled` | Customer or receptionist cancelled the spot |
| `No-show` | Customer was called but did not arrive in time |

### Allowed Transitions

```
Waiting ──► Called ──► In chair ──► Done
Waiting ──► Cancelled
Called  ──► No-show
```

**Statuses never move backwards.** A customer who was marked Done or No-show cannot return to Waiting; they must rejoin with a new token.

---

## 3. Queue Rules

### Order and Priority
1. **First come, first served** — customers are queued by the time their token was created.
2. **Barber preference is strict** — a customer who requested a specific barber must only be assigned to that barber. They will never be re-assigned to another barber, even if the wait is longer.
3. **"Any barber" is flexible** — when "Call next" is triggered for a barber, the system picks the earliest `Waiting` customer who selected that barber *or* who selected "Any barber".

### Calling Next
- "Call next" is triggered per barber from the reception dashboard.
- The system finds the earliest `Waiting` token that matches the barber or is set to "Any".
- If no eligible customer is found, reception sees "No customers waiting for [Barber]."

### One Customer Per Chair
- A barber may only have one customer in `In chair` or `Called` status at a time.
- The "Call next" button for a barber is disabled while that barber already has a called or active customer.

### Duplicate Phone Numbers
- Only one **active** queue entry per phone number. Active means status is `Waiting`, `Called`, or `In chair`.
- If the same number tries to join again, the system shows the existing token rather than creating a new one.
- After `Done`, `Cancelled`, or `No-show`, the phone number is free and may join again.

### No-show and Rejoin
- If a `Called` customer has not arrived after approximately 10 minutes, **reception may manually mark them as No-show**. The system does not change this status automatically — a human always makes this call.
- Their spot is released; the barber can call the next customer.
- If the no-show customer returns to the salon, they must rejoin at the **end of the queue** with a brand-new token.

### Online Joining Window
- Closing times are configured **per day of the week** in the owner settings (a weekly hours table with Open/Closed toggle, opening time, and closing time for each day).
- Online joining (`/join`) closes automatically **30 minutes before that day's configured closing time**.
- After that point, the Join Queue button is disabled and labelled "Online queue closed."
- Walk-ins via reception remain available until the salon physically closes.
- If the current day has no closing time set (or is marked closed in the weekly schedule), online joining is disabled for the whole day.

### Barber on Break
- If a customer's preferred barber goes on break after they joined the queue, the customer's position is preserved.
- The `/join` and `/status` screens display a clear notice: "[Barber name] is currently on break — your wait may be longer."
- The barber cannot have "Call next" triggered while they are on break.

### Estimated Wait Calculation

**General formula (shown to a customer as "About X minutes"):**

```
estimated_wait = (total service minutes of all Waiting + In-chair entries ahead of this customer)
                 ÷ (number of currently Available barbers who are eligible to serve this customer)
```

**What "eligible" means here:**
- If the customer selected **a specific barber**, divide only by 1 (that barber) — even if other barbers are free. Their queue is personal to that barber.
- If the customer selected **"Any barber"**, divide by the count of all currently Available barbers, because any of them could call this customer next.

**Explicit assumptions:**
1. Each barber works through customers sequentially — no parallel work.
2. "Available" means the barber's status is Available (not On break or Off duty).
3. The estimate uses the recorded service durations from owner settings; actual time may vary.
4. The figure is rounded up to the nearest whole minute.
5. It updates live whenever: a customer joins or leaves, a barber changes status, or a service starts or finishes.

---

## 4. Test Checklist

The following checks must pass before submission. Each check describes what to do and what the expected result is.

| # | Area | Test Action | Expected Result |
|---|------|-------------|----------------|
| 1 | Multiple services & totals | Join with 3 services selected; check the summary strip | Total price and total minutes show the correct sum of all 3 selected services |
| 2 | Duplicate phone number | Try to join a second time with the same phone number while already `Waiting` | System redirects to the existing `/status/:id` page; no duplicate token is created |
| 3 | Barber preference on "Call next" | Add two customers — one for Barber A, one for "Any"; press "Call next" for Barber A | The customer who selected Barber A (or "Any") is called first; a customer who selected Barber B is NOT called |
| 4 | Call notification within 5 seconds | From `/status/:id`, have reception press "Call next"; watch the status page | The "It's your turn!" banner appears within 5 seconds without the customer refreshing |
| 5 | Start/Done updates across screens | Barber presses Start on `/barber/:name`; check reception dashboard and `/display` | Customer status changes to "In chair" on all screens in real time |
| 6 | No-show and rejoin at end | Mark a `Called` customer as No-show; then add them again via reception | Customer gets a new token with a later position than any existing `Waiting` token |
| 7 | Closed online queue | Set "Online joining" to closed in owner settings; open `/join` from a new browser tab | Join Queue button is disabled; a "Queue closed" message is shown |
| 8 | Gujarati labels | Switch language to Gujarati on any screen | All service names and UI labels appear in Gujarati with no missing or broken text; strings not yet verified by a fluent speaker are marked `// TODO: verify translation` in `gu.js` and show placeholder text rather than blank or garbled output |
| 9 | Wait-time update | A customer finishes service (Barber presses Done); check wait times for remaining customers | Estimated wait for all `Waiting` customers decreases to reflect one fewer customer ahead |
| 10 | Sync between phone / tablet / TV | Have `/status/:id` open on a phone, `/reception` on a tablet, and `/display` on a TV; call a customer | Token highlights on `/display`, status changes on the customer's phone, and the reception list updates — all simultaneously |

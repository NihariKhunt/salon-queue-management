# Salon Queue Management System — Project Brief

## Problem

Customers at a walk-in salon often wait without knowing how long they'll be there or when their turn is coming up. At the same time, staff need a fair, organised way to handle multiple barbers and a mix of booked and walk-in customers. This project solves both problems with a real-time queue system that every stakeholder can use from their own device.

## Users

| Role | Device | Key need |
|------|--------|----------|
| Customer | Phone (browser) | Join remotely, track their own turn |
| Receptionist | Landscape tablet | Manage the desk — walk-ins, calls, no-shows |
| Barber | Phone | See their queue, control their status |
| Salon owner | Any | Configure services, prices, and working barbers |
| Waiting area | TV / large screen | At-a-glance display for everyone in the room |

## Must-Have Features

1. **Customer self-join** — from any phone browser, pick up to three services, choose a barber or "Any barber", and receive a token.
2. **Live status** — customers see their token number, position in line, estimated wait, and a clear alert when it's their turn.
3. **Reception controls** — add walk-ins, call the next suitable customer for a barber, cancel a spot, or mark a no-show.
4. **Barber view** — barbers see their current and next customer, run a service timer, and toggle available/on break.
5. **Waiting-area display** — a TV screen shows which customer is with each barber and the next five tokens.
6. **Owner settings** — manage services (name in English and Gujarati, price, duration, enabled/disabled), barbers on duty, and whether online joining is open.
7. **Bilingual UI** — all labels available in English and Gujarati.

## Out of Scope

The following will **not** be built for this assignment:

- Online payments or invoicing
- Future appointments or booking slots
- SMS or WhatsApp notifications
- Loyalty programmes or rewards
- Multi-branch support

## Tech Stack

React + Vite (frontend), Tailwind CSS for styling, real-time state shared via Socket.IO on a Node.js backend. Theme colours: charcoal `#1F2937` and gold `#D4A017`.

## Scope Summary

This is a single-salon, walk-in queue tool. It is scoped for a student assignment: straightforward state management, no external payment APIs, and no SMS integrations. Every screen listed in `docs/02-screens.md` is required; nothing more should be added without TA approval.

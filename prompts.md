# Prompts Log — Salon Queue Management System

This document logs all user prompts provided during the development of the Salon Queue Management System assignment.

---

## Prompt 1: Initial Planning & Requirements Setup
```text
I’m doing an MSc IT Vibe Coding Lab assignment: Salon Queue Management System.

Do not build the application yet. First inspect the existing project folder so you don’t overwrite existing work. Then create or update only these planning files:

- docs/01-brief.md
- docs/02-screens.md
- docs/03-flows-rules.md
- AGENTS.md in the project root

Write the documents in clear, simple language and in your own wording. Keep the brief to about one page. Base them on the requirements below.

PROJECT BRIEF
Problem: Salon customers may wait a long time without knowing their turn, while staff need a fair way to manage several barbers and walk-ins.
Users: customers, receptionist, barbers, and salon owner.
Must-have features:
1. Customers join from their phone, choose one or more services (up to 3), and select a barber or “Any barber”.
2. Customers see their token, queue position, estimated wait, and turn status.
3. Reception can add walk-ins, call the next suitable customer, cancel a spot, and mark a no-show.
4. Barbers see their current and next customers, start and finish services, and set themselves as available or on break.
5. A waiting-area display shows which customer is with each barber and the next five tokens.
6. The owner can manage services, prices, service durations, barbers on duty, and whether online joining is open.
7. The interface supports English and Gujarati.

Do not build: online payments, future appointments, SMS or WhatsApp messaging, loyalty features, or multiple salon branches.

SCREENS
Document these seven screens, including each screen’s purpose, URL, layout from top to bottom, button behavior, mobile/tablet/TV layout, and empty/error states:
1. Home (/): salon name, open/closed status, live queue summary, barber availability, Join Queue button.
2. Join Queue (/join): customer name and validated 10-digit phone, service cards with multi-select up to 3, barber choice, live time/price/wait summary, Confirm.
3. My Status (/status/:id): token, position, estimated wait, “Start coming” when second in line, “It’s your turn” when called, cancel with confirmation.
4. Reception Dashboard (/reception), designed for a landscape tablet: barber cards, ordered waiting list, add walk-in, Call next, No-show, Cancel; highlight waits over 60 minutes.
5. Barber View (/barber/:name), designed for a phone: current customer, service timer, Start and Done, next customer, Available/On break toggle.
6. Waiting Area TV (/display): each barber and current token, next five tokens and estimated times; newly called token is visually highlighted.
7. Owner Settings (/admin): services in English and Gujarati with duration, price, and enabled toggle; barbers on duty; online queue open/closed; today’s served, average wait, and no-show stats.

FLOWS AND QUEUE RULES
Document the remote customer flow and walk-in flow. Use these statuses and allowed transitions:
- Waiting -> Called -> In chair -> Done
- Waiting -> Cancelled
- Called -> No-show
Statuses never move backwards.
Rules:
- First come, first served.
- “Call next” for a barber chooses the earliest waiting customer who selected that barber or “Any”.
- A customer who selected a specific barber must never be assigned to a different barber.
- A barber can have only one customer in the chair at a time.
- Estimated wait is approximately the total service minutes ahead divided by the number of working barbers.
- Only one active queue spot per phone number. If that number tries to join again, show its existing spot.
- If a called customer has not arrived after 10 minutes, reception may mark No-show. If they return later, add them at the end with a new token.
- Online joining closes 30 minutes before salon closing; walk-ins remain allowed.
- If a selected barber is on break, explain this clearly.

Add a test checklist with at least 8 checks covering: multiple services and totals, duplicate phone numbers, barber preferences when calling next, call notification within 5 seconds, Start/Done updates across screens, no-show and rejoining at the end, closed online queue, Gujarati labels, wait-time updates, and sync between phone/tablet/TV.

AGENTS.md
Include a one-line project summary, stack and run command, links to the three docs above, and short working rules. Use React + Vite + Tailwind unless the existing project already uses another stack; inspect before deciding. Specify the charcoal (#1F2937) and gold (#D4A017) theme, mobile-first customer screens, English/Gujarati labels, one source of truth for queue rules, and one screen or feature per coding task. Tell the agent to read the docs before coding and not to add anything in the “Do not build” list. Do not include the entire requirements text in AGENTS.md.

If the existing project or assignment files conflict with these instructions, report the conflict and ask me before changing existing work. Otherwise create the four planning files only. Do not install packages, create application screens, or deploy anything yet.

When finished, summarize the files created and list any decisions I should review before showing the docs to my TA.
```

---

## Prompt 2: Planning Clarifications & Refinements
```text
Update the four planning files based on the decisions below. Do not build or change application code yet.

- Keep React + Vite + Tailwind and Socket.IO with a Node backend for live synchronization.
- Store Gujarati labels in gu.js. Mark translations for review by a fluent Gujarati speaker; do not invent uncertain translations.
- Estimate an “Any barber” customer’s wait using the available barbers who can serve them. Keep the formula and its assumptions explicit in docs/03-flows-rules.md.
- No-show is a manual receptionist action after 10 minutes; do not automatically change a customer’s status.
- Make salon closing time configurable for each day of the week. Online joining closes 30 minutes before that day’s closing time.
- Keep the existing features, screen descriptions, and test checklist intact.

Update AGENTS.md and the relevant docs so they agree with these decisions. Then summarize exactly what changed and list any questions that still need my TA’s answer.
```

---

## Prompt 3 & 4: GitHub Repository Configuration
```text
connect to github
My GitHub username is NihariKhunt. The repository is https://github.com/NihariKhunt/salon-queue-management
```

---

## Prompt 5: Scaffolding & Setup Instruction
```text
Read AGENTS.md and all three files in docs/ before coding. Follow them as the requirements for my salon queue assignment.

First summarize the requirements and show me a short build plan. Then complete only the project setup step: set up the app using the stack in AGENTS.md, create pages for all seven screens, apply the charcoal and gold theme, and add the English/Gujarati language toggle.

Do not build the screen features yet. Keep my planning documents unchanged. When setup is complete, tell me how to run the app, what files you changed, and how I can check it.
```

---

## Prompt 6: Continuation Prompt
```text
continue
```

---

## Prompt 7: Complete End-to-End Build and Verification
```text
Finish my Salon Queue Management System project completely. Work in the existing project folder and preserve my current files, planning documents, Git history, and GitHub repository. Do not start over or ask me to repeat the assignment requirements.

Read AGENTS.md and all files in docs/ first. Follow them as the requirements. Complete the whole app in this task rather than stopping after scaffolding or asking me to approve each development step.

BUILD THE WEBSITE
- Use the stack in AGENTS.md and the existing project setup.
- Implement all seven documented screens and make the main customer, reception, barber, and owner flows work end to end.
- Follow the screen descriptions, charcoal and gold theme, mobile/tablet/TV layouts, English/Gujarati toggle, and queue rules in docs/.
- Make every button do what its screen description says. Include helpful empty and error states.
- Keep Gujarati labels in the language files and translate all visible interface labels. Don’t leave obvious untranslated English labels in Gujarati mode.
- Use initials avatars if there are no barber photos.
- If no eligible barber is available, show “Wait time unavailable — please ask reception.” Never divide by zero.
- Mark a customer No-show only when reception chooses that action after 10 minutes; don’t automatically remove them.
- Make salon hours configurable by day, with online joining closing 30 minutes before that day’s closing time.
- Prevent duplicate active queue spots for the same phone number. A returning customer marked No-show must get a new token at the end of the queue if added again.
- Ensure changes sync between customer, reception, barber, and TV screens within five seconds.
- Use persistent storage that works locally and in the deployed setup. Don’t rely on in-memory-only or temporary local-file storage for the live app.
- Include realistic sample services and barbers, and a clearly documented demo PIN for staff screens.

MAKE IT EASY TO RUN
- Check whether Node.js is installed. If it is missing, tell me exactly how to install it from the official Node.js website; don’t leave me with a localhost link that cannot open.
- Add or correct root scripts so I can start the frontend and backend together with `npm run dev`.
- Install project dependencies if possible, start the app, and keep the local server running.
- Open the working app in the browser if you can. Confirm the actual local URL, such as http://localhost:5173, and make sure it opens. If it fails, diagnose and fix the cause before you stop.
- If you can’t start it in this environment, give me the exact Windows commands to install dependencies and start both parts, and clearly say that localhost works only while those processes are running.

CHECK THE RESULT
- Build the production app and fix errors you find.
- Go through the test checklist in docs/03-flows-rules.md and report pass/fail for every item. Fix failures.
- Check the seven routes, language toggle, phone layout, and that the customer-to-reception-to-barber-to-TV flow works.
- Don’t claim something passed unless you actually checked it.

GITHUB AND LIVE WEBSITE
- Keep using my existing GitHub repository: https://github.com/NihariKhunt/salon-queue-management
- Check the Git status and ignore file before staging anything. Never commit secrets, tokens, local environment files, or dependencies.
- Commit the completed app and push it to that repository if GitHub authentication is already available. If sign-in is required, open the official sign-in flow and tell me what to do; never ask me to paste a password or access token into chat.
- Prepare and deploy the frontend to Vercel and any required backend to a compatible host. Use the simplest reliable setup that supports the app’s live sync and persistent data.
- If my GitHub or hosting account needs me to sign in or configure a service, stop only at that step and give me simple exact instructions. Don’t invent a live URL or say deployment succeeded unless you verified it opens.
- Put the real working live URL at the top of README.md, with the demo staff PIN below it. Also record every prompt used in prompts.md, including this prompt.

At the end, tell me:
1. The local URL and whether you verified it opens.
2. The real GitHub repository URL and whether the latest code was pushed.
3. The real Vercel/live URL and whether you verified it opens.
4. Any sign-in or setup action I still need to do.
5. The test checklist results and the files changed.
```

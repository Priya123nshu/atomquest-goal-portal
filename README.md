# AtomQuest Goal Setting & Tracking Portal

A self-contained browser demo for the AtomQuest Hackathon 1.0 problem statement.

## Run

Open `index.html` in a browser, or serve the folder:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

This project also includes a small Node static server:

```powershell
node serve-atomquest.cjs
```

## Demo personas

- Employee: Aarav Mehta
- Employee: Nisha Rao
- Manager (L1): Kavya Menon
- Admin / HR: Rohan Sethi

Use the role selector in the header to switch personas.

## Implemented scope

- Employee goal sheet creation with thrust area, title, description, UoM, target, deadline, and weightage.
- Validation for total weightage equal to 100%, minimum 10% per goal, and maximum 8 goals.
- Manager approval workflow with inline target and weightage editing, return for rework, and approval lock.
- Admin unlock flow with audit logging.
- Shared KPI push from manager/admin to multiple employees, with read-only shared title and target for recipients.
- Quarterly actual achievement capture with statuses and computed tracking scores.
- Manager check-in comments per employee and quarter.
- Achievement report, completion dashboard, audit trail, and CSV export.
- Cycle configuration with active-window enforcement for Phase 1 and quarterly check-ins.
- Admin hierarchy management, exception unlocks, and an escalation monitor view.

## Notes for review

- Microsoft Entra ID, Teams, and email integrations are represented as architecture-ready extension points, not live integrations.
- Persistence is local browser storage for a low-cost hackathon demo. A production version should move state to an API and database.

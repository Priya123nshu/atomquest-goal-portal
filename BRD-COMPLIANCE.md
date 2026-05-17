# BRD Compliance Checklist

## Must-have scope

- Employee goal creation: implemented with thrust area, title, description, UoM, target, deadline, and weightage.
- Validation rules: total weightage must equal 100%, each goal must be at least 10%, and each employee can have at most 8 goals.
- Manager approval workflow: submitted sheets can be reviewed, edited inline, approved and locked, or returned for rework.
- Admin exception handling: Admin can unlock approved goal sheets; changes after unlock are recorded in the audit trail.
- Shared goals: Manager/Admin can push a departmental KPI to multiple employees. Shared title, target, UoM, and description are read-only for recipients; weightage remains adjustable before submission.
- Achievement tracking: approved employees can enter quarterly actual achievement and status.
- Progress scoring: supports Min, Max, Timeline, and Zero-based UoM calculations.
- Check-in schedule: Admin sets the active window. Goal actions are restricted to Phase 1, and achievement/check-in actions are restricted to the active quarter.
- Manager check-ins: manager can review planned vs actual and save structured comments.
- Roles: Employee, Manager (L1), and Admin / HR journeys are available from the role selector.
- Reporting: achievement report, completion dashboard, audit trail, and CSV export are implemented.
- Governance: audit log captures submissions, approvals, returns, unlocks, post-lock edits, hierarchy changes, check-ins, and exports.

## Bonus / extension-ready scope

- Entra ID, email, Teams, and analytics are documented as production extension points in `architecture.md`.
- Escalation conditions are represented in the Admin escalation monitor.

## Demo note

For the complete journey, use Admin controls to switch the active window:

- Use `Phase 1 - Goal setting` to create, submit, approve, return, or unlock goals.
- Use `Q1`, `Q2`, `Q3`, or `Q4 / Annual` to enter achievements and save manager check-ins for that period.

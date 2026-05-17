# Architecture Diagram

```mermaid
flowchart LR
  Browser["Browser SPA\nHTML, CSS, JavaScript"] --> Store["LocalStorage demo store"]
  Browser --> CSV["CSV export"]
  Browser --> Roles["Role switcher\nEmployee, Manager, Admin"]

  Roles --> Goals["Goal lifecycle\nDraft, submit, approve, lock, unlock"]
  Roles --> Checkins["Quarterly check-ins\nActuals, statuses, comments"]
  Roles --> Reports["Reports\nAchievement, completion, audit"]

  Goals --> Audit["Audit trail"]
  Checkins --> Audit
  Reports --> Audit

  FutureApi["Future API layer"] -.-> Database["Relational database"]
  FutureApi -.-> Entra["Microsoft Entra ID"]
  FutureApi -.-> Notify["Email and Teams notifications"]
  FutureApi -.-> Analytics["Analytics warehouse"]
```

## Production path

- Replace `localStorage` with an authenticated API and relational database.
- Use Microsoft Entra ID for SSO, hierarchy sync, and role mapping.
- Add background jobs for reminder and escalation rules.
- Send notifications through email and Microsoft Teams adaptive cards.
- Move audit logging to an append-only table.

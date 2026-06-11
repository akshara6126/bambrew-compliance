# Bambrew Compliance Management Dashboard

Internal department-wise compliance tracker for Bambrew.

**Live URL:** _to be filled in after first Vercel deploy_

---

## What it does

- 10 department tiles on the landing page (Founder's Office, Legal, HR, Finance, Marketing, Operations, Supply Chain, Design, R&D, Sales)
- Each department has a password — only that team unlocks their view
- A separate **Management View** password unlocks a company-wide combined view
- Each compliance row has a 🔴 / 🟡 / 🟢 RAG status (Not Started / In Progress / Completed)
- Statutory (legal) compliances sort to the top of each list — Internal ones below
- Completed items sink to the bottom of their section with a strike-through line
- Tile progress bars fill green as more items are completed

## Passwords (prototype — change before sharing widely)

| Access | Password |
|---|---|
| Management View | `admin` |
| Founder's Office | `founders` |
| Legal | `legal` |
| HR | `hr` |
| Finance | `finance` |
| Marketing | `marketing` |
| Operations | `operations` |
| Supply Chain | `supply` |
| Design | `design` |
| R&D | `rnd` |
| Sales | `sales` |

To change a password, edit the `DEPARTMENTS` array (or `MANAGEMENT_PASSWORD` const) in `index.html`.

## Adding / editing compliance items

Open `index.html` in any text editor (or the GitHub web editor). Find `const COMPLIANCES = [` and add or modify entries using this template:

```js
{ dept: 'finance', type: 'statutory', sNo: 4,
  description: 'What the compliance is',
  statutoryRef: 'Act / Rule reference',
  frequency: 'Monthly',         // or 'Quarterly' / 'Annual' / 'Event-based'
  dueDateFor: 'What period',
  dueDates: 'When it is due',
  processOwner: 'Team / role',
  currentPOC: 'Person / role',
  function: 'Category' },
```

Commit → Vercel auto-redeploys within ~30 seconds.

## Notes on state

Currently RAG status is stored in the **browser localStorage** — per-device. To share state across team members so everyone sees the same RAG, add Vercel KV (same pattern as the Bambrew grants tracker).

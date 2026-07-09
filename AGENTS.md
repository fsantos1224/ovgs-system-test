# AGENTS.md — OVGS System Test

## Issue tracker

This project uses the **local-markdown** tracker.
- Map: `docs/MAP.md`
- Tickets: `docs/tickets/`
- A ticket is a markdown file in that directory.

### Wayfinding operations

- **Create a ticket**: `docs/tickets/<ticket-number>-<ticket-slug>.md`
- **Create the map**: `docs/MAP.md`
- **Close a ticket**: Move the file to `docs/tickets/closed/` (creates directory if needed) and append to the map's "Decisions so far" section.
- **Blocking**: A ticket's frontmatter or body declares `Blocked by: <ticket-slug>`. An unblocked ticket has no `Blocked by` link, or all linked tickets are closed.
- **Frontier**: Find open tickets without a `Blocked by` link, or where all blocked-by tickets are closed.
- **Decision record**: Each ticket is resolved by a comment-style section appended to the ticket file before closing (moving to `closed/`).

## Agent skills

Skills to consult during wayfinding sessions:
- `frontend-design`, `react-patterns`, `a11y-runtime-tester`, `performance-profiling`, `testing-patterns`

## Domain docs

- `docs/MAP.md` — the Wayfinder map, loaded once per session
- `docs/tickets/` — individual tickets, fetched on demand
- `docs/tickets/closed/` — resolved tickets

## Triage labels

Not applicable — no GitHub issues. Tickets are local markdown files.
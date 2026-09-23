# P+ Media Analytics — Web app

Single-page app for the P+ media-measurement platform. Staff (admins, supervisors, analysts) capture and
review media coverage; clients see reports on their brand and competitors.

**Stack:** React 18, TypeScript (strict), Vite, Tailwind CSS + shadcn/ui, TanStack Query, React Router,
React Hook Form + Zod, Recharts, Sonner.

## Getting started

```bash
npm install
npm run dev              # http://localhost:8080
```

The app has no environment variables. The API address is set in `src/lib/env.ts`
(`https://pplus-backend.onrender.com/api/v1`); change it there to point at another backend.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Type-check and production build (`dist/`) |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint (zero warnings allowed) |
| `npm run preview` | Serve the production build locally |

The API base URL comes only from `VITE_API_BASE_URL`; nothing is hard-coded. The backend must list the
app's origin in its CORS settings (`ALLOWED_ORIGINS`).

## Roles

| Role | Sees |
| --- | --- |
| Admin | Users, companies, publications, sentiment indicators, parameters, audit log, all content, content review |
| Supervisor | Review queue for their analysts' submissions; team content lists |
| Analyst | Their own submissions across the six content types; create and rework |
| Client | Reports for their monitored companies (company switcher in the header) |

Content types (editorials, daily mentions, SWOT analyses, social media, outcome & insights, industry
landscape) follow the backend workflow: submissions start as *pending*, a supervisor approves or rejects
them, and analyst edits resubmit them for review.

## Client reports

Each client report has its own colour theme (`src/lib/reportThemes.ts`): a gradient header, KPI tiles
in the report's palette and charts led by its accent. Sentiment colours (green / grey / red) are the
same everywhere. The chosen month or date range is shared by all report pages for the browser session.

**Download report** (in every report header) builds the full pack for the selected monitoring pair and
period — every report, one section each — as an editable PowerPoint deck (native charts and tables) or
an A4 PDF. The export code (`src/features/report-export/`) is loaded only when a download is requested.

## Project structure

```
src/
  api/             One module per backend resource (typed requests)
  features/        report-export/: report pack builder + PowerPoint and PDF renderers
  components/
    common/        Shared building blocks: PageHeader, DataTable, filters, form fields, dialogs, states
    layout/        App shell: sidebar (generated from the route map) and header
    ui/            shadcn/ui primitives
    auth/          Auth provider (session, monitoring pairs)
  hooks/           Lookup queries and the mutation-with-toast helper
  lib/             API client, env, formatting, roles, chart palette, report themes
  pages/           auth/, admin/, content/, review/, dashboard/, client/
  routes/          Route map (drives routing + navigation) and guards
  types/           API and report response types
```

Conventions: data fetching through `src/api` + React Query; every list uses `DataTable`, every form uses
`FormDialog`/`FormFields` with Zod validation, destructive actions use `ConfirmDialog`, and statuses use
`StatusBadge`, so screens look and behave the same everywhere.

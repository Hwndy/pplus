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

Everyone has a **Profile** page (account menu, top right): change username, change password (other
devices are signed out) and permanently delete the account (password plus typing `DELETE`).

## Client reports

Each client report has its own colour theme (`src/lib/reportThemes.ts`): a gradient header, KPI tiles
in the report's palette and charts led by its accent. Sentiment colours (green / grey / red) are the
same everywhere. The chosen month or date range is shared by all report pages for the browser session.

**Download report** (in every report header) produces the P+ *Media Performance Audit Report* for the
selected monitoring pair and period, laid out like the manual deck: cover with the client's logo and cover
image, the black "Independent PR Measurement & Performance Audit" bar, a clickable section menu on every
slide, and one or more slides per section (long sections continue on extra slides). It downloads as an
editable PowerPoint (native doughnut and trend charts) or a PDF with the same layout, or is e-mailed from
**Email report…** to the client's own address and up to two others. Logos, CEO and spokesperson photos
come from the admin screens (Companies, Spokespersons); files are stored by the backend (Cloudinary, or
the database when Cloudinary is not configured). The export code (`src/features/report-export/`) is
loaded only when a download is requested.

A banner (amber, red in the last 7 days) and a dot on the company switcher warn clients when a
subscription is about to end; after the end date reports are no longer available.

## Project structure

```
src/
  api/             One module per backend resource (typed requests)
  features/        report-export/: audit report deck (data → slides) + PowerPoint and PDF renderers, e-mail dialog
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

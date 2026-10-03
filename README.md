# PathPilot — AI Career Roadmap for Students

PathPilot turns a student's skills, education, and career interests into a practical learning roadmap. It helps students see recommended learning areas and track their progress without making promises about employment.

### Why I Built PathPilot

This project was created to help students understand the gap between their current skills and their target careers by turning career preparation into a structured and trackable roadmap.

## Problem statement

Career advice is often broad and disconnected from a student's starting point. PathPilot brings profile information, skill comparisons, projects, and learning tasks into one workspace.

## Key features

- Polished responsive dashboard, landing page, collapsible desktop sidebar, mobile menu, and stored light/dark preference.
- Five-step profile editor with proficiency, certification, and project fields.
- Twelve career paths, career details, and personalized template roadmaps.
- Editable milestone statuses, derived progress, skill coverage, and Recharts analysis.
- Project ideas, configurable weekly plans, and completed study sessions.
- Profile-aware advisor and validated AI roadmap generation with template fallback.
- Portfolio summary, editable AI-assisted professional drafts with profile-based fallback, copy actions, and subtle achievements.
- Guest persistence in local storage; Supabase email/password accounts and account-specific cloud persistence.

## Tech stack

Next.js App Router, TypeScript, React, Tailwind CSS, a shadcn-style Radix/CVA button primitive, Lucide, Recharts, Supabase Authentication/PostgreSQL, Zod, and an optional OpenAI API integration.

## Architecture

`app/page.tsx` implements the workspace and navigation using shareable `?page=` URLs. `components/ui` contains reusable UI primitives. `data/careers.ts` defines career and skill catalogs. `lib/roadmap.ts` owns deterministic roadmap generation and progress calculations. `hooks/use-student.ts` owns guest persistence and authenticated state syncing. `app/api/ai/route.ts` validates inputs and provider outputs, verifies authenticated requests before using the paid provider, and falls back gracefully.

The default `/` opens the landing page. The guest action opens the complete fictional demo dashboard; `/?page=Dashboard` opens it directly. All student data is fictional.

## Database structure

Run `supabase/migrations/001_initial.sql` in your Supabase SQL editor. It creates profiles, career paths, skills, user skills, certifications, projects, roadmaps, stages, items, recommendations, plans, achievements, conversations, and aggregate student state, with foreign keys and ownership-based Row Level Security. Auth identities use Supabase's `auth.users` table.

The current app persists the aggregate `student_states` record. The normalized tables are provided as a migration foundation and are not yet populated by the UI. Career and skill catalogs currently come from typed source data. Advisor conversations are session-only.

## Local setup

Requires Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. No credentials are needed for guest mode.

### Environment variables

| Variable                        | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client key; RLS controls access            |
| `OPENAI_API_KEY`                | Private server-side provider key                  |
| `OPENAI_MODEL`                  | Optional provider model; defaults to gpt-4.1-mini |

Enable email/password authentication, configure the Site URL and redirect allowlist in Supabase, and apply the migration before testing accounts. Signup may require email confirmation. Guest data remains separate from account data. AI provider calls require a signed-in Supabase user; guests receive deterministic recommendations. Without a provider key, the same fallback is used. Portfolio writing uses the same authenticated provider integration with editable profile-based fallback.

## Validation

```bash
npm run typecheck
npm run build
node scripts/smoke-test.mjs
```

Run the smoke test with the development server running. It checks validation, career-specific fallback roadmaps, skill proficiency mapping, advisor context, and professional writing fallback.

## Screenshots

Capture the dashboard, roadmap, skill analysis, and mobile navigation from the running app for your portfolio. Screenshots have not yet been committed.

## Deployment

Import this repository into Vercel, choose the Next.js framework preset, configure the environment variables above, and deploy. Apply the Supabase migration separately and update the authentication Site URL to the deployed domain. Keep provider keys server-side. No deployment or external services are provisioned automatically.

## Future improvements and current limits

- Replace aggregate cloud saves with normalized transactional entity updates and add conflict handling for simultaneous sessions.
- Add persistent advisor threads and real learning-resource links.
- Add OAuth, password recovery, and richer onboarding validation.
- Add durable distributed rate limiting before large-scale deployment; the current per-user API limit is process-local.
- Expand weekly activity reporting into long-term history.
- Add integration tests against an isolated Supabase project and browser accessibility checks.

Career skills and certification suggestions are illustrative learning recommendations. Verify current certification details with the issuer before enrolling.

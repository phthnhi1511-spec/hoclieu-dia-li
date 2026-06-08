# AGENTS.md

## Project Context

This project is a website for digital learning materials that supports Grade 9 Vietnamese Economic Geography learning.

Current stack:

* Frontend: React + Vite
* Backend service: Supabase
* Database: Supabase PostgreSQL
* Auth: Supabase Auth
* Storage: Supabase Storage
* UI: Keep the original website theme and layout style

Main modules may include:

* Digital learning materials
* Search and filtering
* Online quizzes
* Interactive maps / Atlat
* AI learning support
* News and practical resources
* Contact / feedback
* Admin management

\---

## Core Rules

* Always write clean, readable, and maintainable code.
* Do not over-engineer. Keep the code simple and suitable for a beginner-friendly project.
* Follow the current project structure. Do not create unnecessary folders, layers, or abstractions.
* Reuse existing components, utilities, styles, and patterns before creating new ones.
* Do not rename files, routes, components, CSS classes, database fields, or environment variables unless it is required.
* Do not delete existing code or features unless explicitly requested.
* Make small, focused changes that match the user's request.
* Before writing code, always check whether the latest version exists on the `main` branch.
* The default working branch for code changes is `dev`. Do not code directly on `main` unless explicitly requested.
* If the project is connected to a remote repository, run `git fetch origin` and compare with `origin/main` before starting code changes.
* If `main` has newer commits, update the local working branch from `main` first or ask the user before continuing when there is a conflict.

\---

## UI / Theme Rules

* Do not change the original website theme without permission.
* Do not randomly change the color palette, typography, spacing system, layout style, or page identity.
* Keep the current UI format consistent across all pages.
* Use the existing CSS / Bootstrap style conventions already used in the project.
* New pages or components must visually match the existing website.
* Avoid adding dark theme, new design systems, or unrelated UI libraries unless explicitly requested.
* Prioritize a clean, educational, easy-to-use interface for students and teachers.

\---

## Supabase Rules

* The project uses Supabase as the backend service.
* Use `@supabase/supabase-js` to connect from the frontend.
* Do not expose private keys.
* Never put the Supabase `service\_role` key in frontend code.
* Never hard-code Supabase keys directly inside `.js`, `.jsx`, `.ts`, or `.tsx` files.
* Only use public frontend environment variables such as:

```env
VITE\_SUPABASE\_URL=
VITE\_SUPABASE\_ANON\_KEY=
```

* Read Supabase config from environment variables only.
* Do not commit `.env`, `.env.local`, or any file containing real secrets.
* If an API key or secret appears in code, stop and warn the user before continuing.
* Use Row Level Security policies when data should not be publicly editable.
* Public read access is acceptable only for public learning materials, public news, and published resources.
* Insert, update, and delete actions should be protected for admin/teacher roles when needed.

\---

## Build / Check Rules

After finishing code changes, always check the project before reporting completion.

Required checks:

```bash
npm install
npm run build
```

If the project has linting configured, also run:

```bash
npm run lint
```

If the project has tests configured, also run:

```bash
npm test
```

When reporting back, include:

* What files were changed
* What was added/fixed
* Whether `npm run build` passed or failed
* Any errors that still need manual attention

Do not say the task is finished if the build fails.

\---

## React Code Style

* Use functional components.
* Use hooks correctly.
* Keep components small and readable.
* Avoid putting too much logic directly inside JSX.
* Use meaningful names for components, variables, and functions.
* Use `async/await` for Supabase calls.
* Always handle `loading`, `error`, and empty data states.
* Do not ignore returned Supabase errors.
* Avoid duplicated code. Extract helper functions/components only when it improves readability.
* Keep beginner-friendly code. Prefer clarity over clever code.

Example Supabase query style:

```js
const { data, error } = await supabase
  .from("materials")
  .select("\*");

if (error) {
  console.error("Error loading materials:", error.message);
  return;
}
```

\---

## File Upload / Storage Rules

* Do not store PDF, PPT, image, or video binary data directly in the database.
* Store files in Supabase Storage.
* Store only file URLs, paths, titles, descriptions, types, and metadata in PostgreSQL.
* Validate file type before upload when possible.
* Keep upload logic simple and easy to understand.

\---

## Database Rules

* Use clear table and column names.
* Keep table names consistent with the current project.
* Do not change existing database schema without explaining why.
* Do not remove columns or change column types unless explicitly requested.
* For learning materials, keep fields such as title, description, type, category, file URL, thumbnail URL, and publish status consistent.
* For quizzes, keep questions, answers, correct answers, and results clearly separated.

\---

## Admin Rules

* Admin pages should be protected.
* Do not allow normal students to access create, update, or delete actions.
* Keep management screens simple:

  * list data
  * add data
  * edit data
  * delete data
  * confirm before deleting

\---

## Response Rules

When answering the user:

* Use Vietnamese unless the user asks otherwise.
* Be direct and practical.
* Explain steps clearly for a beginner.
* Provide exact commands when needed.
* Avoid unnecessary theory.

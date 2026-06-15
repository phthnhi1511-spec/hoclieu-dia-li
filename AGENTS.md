# AGENTS.md

## Project Context

This project is a website for digital learning materials that supports Grade 9 Vietnamese Economic Geography learning.

Current stack:

* Frontend: React + Vite
* Backend service: Supabase
* Database: Supabase PostgreSQL
* Auth: Supabase Auth
* File storage: Cloudflare R2
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

## Current Database Snapshot

The current project is no longer using a minimal generic schema. When working on code, assume these tables and responsibilities already exist:

* `chu_de`

  * Topic master data such as `ten_chu_de`, `duong_dan`, display order, and publish/display flags.

* `loai_hoc_lieu`

  * Material type master data used by the public materials pages and admin CRUD.

* `hoc_lieu`

  * Stores metadata only, not binary file data.
  * Common fields may include: title, description, topic id, material type id, file path / object key, preview image path, multiple image paths, external worksheet link, source name, grade, featured flag, and publish flag.
  * Some material types can use multiple image paths stored as newline-separated values.

* `de_thi`

  * Separate from `hoc_lieu` and used specifically by the library-page exam section and admin CRUD.
  * Important fields currently used by the app: `tieu_de`, `mo_ta`, `chu_de_id`, `duong_dan_file`, `duong_dan_anh_dai_dien`, `ten_nguon`, `da_xuat_ban`.
  * Supports image, PDF, or Word exam files uploaded to Cloudflare R2.

* `bai_kiem_tra`

  * Quiz/test master table.
  * Important fields currently used by the app: `tieu_de`, `mo_ta`, `chu_de_id`, `thoi_gian_lam_bai_phut`, `da_xuat_ban`.

* `cau_hoi_kiem_tra`

  * Child table of `bai_kiem_tra`.
  * Important fields currently used by the app: `bai_kiem_tra_id`, `noi_dung_cau_hoi`, `duong_dan_anh_cau_hoi`, `giai_thich_dap_an`, `diem`, `thu_tu_hien_thi`.

* `dap_an_kiem_tra`

  * Child table of `cau_hoi_kiem_tra`.
  * Important fields currently used by the app: `cau_hoi_id`, `noi_dung_dap_an`, `la_dap_an_dung`, `thu_tu_hien_thi`.
  * The current quiz UI is built for one-choice multiple choice questions with answer options displayed in a simple list.

* `ket_qua_kiem_tra`

  * Stores quiz result summary per learner attempt.
  * Important fields currently used by the app include learner info, quiz id, total question count, correct count, score, and time spent.

* `chi_tiet_ket_qua_kiem_tra`

  * Stores per-question answer detail for a quiz attempt.
  * Important fields currently used by the app include `ket_qua_id`, `cau_hoi_id`, `dap_an_da_chon_id`, and `la_dap_an_dung`.

* `khao_sat`

  * Used by the admin survey CRUD and the public survey list page.
  * Important fields currently used by the app: `tieu_de`, `mo_ta`, `doi_tuong_khao_sat`, `duong_dan_khao_sat`, `dang_mo`.
  * `duong_dan_khao_sat` stores the external survey URL, usually a Google Form link.

* `vung_kinh_te`

  * Used by the map page and admin CRUD.
  * The current map implementation expects these newer columns: `ten_vung`, `duong_dan`, `danh_sach_tinh`, `mo_ta`, `dien_tich_km2`, `dan_so`, `mat_do_dan_so`, `the_manh_tu_nhien`, `the_manh_nhan_luc`, `thanh_pho_tieu_bieu`, `thu_tu_hien_thi`, `da_xuat_ban`.
  * `danh_sach_tinh` is currently stored as newline-separated province names and is used to map provinces on the 34-province Vietnam map to each economic region.

Notes for future work:

* The current quiz schema fits standard multiple-choice questions best.
* True/false grouped questions, short answer, or numeric calculation questions should not be forced into `dap_an_kiem_tra` without first deciding a proper schema extension.
* The project already contains SQL seed files under `supabase/seeds/` for quiz data and economic-region map data. Reuse those patterns instead of inventing a new import format.

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
* The current project stores uploaded files in Cloudflare R2, not Supabase Storage.
* Store only object keys / file paths / preview image paths / external links and metadata in PostgreSQL.
* Keep the upload flow compatible with the existing Cloudflare R2 setup already used by the admin pages and helper functions.
* Validate file type before upload when possible.
* Keep upload logic simple and easy to understand.

\---

## Database Rules

* Use clear table and column names.
* Keep table names consistent with the current project.
* Do not change existing database schema without explaining why.
* Do not remove columns or change column types unless explicitly requested.
* For learning materials, keep fields such as title, description, type, topic, file path, preview image path, external worksheet link, and publish status consistent with the existing app.
* For quizzes, keep `bai_kiem_tra`, `cau_hoi_kiem_tra`, `dap_an_kiem_tra`, `ket_qua_kiem_tra`, and `chi_tiet_ket_qua_kiem_tra` clearly separated.
* For the economic-region map, preserve the `vung_kinh_te` shape currently expected by the frontend, especially `danh_sach_tinh`, `the_manh_tu_nhien`, and `the_manh_nhan_luc`.
* If a DB change depends on new SQL seed or migration files, update `AGENTS.md` when that change becomes part of the project baseline.

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

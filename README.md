# React + Vite

## Deploy GitHub Pages

Website duoc build va deploy tu dong khi push len nhanh `dev` bang workflow
`.github/workflows/deploy-pages.yml`. Ban build production su dung base path
`/hoclieu-dia-li/` va co `404.html` de cac route React van mo duoc khi tai lai trang.

Trong GitHub, chon `Settings > Pages > Source: GitHub Actions` va khai bao cac
Repository Secrets sau:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_PASSWORD`
- `SUPABASE_ACCESS_TOKEN` (bat buoc de deploy Edge Functions, khong co tien to `VITE_`)
- `CLOUDFLARE_R2_ACCESS_KEY` (bat buoc, chi dung trong job deploy function)
- `CLOUDFLARE_R2_SECRET_KEY` (bat buoc, chi dung trong job deploy function)

Luu y: bien Vite duoc dua vao JavaScript phia trinh duyet. Khong dat
`service_role` key, R2 secret key hoac bat ky khoa bi mat backend nao vao cac
bien `VITE_*`.

`SUPABASE_ACCESS_TOKEN` duoc tao trong Supabase Dashboard, muc Account > Access
Tokens. GitHub Actions dung token nay theo cach khong tuong tac, khong can chay
`supabase login`. Workflow dong bo R2 access key va secret key vao Supabase Edge
Function Secrets truoc khi deploy; hai gia tri nay khong duoc dua vao GitHub
Pages build hoac cac bien `VITE_*`.

Production doc file truc tiep tu public R2 URL
`https://pub-55a901fcb1b5479abeead7b3dbd3ae26.r2.dev` de tranh do tre cua Edge
Function proxy. Co the dung `VITE_R2_PUBLIC_BASE_URL` de ghi de khi chuyen sang
custom domain sau nay, nhung GitHub Pages hien tai khong can bien nay.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

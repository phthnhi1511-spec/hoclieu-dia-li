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
- `VITE_SUPABASE_FUNCTIONS_URL` (khong bat buoc)
- `VITE_R2_PUBLIC_BASE_URL` (khong bat buoc)

Luu y: bien Vite duoc dua vao JavaScript phia trinh duyet. Khong dat
`service_role` key, R2 secret key hoac bat ky khoa bi mat backend nao vao cac
bien `VITE_*`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

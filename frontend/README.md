## Frontend — Connect to Backend (Quick Guide)

This project uses a Vite + React frontend that communicates with a FastAPI backend.

Quick steps to connect and run locally:

- Ensure the backend is running (default: `http://localhost:8000`).
- Set frontend environment variable `VITE_API_BASE_URL` to the backend base URL (example `.env` in `frontend/`):

```env
VITE_API_BASE_URL=http://localhost:8000
```

- Confirm the frontend `api` client reads `import.meta.env.VITE_API_BASE_URL` (see `frontend/src/config/api.ts`).
- Start backend (PowerShell from `d:\test\backend`):

```powershell
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

- Start frontend (PowerShell from `d:\test\frontend`):

```powershell
npm install
npm run dev
```

If you prefer, you can also set the base URL directly in `frontend/src/config/api.ts`.

Troubleshooting:
- If you see CORS errors, add the frontend origin (`http://localhost:5173`) to the backend CORS allowed origins.
- Inspect network requests in the browser DevTools; ensure requests go to the configured `VITE_API_BASE_URL`.

--


---

## New Features

- **Customer Management:**
  - Customers cannot be deleted, chỉ có thể chuyển trạng thái sang "Inactive" bằng nút Deactivate trong trang admin.
  - Để kích hoạt lại, vào Edit customer và chọn lại trạng thái "Active".

- **POS Order Filtering:**
  - Trang POS Order (admin) hỗ trợ lọc sản phẩm theo tên, theo category, và theo product.
  - Sử dụng ô search, dropdown category, và dropdown product để lọc nhanh các biến thể sản phẩm.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

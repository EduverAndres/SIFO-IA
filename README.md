
```
SIFO-IA
├─ backend-nestjs
│  ├─ .prettierrc
│  ├─ eslint.config.mjs
│  ├─ nest-cli.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ src
│  │  ├─ app.controller.spec.ts
│  │  ├─ app.controller.ts
│  │  ├─ app.module.ts
│  │  ├─ app.service.ts
│  │  ├─ auth
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ auth.module.ts
│  │  │  ├─ auth.service.ts
│  │  │  ├─ dto
│  │  │  │  ├─ login-user.dto.ts
│  │  │  │  └─ register-user.dto.ts
│  │  │  ├─ entities
│  │  │  │  └─ user.entity.ts
│  │  │  └─ strategies
│  │  │     └─ jwt.strategy.ts
│  │  ├─ common
│  │  │  ├─ filters
│  │  │  │  ├─ all-exceptions.filter.ts
│  │  │  │  └─ http-exception.filter.ts
│  │  │  └─ interceptors
│  │  │     ├─ logging.interceptor.ts
│  │  │     └─ transform.interceptor.ts
│  │  ├─ config
│  │  │  └─ supabase.config.ts
│  │  ├─ debug.controller.ts
│  │  ├─ ia-service
│  │  │  └─ ia-service.controller.ts
│  │  ├─ main.ts
│  │  ├─ ordenes-compra
│  │  │  ├─ detalle-orden.entity.ts
│  │  │  ├─ dto
│  │  │  │  ├─ create-detalle-orden.dto.ts
│  │  │  │  ├─ create-orden-compra.dto.ts
│  │  │  │  ├─ filtros-orden.dto.ts
│  │  │  │  ├─ update-estado-orden.dto.ts
│  │  │  │  └─ update-orden-compra.dto.ts
│  │  │  ├─ orden-compra.entity.ts
│  │  │  ├─ ordenes-compra.controller.ts
│  │  │  ├─ ordenes-compra.module.ts
│  │  │  └─ ordenes-compra.service.ts
│  │  ├─ productos
│  │  │  ├─ dto
│  │  │  │  ├─ create-producto.dto.ts
│  │  │  │  └─ update-producto.dto.ts
│  │  │  ├─ producto.entity.ts
│  │  │  ├─ productos.controller.ts
│  │  │  ├─ productos.module.ts
│  │  │  └─ productos.service.ts
│  │  ├─ proveedores
│  │  │  ├─ dto
│  │  │  │  ├─ create-proveedor.dto.ts
│  │  │  │  └─ update-proveedor.dto.ts
│  │  │  ├─ proveedor.entity.ts
│  │  │  ├─ proveedores.controller.ts
│  │  │  ├─ proveedores.module.ts
│  │  │  └─ proveedores.service.ts
│  │  └─ puc
│  │     ├─ dto
│  │     │  ├─ arbol-puc.dto.ts
│  │     │  ├─ create-cuenta-puc.dto.ts
│  │     │  ├─ export-puc-excel.dto.ts
│  │     │  ├─ filtros-puc.dto.ts
│  │     │  ├─ import-puc-excel.dto.ts
│  │     │  ├─ importar-puc.dto.ts
│  │     │  ├─ response-puc.dto.ts
│  │     │  ├─ resultado-importacion.dto.ts
│  │     │  ├─ resultado-validacion.dto.ts
│  │     │  ├─ resumen-importacion.dto.ts
│  │     │  ├─ update-cuenta-puc.dto.ts
│  │     │  └─ validar-excel.dto.ts
│  │     ├─ entities
│  │     │  └─ cuenta-puc.entity.ts
│  │     ├─ interfaces
│  │     │  ├─ excel-row.interface.ts
│  │     │  └─ puc.interface.ts
│  │     ├─ puc.controller.ts
│  │     ├─ puc.module.ts
│  │     ├─ puc.service.ts
│  │     └─ services
│  │        └─ puc-excel.service.ts
│  ├─ test
│  │  ├─ app.e2e-spec.ts
│  │  └─ jest-e2e.json
│  ├─ tsconfig.build.json
│  ├─ tsconfig.json
│  └─ uploads
├─ database
│  ├─ puc-schema.sql
│  └─ schema.sql
├─ frontend-react
│  ├─ netlify.toml
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ favicon.ico
│  │  ├─ index.html
│  │  ├─ manifest.json
│  │  └─ robots.txt
│  ├─ README.md
│  ├─ src
│  │  ├─ api
│  │  │  ├─ config.js
│  │  │  ├─ ordenesApi.js
│  │  │  ├─ produccionApi.js
│  │  │  └─ pucApi.js
│  │  ├─ App.js
│  │  ├─ App.test.js
│  │  ├─ assets
│  │  │  └─ hero-illustration.svg
│  │  ├─ components
│  │  │  ├─ Button.jsx
│  │  │  ├─ CrearProveedorModal.jsx
│  │  │  ├─ Dashboard.jsx
│  │  │  ├─ DashboardLayout.jsx
│  │  │  ├─ DatePicker.jsx
│  │  │  ├─ ErrorBoundary.jsx
│  │  │  ├─ FileInput.jsx
│  │  │  ├─ Input.jsx
│  │  │  ├─ InputField.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ Modal.jsx
│  │  │  ├─ OrdenesDeCompraMenuModal.jsx
│  │  │  ├─ ProtectedRoute.jsx
│  │  │  ├─ puc
│  │  │  │  ├─ CreateCuentaModal.jsx
│  │  │  │  ├─ EditCuentaModal.jsx
│  │  │  │  ├─ ExportPucModal.jsx
│  │  │  │  ├─ ImportPucExcelModal.jsx
│  │  │  │  ├─ ImportPucModal.jsx
│  │  │  │  ├─ PucFilters.jsx
│  │  │  │  ├─ PucManager.jsx
│  │  │  │  ├─ PucStats.jsx
│  │  │  │  └─ PucTableView.jsx
│  │  │  ├─ Register.jsx
│  │  │  ├─ Select.jsx
│  │  │  ├─ SelectField.jsx
│  │  │  ├─ ui
│  │  │  └─ wi.sql
│  │  ├─ hooks
│  │  │  ├─ usePuc.js
│  │  │  └─ useSafeRender.js
│  │  ├─ index.css
│  │  ├─ index.js
│  │  ├─ pages
│  │  │  ├─ AboutSIFO.jsx
│  │  │  ├─ AboutUs.jsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ DashboardOverview.jsx
│  │  │  │  ├─ MenuFinanciero.jsx
│  │  │  │  ├─ OrdenesCompra.jsx
│  │  │  │  ├─ PlaceholderPage.jsx
│  │  │  │  ├─ PlanCuentas.jsx
│  │  │  │  ├─ Presupuesto.jsx
│  │  │  │  └─ Produccion.jsx
│  │  │  ├─ HomePage.jsx
│  │  │  ├─ LoginPage.jsx
│  │  │  ├─ ProjectVision.jsx
│  │  │  ├─ PucPage.jsx
│  │  │  └─ RegisterPage.jsx
│  │  ├─ reportWebVitals.js
│  │  ├─ setupTests.js
│  │  └─ utils
│  │     └─ domPatch.js
│  └─ tailwind.config.js
└─ README.md

```
# SIFO

Back office de compras y contabilidad para pequeñas empresas colombianas: gestiona
órdenes de compra, productos y proveedores sobre un Plan Único de Cuentas (PUC) que se
carga masivamente desde Excel con validación previa.

**[English](#english) · [Español](#español)**

---

## English

### What it does and who it is for

SIFO is a procurement and accounting back office aimed at small Colombian companies
that keep their chart of accounts in spreadsheets. It manages purchase orders,
products and suppliers on top of a PUC (*Plan Único de Cuentas*, the Colombian
standard chart of accounts), which can be bulk-loaded from Excel: the file is
validated row by row first, and the import reports which rows were accepted,
which were rejected and why.

The accounts are stored as a hierarchy, so the PUC can be browsed as a tree, filtered,
and exported back to Excel or PDF.

### Stack

| Layer | Technologies |
|---|---|
| Backend | NestJS · TypeORM · PostgreSQL (Supabase) · JWT + Passport · Swagger · Multer |
| Frontend | React · Tailwind CSS · React Router · axios · Recharts · SheetJS · jsPDF |

### Requirements

- Node.js 18+
- A PostgreSQL database (the project is configured for Supabase, with SSL enabled)

### Installation

```bash
git clone https://github.com/EduverAndres/SIFO-IA.git
cd SIFO-IA

# Backend
cd backend-nestjs
npm install

# Frontend
cd ../frontend-react
npm install
```

Create `backend-nestjs/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=development
```

The database schema lives in `database/schema.sql` and `database/puc-schema.sql`.

### Running it

```bash
# Backend — http://localhost:3001
cd backend-nestjs
npm run start:dev

# Frontend — http://localhost:3000
cd frontend-react
npm start
```

The REST API is served under `/api/v1`, and the Swagger documentation is available at
`http://localhost:3001/api/docs`.

### Screenshots

<!-- Añadir aquí una captura del árbol PUC y otra del importador de Excel -->
<!-- Add a screenshot of the PUC tree view and one of the Excel importer here -->

### Status

Personal project, still in development. The `ia-service` endpoint is a placeholder:
AI-assisted product suggestion is declared in the route but not implemented yet.
`synchronize` is enabled in TypeORM, which is convenient in development but must be
turned off before running this against a production database.

---

## Español

### Qué hace y para quién

SIFO es un back office de compras y contabilidad pensado para pequeñas empresas
colombianas que llevan su plan de cuentas en hojas de cálculo. Gestiona órdenes de
compra, productos y proveedores sobre un PUC (Plan Único de Cuentas), que se puede
cargar masivamente desde Excel: el archivo se valida fila por fila antes de importar,
y el resultado informa qué filas se aceptaron, cuáles se rechazaron y por qué.

Las cuentas se guardan como jerarquía, así que el PUC se puede recorrer en árbol,
filtrar y exportar de vuelta a Excel o PDF.

### Stack

| Capa | Tecnologías |
|---|---|
| Backend | NestJS · TypeORM · PostgreSQL (Supabase) · JWT + Passport · Swagger · Multer |
| Frontend | React · Tailwind CSS · React Router · axios · Recharts · SheetJS · jsPDF |

### Requisitos

- Node.js 18 o superior
- Una base de datos PostgreSQL (el proyecto está configurado para Supabase, con SSL)

### Instalación

```bash
git clone https://github.com/EduverAndres/SIFO-IA.git
cd SIFO-IA

# Backend
cd backend-nestjs
npm install

# Frontend
cd ../frontend-react
npm install
```

Crea `backend-nestjs/.env`:

```env
DATABASE_URL=postgresql://usuario:contrasena@host:5432/basededatos
NODE_ENV=development
```

El esquema de la base de datos está en `database/schema.sql` y `database/puc-schema.sql`.

### Cómo ejecutarlo

```bash
# Backend — http://localhost:3001
cd backend-nestjs
npm run start:dev

# Frontend — http://localhost:3000
cd frontend-react
npm start
```

La API REST se sirve bajo `/api/v1` y la documentación Swagger queda en
`http://localhost:3001/api/docs`.

### Capturas

<!-- Añadir aquí una captura del árbol PUC y otra del importador de Excel -->

### Estado

Proyecto personal, en desarrollo. El endpoint `ia-service` es un placeholder: la
sugerencia de productos con IA está declarada en la ruta pero todavía no está
implementada. `synchronize` está activo en TypeORM, cómodo en desarrollo pero hay que
desactivarlo antes de apuntar a una base de datos de producción.

---

## Licencia · License

MIT — ver [LICENSE](LICENSE).

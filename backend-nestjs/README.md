# backend-nestjs/README.md

# 🏛️ Sistema PUC - Backend NestJS

Backend completo desarrollado en **NestJS** para la gestión del **Plan Único de Cuentas (PUC)** según la normativa colombiana.

## ✨ Características Principales

- ✅ **CRUD Completo** - Crear, leer, actualizar, eliminar cuentas contables
- ✅ **Validaciones Automáticas** - Jerarquía, códigos, reglas de negocio PUC
- ✅ **PUC Estándar Colombiano** - Importación automática del PUC oficial
- ✅ **API REST Completa** - Endpoints documentados con Swagger
- ✅ **Base de Datos PostgreSQL** - Optimizada para Supabase
- ✅ **TypeScript** - Tipado completo y validaciones en tiempo de compilación
- ✅ **Tests Incluidos** - Unitarios, integración y E2E
- ✅ **Documentación Swagger** - Interfaz interactiva para probar la API

## 🏗️ Arquitectura

```
backend-nestjs/
├── 📁 src/
│   ├── 📁 puc/                    # Módulo principal PUC
│   │   ├── 📁 entities/           # Entidades TypeORM
│   │   ├── 📁 dto/               # Data Transfer Objects
│   │   ├── 📁 interfaces/        # Interfaces TypeScript
│   │   ├── 📄 puc.controller.ts  # Controlador REST
│   │   ├── 📄 puc.service.ts     # Lógica de negocio
│   │   └── 📄 puc.module.ts      # Módulo NestJS
│   ├── 📁 common/                # Utilidades compartidas
│   ├── 📄 app.module.ts          # Módulo principal
│   └── 📄 main.ts                # Punto de entrada
├── 📁 scripts/                   # Scripts de base de datos
├── 📄 package.json              # Dependencias Node.js
└── 📄 README.md                 # Este archivo
```

## 🚀 Instalación Rápida

### 1. Clonar e instalar dependencias
```bash
cd backend-nestjs
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de Supabase
nano .env
```

**Configuración de `.env`:**
```env
# Base de datos Supabase
DB_HOST=db.tuproyecto.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_supabase
DB_DATABASE=postgres

# Servidor
NODE_ENV=development
PORT=3001

# Opcional
JWT_SECRET=tu_jwt_secret_muy_seguro
SWAGGER_ENABLED=true
```

### 3. Configurar base de datos en Supabase

1. Ve a [Supabase](https://app.supabase.io)
2. Abre tu proyecto > **SQL Editor**
3. Ejecuta el script completo de `scripts/database-setup.sql`

### 4. Iniciar el servidor
```bash
# Desarrollo con hot reload
npm run start:dev

# Producción
npm run build
npm run start:prod
```

### 5. Importar PUC estándar
```bash
curl -X POST http://localhost:3001/api/v1/puc/importar-estandar
```

## 📖 Documentación API

Una vez iniciado el servidor:

- **🌐 API Base:** `http://localhost:3001/api/v1`
- **📚 Swagger UI:** `http://localhost:3001/api/docs`
- **🏛️ PUC Endpoints:** `http://localhost:3001/api/v1/puc`
- **🏥 Health Check:** `http://localhost:3001/api/v1/puc/salud/verificar`

## 📊 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/puc` | 📋 Listar cuentas con filtros |
| `POST` | `/puc` | ➕ Crear nueva cuenta |
| `GET` | `/puc/:id` | 🔍 Obtener cuenta por ID |
| `GET` | `/puc/codigo/:codigo` | 🔢 Obtener cuenta por código |
| `PATCH` | `/puc/:id` | ✏️ Actualizar cuenta |
| `DELETE` | `/puc/:id` | 🗑️ Eliminar cuenta |
| `GET` | `/puc/estadisticas` | 📊 Métricas del PUC |
| `GET` | `/puc/arbol` | 🌳 Estructura jerárquica |
| `POST` | `/puc/importar-estandar` | 📥 Importar PUC estándar |
| `GET` | `/puc/validar/:codigo` | ✅ Validar código |

## 🎯 Ejemplos de Uso

### Crear una cuenta
```bash
curl -X POST http://localhost:3001/api/v1/puc \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "1105",
    "nombre": "CAJA",
    "descripcion": "Dinero en efectivo"
  }'
```

### Listar cuentas con filtros
```bash
# Buscar cuentas que contengan "CAJA"
curl "http://localhost:3001/api/v1/puc?busqueda=CAJA"

# Filtrar por tipo y naturaleza
curl "http://localhost:3001/api/v1/puc?tipo=CUENTA&naturaleza=DEBITO"

# Paginación
curl "http://localhost:3001/api/v1/puc?pagina=1&limite=20"
```

### Obtener estadísticas
```bash
curl http://localhost:3001/api/v1/puc/estadisticas
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests E2E
npm run test:e2e

# Tests en modo watch
npm run test:watch
```

## 🏛️ Estructura del PUC Colombiano

### Niveles Jerárquicos
- **Nivel 1 (1 dígito):** Clase - `1` = ACTIVOS
- **Nivel 2 (2 dígitos):** Grupo - `11` = DISPONIBLE  
- **Nivel 3 (4 dígitos):** Cuenta - `1105` = CAJA
- **Nivel 4 (6 dígitos):** Subcuenta - `110505` = CAJA GENERAL
- **Nivel 5+ (7+ dígitos):** Auxiliar - `11050501` = CAJA SUCURSAL 1

### Clases Contables
| Código | Nombre | Naturaleza | Descripción |
|--------|--------|------------|-------------|
|
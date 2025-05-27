# SIFO-IA

Sistema inteligente desarrollado con React (frontend) y NestJS (backend).

## 🚀 Tecnologías

- **Frontend**: React
- **Backend**: NestJS
- **Base de datos**: Mysql(Xampp)

## 📋 PrerrequisitoS

- Node.js (versión 16 o superior)
- npm o yarn
- [Otros prerrequisitos específicos]

## 🛠️ Instalación

### Backend (NestJS)

```bash
cd backend
npm install
```

### Frontend (React)

```bash
cd frontend
npm install
```

## ⚙️ Configuración

1. Crear archivo `.env` en el directorio del backend:

```env
# Ejemplo de variables de entorno
DATABASE_URL=ordenes_compra_db
JWT_SECRET=tu_jwt_secret
PORT=3000
```

2. Crear archivo `.env` en el directorio del frontend (si es necesario):

```env
REACT_APP_API_URL=http://localhost:3001
```

## 📖 Uso

### Desarrollo

1. Iniciar el backend:
```bash
cd backend
npm run start:dev
```

2. Iniciar el frontend:
```bash
cd frontend
npm start
```

El frontend estará disponible en `http://localhost:3000` y el backend en `http://localhost:3001` (o el puerto configurado).

### Producción

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

[Especificar la licencia del proyecto]

## 👥 Autores

- **EduverAndres** - *Desarrollo inicial* - [EduverAndres](https://github.com/EduverAndres)
# Marcación GO

Sistema web de control de asistencia. Monorepo con `/client` (React+Vite+Tailwind, PWA) y `/server` (Node+Express+Prisma+PostgreSQL).

## Requisitos

- Node.js 20+
- PostgreSQL 15+
- npm 10+

---

## Instalación local

### 1. Clonar y configurar variables

```bash
git clone https://github.com/Grey-lovelaceK/Prroyecto-Practica.git
cd Prroyecto-Practica

cp .env.example server/.env
# Editar server/.env con tus credenciales
```

### 2. Backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js   # Carga datos de prueba
npm run dev           # Puerto 4000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev           # Puerto 5173
```

---

## Usuarios de prueba (seed)

| Correo | Contraseña | Rol |
|--------|-----------|-----|
| ana.garcia@marcaciongo.cl | admin123 | rrhh |
| jorge.ramirez@marcaciongo.cl | admin123 | supervisor |
| carlos.perez@marcaciongo.cl | password123 | empleado |
| maria.lopez@marcaciongo.cl | password123 | empleado |

---

## Estructura del proyecto

```
/
├── client/                # React + Vite + Tailwind (PWA)
│   ├── src/
│   │   ├── context/       # AuthContext (JWT + refresh)
│   │   ├── services/      # api.js con interceptor refresh
│   │   ├── pages/         # Login, Marcar, Historial
│   │   └── pages/admin/   # Dashboard, Empleados, Reportes
│   └── vite.config.js     # Proxy API + PWA config
├── server/                # Node + Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma  # Modelos BD
│   │   └── seed.js        # Datos de prueba
│   └── src/
│       ├── controllers/   # Lógica de negocio
│       ├── middleware/     # JWT auth + control roles
│       ├── routes/        # Rutas REST
│       └── utils/         # JWT helpers, cálculo asistencia
├── seed.sql               # Seed alternativo SQL puro
└── .env.example
```

---

## API REST

| Método | Ruta | Rol requerido |
|--------|------|---------------|
| POST | /api/auth/login | — |
| POST | /api/auth/refresh | — |
| GET | /api/auth/me | autenticado |
| POST | /api/marcaciones | empleado+ |
| GET | /api/marcaciones | empleado+ |
| GET | /api/marcaciones/hoy | empleado+ |
| GET | /api/asistencia | empleado+ |
| GET | /api/asistencia/dashboard | rrhh/supervisor |
| POST | /api/asistencia/calcular | rrhh/supervisor |
| GET/POST/PUT/DELETE | /api/empleados | rrhh/supervisor |
| GET/POST/PUT/DELETE | /api/horarios | autenticado (escritura: rrhh/supervisor) |
| GET | /api/reportes | rrhh/supervisor |
| POST | /api/reportes/generar | rrhh/supervisor |

---

## Deploy en AWS

### Frontend → S3 + CloudFront

```bash
cd client
npm run build
# Subir dist/ a bucket S3 con static website hosting
# Crear distribución CloudFront apuntando al bucket
# Configurar custom error page 404 → index.html (SPA routing)
```

### Backend → EC2 / Elastic Beanstalk

1. Crear instancia EC2 (Ubuntu 22.04) o entorno Beanstalk Node.js
2. Instalar Node 20, PostgreSQL en RDS
3. Clonar repo, instalar deps, configurar `.env` con `DATABASE_URL` de RDS
4. Ejecutar `npx prisma migrate deploy`
5. Usar PM2 para mantener proceso: `pm2 start index.js --name marcacion-go`
6. Configurar Security Group: puerto 4000 accesible solo desde frontend

### Base de datos → RDS PostgreSQL

```
DATABASE_URL=postgresql://USER:PASS@<rds-endpoint>:5432/marcacion_go
```

### Variables de entorno en producción

Todas las variables de `server/.env.example` son necesarias en producción. En EC2 usar `/etc/environment` o AWS Secrets Manager.

---

## PWA

El frontend es instalable como app en móvil y desktop. Service worker con cache `NetworkFirst` para las llamadas API (TTL 5 min). Íconos requeridos en `client/public/icons/`: `icon-192.png` y `icon-512.png`.

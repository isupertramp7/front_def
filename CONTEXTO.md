# GOTEST — Contexto del proyecto

> Última actualización: 2026-05-01

---

## ¿Qué es?

Sistema de control de asistencia laboral para empresas chilenas. Dos superficies:
1. **PWA móvil** — empleados marcan entrada/salida con geofence + biometría + selfie
2. **Admin web** — admins ven dashboard, asistencia, empleados, sitios, reportes

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + TypeScript + Tailwind CSS + Vite |
| Mobile PWA | Vite PWA plugin + manifest + SW |
| Auth | JWT + WebAuthn/Passkeys (biometric step-up) |
| Backend (diseño) | AWS API Gateway → Lambda Node 20 → DynamoDB + S3 |
| Geofence | Haversine client-side + validación server-side |

Paleta: `#1e5799` → `#2989d8` (gradiente botones), dark nav `#070F1E`  
Fuente: Poppins

---

## Estructura de archivos (excl. node_modules)

```
GOTEST/
├── api_contract.md          # Contrato REST completo
├── CONTEXTO.md              # Este archivo
├── mockups/
│   ├── AdminDashboard.tsx   # Dashboard admin (mock con data estática)
│   ├── LoginPage.tsx        # Login desktop
│   ├── MobileAuth.tsx       # Login móvil (glass dark)
│   ├── MobilePunch.tsx      # App marcación móvil
│   └── lib/
│       └── geofence.ts      # Haversine — distancia GPS
├── pwa-config/
│   ├── manifest.json
│   └── next.config.ts
├── viewer/                  # Visualizador de mockups (Vite + Tailwind)
│   └── src/App.tsx
└── client/
    ├── dist/                # Build compilado del viewer
    └── imagenes/            # Assets (logo, fotos mock)
```

---

## API Contract (resumen)

Definido en `api_contract.md`. Base URL: `https://api.gotest.app/v1`

| Endpoint | Función |
|----------|---------|
| `POST /auth/login` | Login con RUT o email + password |
| `POST /auth/challenge` | Genera WebAuthn challenge (step-up pre-punch) |
| `POST /auth/verify` | Verifica assertion WebAuthn → JWT |
| `POST /auth/register/challenge` | Primer login → registra passkey |
| `POST /auth/register/verify` | Guarda credencial pública |
| `GET /sites` | Lista sitios activos con coords y radio |
| `GET /sites/{siteId}` | Sitio + turnos |
| `POST /punches/presigned-url` | Genera URL S3 para subir selfie |
| `POST /punches` | Registra marcación (valida geofence server-side) |
| `GET /punches` | Historial del usuario autenticado |
| `GET /reports` | Datos asistencia con HT/atrasos/HE (admin) |
| `GET /reports/export` | Genera .xlsx → presigned URL S3 |

Flujo marcación: `GET presigned-url` → `PUT blob S3` → `POST /punches + photoKey`  
WebAuthn es step-up justo antes del punch (no es el login inicial).

---

## Lo que está listo ✅

### Mockups / diseño de pantallas
- [x] `LoginPage.tsx` — login desktop, dual panel (brand + form), detecta RUT vs email automáticamente
- [x] `MobileAuth.tsx` — login móvil glassmorphism dark
- [x] `MobilePunch.tsx` — app marcación completa:
  - Flujo 4 pasos: entrada → salida colación → regreso colación → salida
  - Reloj en tiempo real
  - Geofence badge (verde/rojo) + bloqueo si fuera de radio
  - WebAuthn biometric step-up (con fallback mock si no hay `PublicKeyCredential`)
  - Camera modal: preview con guía óvalo, captura, confirmar/repetir, upload spinner
  - Historial del día por turno
  - Bottom tab nav (Asistencia / Historial / Más)
- [x] `AdminDashboard.tsx` — dashboard admin completo (6 vistas):
  - **Dashboard**: KPIs (activos/presentes/ausentes/alertas), gráfico barras apiladas semanal, asistencia por sitio, actividad reciente, tabla resumen
  - **Asistencia**: filtros (fecha, sitio, estado, búsqueda), tabla paginada, export CSV client-side
  - **Empleados**: tabla con filtros, estado passkey por empleado, modal "Nuevo empleado"
  - **Sitios**: cards con toggle activo/inactivo, barra asistencia, coords
  - **Reportes**: panel configuración (tipo/rango/sitio), preview tabla, botones CSV/Excel
  - **Ajustes**: tabs empresa/turnos/seguridad/integraciones, toggles, API keys

### Lógica compartida
- [x] `geofence.ts` — Haversine correcta, `checkGeofence()` retorna `{ isWithin, distanceMeters }`
- [x] `api_contract.md` — Contrato REST completo con ejemplos request/response y errores
- [x] PWA config — manifest.json + next.config.ts
- [x] Viewer — app Vite para visualizar mockups

---

## Lo que falta ❌

### Backend
- [ ] Lambda functions (auth, punches, reports, sites)
- [ ] DynamoDB: tabla `punches` (PK=userId, SK=timestamp, GSI siteId+date)
- [ ] S3 buckets: `gotest-punches` (fotos, lifecycle 90d), `gotest-reports` (exports, lifecycle 24h)
- [ ] API Gateway HTTP v2 + JWT Authorizer
- [ ] Generación real de presigned URLs
- [ ] Lógica cálculo HT / atrasos / HE en Lambda
- [ ] Generación real .xlsx (reports/export)
- [ ] CloudWatch alarmas (error rate >1%, latencia p99 >2s)

### Frontend real (producción)
- [ ] Proyecto React/Next.js real (actualmente solo mockups estáticos con data hardcoded)
- [ ] Login real → llamada `POST /auth/login` → guardar JWT
- [ ] Registro passkey en primer login (`/auth/register/challenge` + `/auth/register/verify`)
- [ ] Geolocalización real → `navigator.geolocation.watchPosition()`
- [ ] Upload real selfie → `PUT {presignedUrl}` con blob
- [ ] Llamada real `POST /punches` con `photoKey` + `webAuthnToken`
- [ ] Historial real desde `GET /punches`
- [ ] Dashboard admin conectado a `GET /reports`
- [ ] Export Excel real desde `GET /reports/export`
- [ ] CRUD empleados real (actualmente modal no persiste)
- [ ] CRUD sitios real (toggle no persiste)
- [ ] Notificaciones push PWA

### Testing & DevOps
- [ ] Tests unitarios (geofence, utils)
- [ ] Tests E2E
- [ ] CI/CD pipeline
- [ ] Deploy (Amplify / Vercel / S3+CloudFront para frontend)

---

## Decisiones de arquitectura tomadas

| Decisión | Motivo |
|----------|--------|
| Selfie via presigned URL, no multipart al Lambda | Lambda tiene límite 6MB en API Gateway; S3 directo evita el bottleneck |
| WebAuthn como step-up (no login biométrico) | Primer login siempre con password; biometría solo verifica identidad al marcar |
| Geofence server-side además de client-side | Prevenir spoofing GPS |
| `webAuthnToken` TTL 5 min single-use | Evitar replay attacks en `/punches` |
| DynamoDB GSI por `siteId+date` | Queries de reportes sin full scan |

---

## Datos mock usados en mockups

- Empresa: **Go tecnologia**
- Sitios: GO, Kaufmann Pajaritos, Soprole Vitacura, Sura, Komatsu, Soprole renca (inactiva)
- 9 empleados con datos realistas chilenos (RUT, correo @goalliance.cl)
- Turno principal: lunes a viernes 08:00–17:30, 1 hora de colación

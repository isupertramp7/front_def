# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sistema de control de asistencia laboral (Chile). Frontend React/TypeScript + arquitectura AWS diseñada. Estado actual: mockups UI completos, backend no implementado.

## Commands

All commands run from `viewer/`:

```bash
npm run dev       # Vite dev server → localhost:5173
npm run build     # TypeScript check + Vite bundle
npm run preview   # Preview production build
```

No test runner configured. No linter configured.

## Architecture

```
GOTEST/
├── mockups/              # Componentes React (diseño estático, sin rutas)
│   ├── LoginPage.tsx     # Login desktop dual-panel (detecta RUT vs email)
│   ├── MobileAuth.tsx    # Login mobile (glassmorphism, biométrico stub)
│   ├── MobilePunch.tsx   # Flujo marcaje (4 pasos: geo → biometría → cámara → punch)
│   ├── AdminDashboard.tsx# Panel admin 6 tabs (KPIs, asistencia, CRUD empleados/sedes)
│   └── lib/geofence.ts   # Haversine: checkGeofence(user, site, radius) → {isWithin, distanceMeters}
│
├── viewer/               # App Vite que monta los mockups
│   ├── src/App.tsx       # Navbar + state switch entre los 4 mockups
│   ├── vite.config.ts    # Alias: @mockups → ../mockups
│   └── tailwind.config.js# Colores de marca: #1e5799 → #2989d8, navy #070F1E
│
├── client/dist/          # Build output del viewer
├── pwa-config/           # manifest.json + next.config.ts (PWA, sin implementar)
├── api_contract.md       # 13 endpoints REST definidos (base: https://api.gotest.app/v1)
└── CONTEXTO.md           # Contexto del proyecto en español
```

## Key Design Decisions

- **Mockups-first**: los componentes en `mockups/` son autocontenidos, usan estado local y datos hardcodeados — no hay API real aún.
- **Viewer app**: `viewer/src/App.tsx` importa los mockups directamente via alias `@mockups`. Agregar nuevo mockup = importar en App.tsx + agregar botón al nav.
- **Geofence**: radio default 500m. `checkGeofence` pura (sin side effects), lista para conectar a `navigator.geolocation`.
- **Auth flow diseñado**: JWT (login) + WebAuthn/Passkeys (step-up biométrico). Ambos son stubs en los mockups.
- **Stack AWS planeado**: API Gateway → Lambda Node 20 → DynamoDB + S3. Ver `api_contract.md` para schemas de request/response.
- **PWA**: `pwa-config/` tiene manifest y estrategias de caché (NetworkFirst API, CacheFirst assets). No está integrado al viewer actual.

## Brand

- Gradiente: `#1e5799 → #2989d8` (azul)
- Nav: `#070F1E` (navy oscuro)
- Font: Poppins
- Tailwind custom colors definidos en `viewer/tailwind.config.js`

# GOTEST API Contract

**Base URL:** `https://api.gotest.app/v1`  
**Auth:** `Authorization: Bearer <jwt>` en todos los endpoints protegidos  
**Arquitectura:** AWS API Gateway → Lambda (Node 20) → DynamoDB / S3

---

## Auth — WebAuthn / Passkeys

### POST /auth/challenge
Genera challenge para autenticación con passkey (WebAuthn `navigator.credentials.get`).

**Request**
```json
{
  "rut": "12345678-9"
}
```

**Response 200**
```json
{
  "challenge": "dGhpcyBpcyBhIHJhbmRvbQ",
  "rpId": "gotest.app",
  "timeout": 60000,
  "allowCredentials": [
    {
      "id": "credentialIdBase64url",
      "type": "public-key",
      "transports": ["internal"]
    }
  ],
  "userVerification": "required"
}
```

**Response 404**
```json
{ "error": "USER_NOT_FOUND" }
```

---

### POST /auth/verify
Verifica assertion de WebAuthn y retorna JWT.

**Request** (payload del `PublicKeyCredential` serializado)
```json
{
  "rut": "12345678-9",
  "credentialId": "credentialIdBase64url",
  "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiZEdobGFTQnBjeUJoSUhKaGJtZHZiUSJ9",
  "authenticatorData": "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MFAAAAAA",
  "signature": "MEUCIQD...",
  "userHandle": "dXNlcklk"
}
```

**Response 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 28800,
  "user": {
    "id": "usr_01HX",
    "rut": "12345678-9",
    "name": "Cristian Florez Revilla",
    "role": "employee",
    "siteId": "site_01"
  }
}
```

**Response 401**
```json
{ "error": "INVALID_ASSERTION" }
```

---

### POST /auth/register/challenge
*(Primer login — genera challenge para `navigator.credentials.create`)*

**Request**
```json
{
  "rut": "12345678-9",
  "password": "temporal123"
}
```

**Response 200**
```json
{
  "challenge": "cmVnaXN0cmF0aW9uQ2hhbGxlbmdl",
  "rp": { "id": "gotest.app", "name": "GOTEST Marcación" },
  "user": {
    "id": "dXNlcklk",
    "name": "12345678-9",
    "displayName": "Cristian Florez Revilla"
  },
  "pubKeyCredParams": [
    { "type": "public-key", "alg": -7 },
    { "type": "public-key", "alg": -257 }
  ],
  "authenticatorSelection": {
    "authenticatorAttachment": "platform",
    "requireResidentKey": true,
    "userVerification": "required"
  },
  "timeout": 60000
}
```

---

### POST /auth/register/verify
Guarda la credencial pública del dispositivo.

**Request**
```json
{
  "rut": "12345678-9",
  "credentialId": "newCredIdBase64url",
  "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiLi4uIn0",
  "attestationObject": "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVik..."
}
```

**Response 201**
```json
{ "registered": true }
```

---

## Sites

### GET /sites
Retorna todos los sitios activos con coordenadas y radio.

**Headers:** `Authorization: Bearer <jwt>`

**Response 200**
```json
{
  "sites": [
    {
      "id": "site_01",
      "name": "Casa Matriz",
      "address": "Av. Providencia 1234, Santiago",
      "lat": -33.4372,
      "lng": -70.6366,
      "radiusMeters": 500,
      "timezone": "America/Santiago",
      "active": true
    }
  ]
}
```

---

### GET /sites/{siteId}
Retorna un sitio específico.

**Response 200**
```json
{
  "id": "site_01",
  "name": "Casa Matriz",
  "address": "Av. Providencia 1234, Santiago",
  "lat": -33.4372,
  "lng": -70.6366,
  "radiusMeters": 500,
  "timezone": "America/Santiago",
  "shifts": [
    {
      "id": "shift_01",
      "name": "Turno Mañana",
      "start": "08:30",
      "end": "18:00",
      "breakMinutes": 45
    }
  ],
  "active": true
}
```

---

## Punches

### POST /punches
Registra una marcación. Valida geofence server-side antes de persistir.

**Headers:** `Authorization: Bearer <jwt>`

**Request**
```json
{
  "siteId": "site_01",
  "type": "entrada",
  "lat": -33.4370,
  "lng": -70.6364,
  "accuracy": 12.5,
  "deviceId": "device_fingerprint_hash",
  "timestamp": "2026-04-29T08:41:00-04:00"
}
```
> `type`: `"entrada"` | `"salida"` | `"salida_colacion"` | `"entrada_colacion"`

**Response 201**
```json
{
  "id": "punch_01HX",
  "userId": "usr_01HX",
  "siteId": "site_01",
  "type": "entrada",
  "recordedAt": "2026-04-29T08:41:00-04:00",
  "distanceMeters": 38,
  "isWithinGeofence": true,
  "shiftId": "shift_01"
}
```

**Response 422 — Fuera de geofence**
```json
{
  "error": "OUTSIDE_GEOFENCE",
  "distanceMeters": 623,
  "radiusMeters": 500
}
```

**Response 409 — Doble marcación**
```json
{
  "error": "DUPLICATE_PUNCH",
  "lastPunch": {
    "type": "entrada",
    "recordedAt": "2026-04-29T08:41:00-04:00"
  }
}
```

---

### GET /punches
Historial de marcaciones del usuario autenticado.

**Query params:** `?from=2026-04-01&to=2026-04-30&limit=30&cursor=<base64>`

**Response 200**
```json
{
  "punches": [
    {
      "id": "punch_01HX",
      "type": "entrada",
      "recordedAt": "2026-04-29T08:41:00-04:00",
      "distanceMeters": 38,
      "isWithinGeofence": true,
      "shift": {
        "name": "Turno Mañana",
        "start": "08:30",
        "end": "18:00"
      }
    }
  ],
  "nextCursor": null,
  "total": 1
}
```

---

## Reports (Admin)

### GET /reports
Datos de asistencia con cálculo de HT, atrasos, HE.  
**Requiere:** `role: admin`

**Query params:**
```
?siteId=site_01
&from=2026-04-01
&to=2026-04-30
&employeeId=usr_01HX   (opcional)
&status=late           (opcional: on_time|late|absent|overtime)
&limit=50
&cursor=<base64>
```

**Response 200**
```json
{
  "records": [
    {
      "userId": "usr_01HX",
      "name": "Cristian Florez Revilla",
      "rut": "12345678-9",
      "siteId": "site_01",
      "siteName": "Casa Matriz",
      "date": "2026-04-29",
      "shift": {
        "start": "08:30",
        "end": "18:00",
        "breakMinutes": 45
      },
      "punches": {
        "entrada": "08:41",
        "salidaColacion": "14:26",
        "entradaColacion": "15:13",
        "salida": "18:05"
      },
      "horasTrabajadas": "08:45",
      "minutosAtraso": 11,
      "horasExtra": 5,
      "nroReposiciones": 0,
      "status": "late"
    }
  ],
  "summary": {
    "total": 1,
    "present": 1,
    "absent": 0,
    "late": 1,
    "overtime": 0
  },
  "nextCursor": null
}
```

---

### GET /reports/export
Genera reporte .xlsx y retorna URL prefirmada de S3.  
**Requiere:** `role: admin`

**Query params:** mismos filtros que `GET /reports`

**Response 200**
```json
{
  "url": "https://gotest-reports.s3.amazonaws.com/exports/reporte-2026-04.xlsx?X-Amz-Signature=...",
  "expiresAt": "2026-04-29T21:49:00Z",
  "filename": "reporte_casa_matriz_2026-04.xlsx"
}
```

---

## Errores comunes

| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | `VALIDATION_ERROR` | Payload inválido |
| 401 | `UNAUTHORIZED` | JWT ausente o inválido |
| 403 | `FORBIDDEN` | Sin permisos para el recurso |
| 404 | `NOT_FOUND` | Recurso no existe |
| 409 | `DUPLICATE_PUNCH` | Marcación duplicada |
| 422 | `OUTSIDE_GEOFENCE` | Fuera del radio permitido |
| 429 | `RATE_LIMITED` | Demasiadas peticiones |
| 500 | `INTERNAL_ERROR` | Error del servidor |

---

## Notas de arquitectura AWS

- **API Gateway** → HTTP API (v2) con JWT Authorizer apuntando a Cognito o Lambda custom auth
- **Lambda** → Node 20, 512 MB, timeout 10s (punches/auth), 30s (reports/export)
- **DynamoDB** → Tabla `punches` con PK=`userId` SK=`timestamp`, GSI por `siteId+date`
- **S3** → Bucket `gotest-reports`, lifecycle 24h para archivos de exportación
- **CloudWatch** → Alarmas en error rate >1% y latencia p99 >2s

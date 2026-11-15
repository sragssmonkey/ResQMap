# ResQMap frontend

React + Vite frontend starter for the ResQMap Django REST Framework backend.

## Requirements
- Node.js 18+
- Django backend running at `http://127.0.0.1:8000`

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, copy the environment file with:

```powershell
Copy-Item .env.example .env
```

Open the Vite URL shown in the terminal (normally http://localhost:5173).

## Backend endpoints used
- `POST /api/auth/login/` — SimpleJWT token obtain pair
- `GET /api/auth/profile/` — authenticated profile
- `POST /api/auth/register/` — survivor registration

The frontend stores JWT tokens in `sessionStorage` for this development starter. For production, prefer secure, HttpOnly cookie-based token handling and HTTPS.

## Role routing
- `SURVIVOR` → `/survivor`
- `RESCUE_TEAM` or `ADMIN` → `/rescue`

Public registration intentionally creates survivor accounts only. Rescue-team accounts must be provisioned/approved by an administrator.

## Not connected yet
The dashboard pages currently show honest empty states because disaster, reports, relief-camp, and movement APIs have not been built in the backend yet. The report form and operational management workflows will be connected after those endpoints exist.

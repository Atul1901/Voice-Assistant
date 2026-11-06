# Retailer AI Assistant — Stage 1

A starter full-stack FMCG retailer assistant prototype. The frontend is React, Vite and TypeScript; the backend is a modular FastAPI app with a health endpoint. AI responses, browser voice recognition, conversation persistence and order integrations are intentionally not implemented in this stage.

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+

## Run the backend

From the project root in PowerShell, create and activate a virtual environment:

```powershell
cd server
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 5000
```

If PowerShell blocks activation scripts for this terminal, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`, then activate again. The API is at `http://127.0.0.1:5000`; interactive API docs are at `http://127.0.0.1:5000/docs`.

In a second terminal, check health:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

Expected response:

```json
{"status":"healthy","service":"retailer-ai-assistant-api"}
```

## Run the frontend

In another terminal from the project root:

```powershell
cd client
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). Create a production build with `npm run build` from `client`.

## Important files

- `client/src/App.tsx` — dashboard, navigation, conversation composer and summary placeholder. Messages are local UI state only; no AI service is called.
- `client/src/styles.css` — responsive dashboard styling.
- `client/src/main.tsx` — React entry point; mounts the app and stylesheet.
- `client/index.html` — browser document and page metadata.
- `client/vite.config.ts` — Vite and React development configuration.
- `client/package.json` — frontend scripts and dependencies.
- `server/app/main.py` — creates the FastAPI application, configures CORS and includes routers.
- `server/app/routes/health.py` — defines `GET /api/health`.
- `server/app/services/health_service.py` — health logic separate from HTTP handling.
- `server/app/data/` — reserved for JSON data and storage code in a later stage.
- `server/requirements.txt` — Python backend dependencies.

## Stage 1 notes

The microphone button is a visual placeholder and does not request microphone access. The start button updates local interface state only. No OpenAI API key or external service is required.

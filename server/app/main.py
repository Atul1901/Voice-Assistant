"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import health

app = FastAPI(title="Retailer AI Assistant API", description="Stage 1 API for the FMCG retailer assistant prototype.", version="0.1.0")

# Vite's local development origin. Add other frontend origins here as needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")

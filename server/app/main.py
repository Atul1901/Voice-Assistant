"""FastAPI application entry point."""
import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import health

app = FastAPI(title="Retailer AI Assistant API", description="Stage 1 API for the FMCG retailer assistant prototype.", version="0.1.0")

@app.get("/api/message")
def get_message():
    return {
        "message": "Hello from Python Backend!"
    }


@app.get("/api/products")
def get_products():
    products_file = Path(__file__).parent / "data" / "products.json"

    with open(products_file, "r", encoding="utf-8") as file:
        products = json.load(file)

    return {
        "total": len(products),
        "products": products
    }

# Vite's local development origin. Add other frontend origins here as needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")

"""FastAPI application entry point."""
import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query
from fastapi import HTTPException

from app.routes import ai, conversations, health

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

@app.get("/api/products/search")
def search_products(query: str = Query(..., min_length=1)):
    products_file = Path(__file__).parent / "data" / "products.json"

    with open(products_file, "r", encoding="utf-8") as file:
        products = json.load(file)

    search_term = query.lower()

    results = [
        product for product in products
        if search_term in product["name"].lower()
        or search_term in product["brand"].lower()
        or search_term in product["category"].lower()
    ]

    return {
        "query": query,
        "total": len(results),
        "products": results
    }

@app.get("/api/products/{product_id}/availability")
def check_product_availability(product_id: str):
    products_file = Path(__file__).parent / "data" / "products.json"

    with open(products_file, "r", encoding="utf-8") as file:
        products = json.load(file)

    product = next(
        (item for item in products if item["id"] == product_id),
        None
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "product_name": product["name"],
        "available": product["stock"] > 0,
        "stock": product["stock"],
        "unit": product["unit"],
        "price": product["price"],
        "scheme": product["scheme"]
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
app.include_router(conversations.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

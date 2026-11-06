const API_BASE_URL = "http://localhost:5000";

export async function getBackendMessage() {
  const response = await fetch(`${API_BASE_URL}/api/message`);

  if (!response.ok) {
    throw new Error("Failed to connect to backend");
  }

  return response.json();
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  pack_size: string;
  price: number;
  stock: number;
  unit: string;
  scheme: string;
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/api/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();

  return data.products;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/products/search?query=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to search products");
  }

  const data = await response.json();

  return data.products;
}

export interface ProductAvailability {
  product_name: string;
  available: boolean;
  stock: number;
  unit: string;
  price: number;
  scheme: string;
}

export async function checkProductAvailability(
  productId: string,
): Promise<ProductAvailability> {
  const response = await fetch(
    `${API_BASE_URL}/api/products/${productId}/availability`,
  );

  if (!response.ok) {
    throw new Error("Failed to check product availability");
  }

  return response.json();
}

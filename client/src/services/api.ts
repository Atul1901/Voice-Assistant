const API_BASE_URL = "http://localhost:5000";

export type MessageRole = "user" | "assistant";

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ConversationMessage[];
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "The request could not be completed. Please try again.";
    try {
      const errorBody: { detail?: string } = await response.json();
      if (errorBody.detail) detail = errorBody.detail;
    } catch {
      // Keep the default message when the response does not contain JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export async function listConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}/api/conversations`);
  return readResponse<Conversation[]>(response);
}

export async function createConversation(): Promise<Conversation> {
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: "POST",
  });
  return readResponse<Conversation>(response);
}

export async function getConversation(
  conversationId: string,
): Promise<Conversation> {
  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${encodeURIComponent(conversationId)}`,
  );
  return readResponse<Conversation>(response);
}

export async function saveConversationMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
): Promise<Conversation> {
  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content }),
    },
  );
  return readResponse<Conversation>(response);
}

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

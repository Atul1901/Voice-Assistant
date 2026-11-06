import { useState, type FormEvent } from "react";
import type { Product } from "../services/api";
import { searchProducts } from "../services/api";

interface ProductListProps {
  products: Product[];
  error?: string;
}

export function ProductList({ products, error }: ProductListProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      setSearchResults(null);
      setSearchError("");
      return;
    }

    try {
      setLoading(true);
      setSearchError("");

      const results = await searchProducts(query);
      setSearchResults(results);
    } catch {
      setSearchError("Unable to search products. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const displayedProducts = searchResults ?? products;

  return (
    <section>
      <h2>Product Catalogue</h2>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by product, brand or category..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>

        <button
          type="button"
          onClick={() => {
            setQuery("");
            setSearchResults(null);
            setSearchError("");
          }}
        >
          Clear
        </button>
      </form>

      {error && <p>{error}</p>}
      {searchError && <p>{searchError}</p>}

      {!error && (
        <>
          <p>{displayedProducts.length} products found</p>

          {displayedProducts.length === 0 ? (
            <p>No matching products found.</p>
          ) : (
            displayedProducts.map((product) => (
              <div key={product.id}>
                <h3>{product.name}</h3>
                <p>Brand: {product.brand}</p>
                <p>Price: ₹{product.price}</p>
                <p>Available stock: {product.stock}</p>
                <p>Offer: {product.scheme}</p>
              </div>
            ))
          )}
        </>
      )}
    </section>
  );
}

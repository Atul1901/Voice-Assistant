import { useState, type FormEvent } from "react";
import type { Product, ProductAvailability } from "../services/api";
import { searchProducts, checkProductAvailability } from "../services/api";
interface ProductListProps {
  products: Product[];
  error?: string;
}

export function ProductList({ products, error }: ProductListProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [availability, setAvailability] = useState<{
    productId: string;
    result: ProductAvailability;
  } | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

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

  async function handleAvailability(productId: string) {
    try {
      setAvailabilityLoading(productId);
      setAvailabilityError("");
      setAvailability(null);

      const result = await checkProductAvailability(productId);
      setAvailability({ productId, result });
    } catch {
      setAvailabilityError(
        "We couldn't check availability right now. Please try again.",
      );
    } finally {
      setAvailabilityLoading("");
    }
  }
  const displayedProducts = searchResults ?? products;

  return (
    <section className="product-catalogue" aria-labelledby="product-catalogue-title">
      <div className="product-catalogue-heading">
        <div>
          <p className="section-kicker">PRODUCTS AND OFFERS</p>
          <h2 id="product-catalogue-title">Product catalogue</h2>
        </div>
        <span className="catalogue-count">{displayedProducts.length} products</span>
      </div>

      <form className="product-search" onSubmit={handleSearch}>
        <input
          type="text"
          aria-label="Search products"
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

      {error && <p className="catalogue-error" role="alert">{error}</p>}
      {searchError && <p className="catalogue-error" role="alert">{searchError}</p>}
      {availabilityError && (
        <p className="catalogue-error" role="alert">{availabilityError}</p>
      )}

      {!error && (
        <>
          {displayedProducts.length === 0 ? (
            <p className="catalogue-empty">No matching products found.</p>
          ) : (
            <div className="product-grid">
              {displayedProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-card-top">
                    <span className="product-category">{product.category}</span>
                    <span className="product-pack">{product.pack_size}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <p className="product-brand">{product.brand}</p>
                  <div className="product-facts">
                    <span><strong>Rs {product.price}</strong> / {product.unit}</span>
                    <span>{product.stock} in stock</span>
                  </div>
                  <p className="product-offer"><strong>Offer</strong> {product.scheme}</p>
                  <button
                    className="availability-button"
                    onClick={() => handleAvailability(product.id)}
                    disabled={availabilityLoading === product.id}
                  >
                    {availabilityLoading === product.id
                      ? "Checking availability..."
                      : "Check Availability"}
                  </button>
                  {availability?.productId === product.id && (
                    <div className="availability-result" role="status">
                      <strong>
                        {availability.result.available
                          ? "Available"
                          : "Currently unavailable"}
                      </strong>
                      <span>
                        {availability.result.stock} {availability.result.unit} in stock
                      </span>
                      <span>Price: Rs {availability.result.price}</span>
                      <span>Offer: {availability.result.scheme}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import PackageCard from "../components/PackageCard";

// Shared input styling so every text field on this page looks identical
const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ocean";

function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [interpretedFilters, setInterpretedFilters] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/api/packages", {
          params: {
            destination: searchParams.get("destination") || undefined,
            maxPrice: searchParams.get("maxPrice") || undefined,
          },
        });
        setPackages(response.data.packages);
      } catch (error) {
        console.log("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setInterpretedFilters(null);
    const params = {};
    if (destination) params.destination = destination;
    if (maxPrice) params.maxPrice = maxPrice;
    setSearchParams(params);
  };

  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/ai/search", {
        query: aiQuery,
      });
      setPackages(response.data.packages);
      setInterpretedFilters(response.data.interpretedFilters);
    } catch (error) {
      console.log("Error running AI search:", error);
    } finally {
      setAiLoading(false);
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* AI natural-language search bar — the primary, flagship action on
            this page, so it gets the solid ocean-dark button */}
        <form onSubmit={handleAiSearch} className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Try: beach trip under $1000"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            className={`${inputClass} min-w-[260px] flex-1`}
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="whitespace-nowrap rounded-md bg-ocean-dark px-5 py-2.5 font-semibold text-white hover:bg-ocean disabled:opacity-50"
          >
            {aiLoading ? "Thinking..." : "AI Search"}
          </button>
        </form>

        {interpretedFilters && (
          <p className="mt-2 text-sm text-ink/60">
            {interpretedFilters.fallback
              ? "AI search unavailable — showing keyword matches instead."
              : `Showing results for: ${
                  [
                    interpretedFilters.destination,
                    interpretedFilters.maxPrice ? `under $${interpretedFilters.maxPrice}` : null,
                    ...(interpretedFilters.tags || []),
                  ]
                    .filter(Boolean)
                    .join(", ") || "everything"
                }`}
          </p>
        )}

        <hr className="my-6 border-line" />

        {/* Manual filters — secondary, so an outlined button instead of a
            solid one, to visually rank it below the AI search above */}
        <form onSubmit={handleApplyFilters} className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={`${inputClass} sm:w-48`}
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={`${inputClass} sm:w-40`}
          />
          <button
            type="submit"
            className="rounded-md border border-line bg-white px-5 py-2.5 font-semibold text-ink hover:border-ocean"
          >
            Apply
          </button>
        </form>

        <div className="mt-8">
          {loading && <p className="text-ink/60">Loading packages...</p>}

          {!loading && packages.length === 0 && (
            <p className="text-ink/60">No packages match your search.</p>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                onClick={() => navigate(`/packages/${pkg._id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Browse;
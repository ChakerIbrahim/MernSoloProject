import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Container, TextField, Button, Typography, Divider } from "@mui/material";
import Header from "../components/Header";
import PackageCard from "../components/PackageCard";

function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local input fields, seeded from whatever's already in the URL when the page loads
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // --- New state for the AI search bar ---
  // What the user typed into the natural-language box
  const [aiQuery, setAiQuery] = useState("");
  // Separate loading flag just for the AI button, so we can show "Thinking..."
  // on the button itself without touching the shared "loading" grid message
  const [aiLoading, setAiLoading] = useState(false);
  // Holds whatever the AI understood from the last query, so we can show
  // the user feedback like "Searching for: Thailand, under $1000"
  const [interpretedFilters, setInterpretedFilters] = useState(null);

  // Runs on first load, and again every time the URL's filters change
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

  // Writing to the URL here is what triggers the useEffect above to re-fetch
  const handleApplyFilters = (e) => {
    e.preventDefault();
    // Clear any leftover AI feedback text — we're back to manual filtering now
    setInterpretedFilters(null);
    const params = {};
    if (destination) params.destination = destination;
    if (maxPrice) params.maxPrice = maxPrice;
    setSearchParams(params);
  };

  // Handles the natural-language search bar. Unlike the manual filters above,
  // this does NOT touch the URL — it calls our AI endpoint directly and sets
  // the results straight into state
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

      <Container sx={{ py: 4 }}>
        {/* AI natural-language search bar */}
        <Box
          component="form"
          onSubmit={handleAiSearch}
          sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}
        >
          <TextField
            label="Try: beach trip under $1000"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 260 }}
          />
          <Button type="submit" variant="contained" disabled={aiLoading}>
            {aiLoading ? "Thinking..." : "AI Search"}
          </Button>
        </Box>

        {/* Feedback showing what the AI understood, or that it fell back */}
        {interpretedFilters && (
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
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
          </Typography>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Existing manual filter form, unchanged */}
        <Box
          component="form"
          onSubmit={handleApplyFilters}
          sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}
        >
          <TextField
            label="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <TextField
            label="Max price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          <Button type="submit" variant="contained">
            Apply
          </Button>
        </Box>

        {loading && <Typography>Loading packages...</Typography>}

        {!loading && packages.length === 0 && (
          <Typography>No packages match your search.</Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 3,
          }}
        >
          {packages.map((pkg) => (
            <PackageCard
              key={pkg._id}
              pkg={pkg}
              onClick={() => navigate(`/packages/${pkg._id}`)}
            />
          ))}
        </Box>
      </Container>
    </>
  );
}

export default Browse;
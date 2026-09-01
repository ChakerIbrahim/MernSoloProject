import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Container, TextField, Button, Typography } from "@mui/material";
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
    const params = {};
    if (destination) params.destination = destination;
    if (maxPrice) params.maxPrice = maxPrice;
    setSearchParams(params);
  };

  return (
    <>
      <Header />

      <Container sx={{ py: 4 }}>
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
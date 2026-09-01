import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from "@mui/material";
import Header from "../components/Header";

// A small hardcoded list for now — real "popular destinations" logic can come later
const popularDestinations = ["Thailand", "Bali", "Morocco", "Italy"];

function Landing() {
  // Tracks exactly what the user has typed into the search box
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Runs when the search form is submitted (Enter key or clicking Search)
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/browse?destination=${query}`);
  };

  // Clicking a destination card searches for it directly, skipping typing
  const handleDestinationClick = (destination) => {
    navigate(`/browse?destination=${destination}`);
  };

  return (
    <>
      <Header />

      <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
        <Typography variant="h3" gutterBottom>
          Find your next trip
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Compare packages from real travel agencies, all in one place.
        </Typography>

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: "flex", gap: 1, maxWidth: 480, mx: "auto" }}
        >
          <TextField
            fullWidth
            placeholder="Where do you want to go?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" variant="contained">
            Search
          </Button>
        </Box>
      </Box>

      <Container sx={{ pb: 8 }}>
        <Typography variant="h6" gutterBottom>
          Popular destinations
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 2,
          }}
        >
          {popularDestinations.map((destination) => (
            <Card key={destination}>
              <CardActionArea onClick={() => handleDestinationClick(destination)}>
                <CardMedia sx={{ height: 100, bgcolor: "grey.200" }} />
                <CardContent>
                  <Typography variant="subtitle1">{destination}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Container>
    </>
  );
}

export default Landing;
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Box, Container, Typography, Chip } from "@mui/material";
import Header from "../components/Header";

function PackageDetail() {
  // Pulls the actual ID out of the URL, e.g. "/packages/6a95..." -> id = "6a95..."
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Runs on first load, and again if the URL's id ever changes
  useEffect(() => {
    const fetchPackage = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/packages/${id}`);
        setPkg(response.data.package);
      } catch (error) {
        console.log("Error fetching package:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  // Early returns: if we're still loading, or nothing came back, show that
  // instead of trying to render a page around data that doesn't exist yet
  if (loading) {
    return (
      <>
        <Header />
        <Container sx={{ py: 4 }}>
          <Typography>Loading package...</Typography>
        </Container>
      </>
    );
  }

  if (!pkg) {
    return (
      <>
        <Header />
        <Container sx={{ py: 4 }}>
          <Typography>Package not found.</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <Box sx={{ flex: 2, minWidth: 280 }}>
            <Box sx={{ height: 260, bgcolor: "grey.200", borderRadius: 1, mb: 2 }} />

            <Typography variant="h4">{pkg.title}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {pkg.destination} · {pkg.durationDays} days
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {pkg.agency?.agencyName} — {pkg.agency?.agencyDescription}
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              {pkg.description}
            </Typography>

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Includes
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {pkg.includes.map((item) => (
                <Chip key={item} label={item} />
              ))}
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                ${pkg.price}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {pkg.spotsAvailable} spots left
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Booking and chat with the agency are coming in a later piece.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default PackageDetail;
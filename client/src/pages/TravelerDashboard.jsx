import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Container, Typography, Chip } from "@mui/material";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

// Maps each inquiry status to a MUI Chip color, so pending/confirmed/declined
// are visually distinct at a glance without reading the text
const statusColors = {
  pending: "warning",
  confirmed: "success",
  declined: "error",
};

function TravelerDashboard() {
  // authLoading tells us whether AuthContext has finished checking the
  // session cookie yet — we need to wait for that before trusting "user"
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't do anything until AuthContext has resolved who's logged in —
    // otherwise this runs once with user still null on first render
    if (authLoading) return;

    // Not logged in at all — send them to login
    if (!user) {
      navigate("/login");
      return;
    }

    // Logged in, but as an agency — this dashboard isn't for them
    if (user.role !== "traveler") {
      navigate("/");
      return;
    }

    const fetchInquiries = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/inquiries",
          { params: { traveler: user._id } },
        );
        setInquiries(response.data.inquiries);
      } catch (error) {
        console.log("Error fetching inquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [authLoading, user, navigate]);

  return (
    <>
      <Header />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          My Inquiries
        </Typography>

        {loading && <Typography>Loading your inquiries...</Typography>}

        {!loading && inquiries.length === 0 && (
          <Typography>
            You haven't inquired about any packages yet. Browse packages to
            get started.
          </Typography>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {inquiries.map((inquiry) => (
            <Box
              key={inquiry._id}
              onClick={() => navigate(`/inquiries/${inquiry._id}`)}
              sx={{
                p: 2,
                border: "1px solid #ddd",
                borderRadius: 2,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                "&:hover": { backgroundColor: "#fafafa" },
              }}
            >
              <Box>
                {/* Optional chaining here in case a package was ever deleted
                    after the inquiry was made — avoids a crash on null */}
                <Typography variant="subtitle1">
                  {inquiry.package?.title || "Package no longer available"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {inquiry.package?.destination} — {inquiry.agency?.agencyName}
                </Typography>
              </Box>
              <Chip
                label={
                  inquiry.status.charAt(0).toUpperCase() +
                  inquiry.status.slice(1)
                }
                color={statusColors[inquiry.status] || "default"}
                size="small"
              />
            </Box>
          ))}
        </Box>
      </Container>
    </>
  );
}

export default TravelerDashboard;
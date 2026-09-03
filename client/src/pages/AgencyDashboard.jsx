import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Container, Typography, Chip, Badge } from "@mui/material";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

const statusColors = {
  pending: "warning",
  confirmed: "success",
  declined: "error",
};

function AgencyDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Counts inquiries that have arrived live via Socket.IO since this page
  // loaded — this number is what drives the notification badge
  const [newInquiryCount, setNewInquiryCount] = useState(0);

  // Guard + initial data fetch — same pattern as TravelerDashboard, just
  // checking for the "agency" role instead of "traveler"
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "agency") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Fire both requests at once instead of one after the other —
        // they don't depend on each other, so no reason to wait in series
        const [packagesRes, inquiriesRes] = await Promise.all([
          axios.get("http://localhost:8000/api/packages", {
            params: { agency: user._id },
          }),
          axios.get("http://localhost:8000/api/inquiries", {
            params: { agency: user._id },
          }),
        ]);
        setPackages(packagesRes.data.packages);
        setInquiries(inquiriesRes.data.inquiries);
      } catch (error) {
        console.log("Error fetching agency dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user, navigate]);

  // Separate effect just for the socket connection, so it only runs once
  // we actually know who the logged-in agency is
  useEffect(() => {
    if (!user) return;

    // Tell the server this socket belongs to this agency, so new_inquiry
    // events can be targeted to just this room instead of broadcast to all
    socket.emit("join_agency", user._id);

    const handleNewInquiry = (inquiry) => {
      // Prepend so the newest inquiry shows up first, and bump the badge —
      // no re-fetch needed, this is the live part of "live notification"
      setInquiries((prev) => [inquiry, ...prev]);
      setNewInquiryCount((prev) => prev + 1);
    };

    socket.on("new_inquiry", handleNewInquiry);

    return () => {
      socket.off("new_inquiry", handleNewInquiry);
    };
  }, [user]);

  return (
    <>
      <Header />
      <Container sx={{ py: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
              My Packages
            </Typography>

            {loading && <Typography>Loading...</Typography>}

            {!loading && packages.length === 0 && (
              <Typography>You haven't listed any packages yet.</Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {packages.map((pkg) => (
                <Box
                  key={pkg._id}
                  onClick={() => navigate(`/packages/${pkg._id}`)}
                  sx={{
                    p: 2,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#fafafa" },
                  }}
                >
                  <Typography variant="subtitle1">{pkg.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pkg.destination} — ${pkg.price} — {pkg.spotsAvailable} spots left
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            {/* Badge wraps the heading itself — MUI positions the little
                red dot/number in the corner of whatever it wraps. It's
                invisible until newInquiryCount is actually above 0 */}
            <Badge
              badgeContent={newInquiryCount}
              color="error"
              invisible={newInquiryCount === 0}
              sx={{ mb: 2 }}
            >
              <Typography variant="h5">Incoming Inquiries</Typography>
            </Badge>

            {loading && <Typography>Loading...</Typography>}

            {!loading && inquiries.length === 0 && (
              <Typography>No inquiries yet.</Typography>
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
                    <Typography variant="subtitle1">
                      {inquiry.traveler?.firstName || "Traveler"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {inquiry.package?.title}
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
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default AgencyDashboard;
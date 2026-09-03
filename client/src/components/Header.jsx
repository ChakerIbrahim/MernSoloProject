import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}
        >
          SafeTravel
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button component={Link} to="/browse" color="inherit">
            Browse
          </Button>

          {loading ? null : user ? (
            <>
              {user.role === "traveler" && (
                <Button component={Link} to="/dashboard/traveler" color="inherit">
                  My Inquiries
                </Button>
              )}

              {user.role === "agency" && (
                <Button component={Link} to="/dashboard/agency" color="inherit">
                  Dashboard
                </Button>
              )}

              <Typography variant="body2">
                Logged in as {user.firstName}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button component={Link} to="/login" color="inherit">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
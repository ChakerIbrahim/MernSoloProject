import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

function Header() {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* component={Link} makes this look like MUI text but navigate like a real link */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}
        >
          SafeTravel
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button component={Link} to="/browse" color="inherit">
            Browse
          </Button>
          <Button component={Link} to="/login" color="inherit">
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
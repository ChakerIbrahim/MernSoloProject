import { Card, CardActionArea, CardMedia, CardContent, Typography } from "@mui/material";

// pkg is a full package object from the API. onClick is passed in by whichever
// page uses this card, so PackageCard doesn't need to know about routing itself
function PackageCard({ pkg, onClick }) {
  return (
    <Card>
      <CardActionArea onClick={onClick}>
        <CardMedia sx={{ height: 140, bgcolor: "grey.200" }} />
        <CardContent>
          <Typography variant="subtitle1">{pkg.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {pkg.destination} · {pkg.durationDays} days
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pkg.agency?.agencyName || pkg.agency?.firstName}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            ${pkg.price}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default PackageCard;
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import PackageCard from "../components/PackageCard";
import StarRating from "../components/StarRating";

function AgencyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agency, setAgency] = useState(null);
  const [packages, setPackages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [agencyRes, packagesRes, reviewsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/agencies/${id}`),
          axios.get("http://localhost:8000/api/packages", { params: { agency: id } }),
          axios.get("http://localhost:8000/api/reviews", { params: { agency: id } }),
        ]);
        setAgency(agencyRes.data.agency);
        setPackages(packagesRes.data.packages);
        setReviews(reviewsRes.data.reviews);
      } catch (error) {
        console.log("Error fetching agency profile:", error);
        setAgency(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Computed on the frontend from whatever reviews came back — no need for
  // a separate backend aggregation endpoint for something this simple
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  if (loading) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-ink/60">Loading agency...</p>
        </div>
      </>
    );
  }

  if (!agency) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-ink/60">Agency not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center gap-4">
          {agency.agencyLogo ? (
            <img
              src={agency.agencyLogo}
              alt={agency.agencyName}
              className="h-16 w-16 rounded-full border border-line object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ocean-dark text-xl font-bold text-white">
              {agency.agencyName?.charAt(0) || agency.firstName?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-ink">{agency.agencyName}</h1>
            <p className="text-sm text-ink/60">Run by {agency.firstName}</p>
            {averageRating && (
              <div className="mt-1 flex items-center gap-2">
                <StarRating value={Math.round(averageRating)} size="text-base" />
                <span className="text-sm text-ink/60">
                  {averageRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>
        </div>

        {agency.agencyDescription && (
          <p className="mb-8 max-w-2xl text-ink">{agency.agencyDescription}</p>
        )}

        <h2 className="mb-4 text-lg font-semibold text-ink">
          Packages from {agency.agencyName}
        </h2>

        {packages.length === 0 && (
          <p className="mb-8 text-ink/60">This agency hasn't listed any packages yet.</p>
        )}

        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg._id}
              pkg={pkg}
              onClick={() => navigate(`/packages/${pkg._id}`)}
            />
          ))}
        </div>

        <h2 className="mb-4 text-lg font-semibold text-ink">Reviews</h2>

        {reviews.length === 0 && <p className="text-ink/60">No reviews yet.</p>}

        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-lg border border-line bg-white p-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-medium text-ink">
                  {review.traveler?.firstName || "Traveler"}
                </p>
                <StarRating value={review.rating} size="text-sm" />
              </div>
              {review.package?.title && (
                <p className="mb-1 text-xs text-ink/50">Booked: {review.package.title}</p>
              )}
              {review.comment && <p className="text-sm text-ink/70">{review.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AgencyProfile;
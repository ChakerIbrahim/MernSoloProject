import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";

const statusStyles = {
  pending: "bg-sand/20 text-sand-dark",
  confirmed: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
};

function TravelerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tracks which inquiry's review form is currently open, and which ones
  // have already been reviewed THIS SESSION (a simple guard against
  // accidental double-submits, not a full database-backed check)
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewedIds, setReviewedIds] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

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

  const openReviewForm = (inquiryId) => {
    setReviewingId(inquiryId);
    setReviewRating(0);
    setReviewComment("");
    setReviewError("");
  };

  const handleSubmitReview = async (e, inquiry) => {
    e.preventDefault();
    setReviewError("");

    if (reviewRating === 0) {
      setReviewError("Pick a star rating first.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/reviews",
        {
          agency: inquiry.agency._id,
          package: inquiry.package?._id,
          rating: reviewRating,
          comment: reviewComment,
        },
        { withCredentials: true },
      );
      setReviewedIds((prev) => [...prev, inquiry._id]);
      setReviewingId(null);
    } catch (error) {
      setReviewError(error.response?.data?.message || "Failed to submit review.");
    }
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-ink">My Inquiries</h1>

        {loading && <p className="text-ink/60">Loading your inquiries...</p>}

        {!loading && inquiries.length === 0 && (
          <p className="text-ink/60">
            You haven't inquired about any packages yet. Browse packages to get started.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} className="rounded-lg border border-line bg-white p-4">
              <div
                onClick={() => navigate(`/inquiries/${inquiry._id}`)}
                className="flex cursor-pointer items-center justify-between gap-2"
              >
                <div>
                  <p className="font-medium text-ink">
                    {inquiry.package?.title || "Package no longer available"}
                  </p>
                  <p className="text-sm text-ink/60">
                    {inquiry.package?.destination} — {inquiry.agency?.agencyName}
                  </p>
                </div>
                <span
                  className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                    statusStyles[inquiry.status] || "bg-line text-ink"
                  }`}
                >
                  {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                </span>
              </div>

              {/* Review option only appears once confirmed, and hides after
                  a successful submit for the rest of this session */}
              {inquiry.status === "confirmed" && !reviewedIds.includes(inquiry._id) && (
                <div className="mt-3 border-t border-line pt-3">
                  {reviewingId === inquiry._id ? (
                    <form
                      onSubmit={(e) => handleSubmitReview(e, inquiry)}
                      className="flex flex-col gap-2"
                    >
                      {reviewError && (
                        <p className="text-sm font-medium text-red-600">{reviewError}</p>
                      )}
                      <StarRating value={reviewRating} onChange={setReviewRating} />
                      <textarea
                        placeholder="How was your trip? (optional)"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={2}
                        className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ocean"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="rounded-md bg-ocean-dark px-3 py-1.5 text-sm font-semibold text-white hover:bg-ocean"
                        >
                          Submit review
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewingId(null)}
                          className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:border-ocean"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => openReviewForm(inquiry._id)}
                      className="text-sm font-semibold text-ocean-dark hover:underline"
                    >
                      Leave a review
                    </button>
                  )}
                </div>
              )}

              {reviewedIds.includes(inquiry._id) && (
                <p className="mt-3 border-t border-line pt-3 text-sm text-ink/60">
                  Thanks for your review!
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default TravelerDashboard;
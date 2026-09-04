import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

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
            <div
              key={inquiry._id}
              onClick={() => navigate(`/inquiries/${inquiry._id}`)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-line bg-white p-4 hover:border-ocean"
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
          ))}
        </div>
      </div>
    </>
  );
}

export default TravelerDashboard;
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import { getDestinationImage } from "../utils/destinationImages";

function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookError, setBookError] = useState("");

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

  useEffect(() => {
    const handleSpotsUpdate = (data) => {
      if (data.packageId === id) {
        setPkg((prev) => (prev ? { ...prev, spotsAvailable: data.spotsAvailable } : prev));
      }
    };

    socket.on("spots_updated", handleSpotsUpdate);

    return () => {
      socket.off("spots_updated", handleSpotsUpdate);
    };
  }, [id]);

  useEffect(() => {
    const handleBookFailed = (data) => {
      setBookError(data.message);
    };

    socket.on("book_failed", handleBookFailed);

    return () => {
      socket.off("book_failed", handleBookFailed);
    };
  }, []);

  const handleRequestToBook = async () => {
    setBookError("");
    try {
      const existing = await axios.get("http://localhost:8000/api/inquiries", {
        params: { traveler: user._id, package: pkg._id },
      });

      if (existing.data.inquiries.length > 0) {
        navigate(`/inquiries/${existing.data.inquiries[0]._id}`);
        return;
      }

      const response = await axios.post("http://localhost:8000/api/inquiries", {
        traveler: user._id,
        agency: pkg.agency._id,
        package: pkg._id,
      });

      socket.emit("book_request", pkg._id);

      navigate(`/inquiries/${response.data.inquiry._id}`);
    } catch (error) {
      console.log("Error requesting to book:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-ink/60">Loading package...</p>
        </div>
      </>
    );
  }

  if (!pkg) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-ink/60">Package not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap gap-8">
          <div className="min-w-[280px] flex-[2]">
            <img
              src={getDestinationImage(pkg.destination)}
              alt={pkg.destination}
              className="mb-4 h-64 w-full rounded-lg object-cover"
            />

            <h1 className="text-3xl font-bold text-ink">{pkg.title}</h1>
            <p className="mt-1 text-ink/60">
              {pkg.destination} · {pkg.durationDays} days
            </p>
            <p className="mt-1 text-sm text-ink/60">
              {pkg.agency?.agencyName} — {pkg.agency?.agencyDescription}
            </p>

            <p className="mt-4 text-ink">{pkg.description}</p>

            <h2 className="mb-2 mt-6 font-semibold text-ink">Includes</h2>
            <div className="flex flex-wrap gap-2">
              {pkg.includes.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-line bg-white px-3 py-1 text-sm text-ink"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="min-w-[240px] flex-1">
            <div className="rounded-lg border border-sand bg-sand/10 p-5">
              <p className="text-2xl font-bold text-ink">${pkg.price}</p>
              <p className="mb-4 text-sm text-ink/60">{pkg.spotsAvailable} spots left</p>

              {bookError && (
                <p className="mb-2 text-sm font-medium text-red-600">{bookError}</p>
              )}

              {user && user.role === "traveler" ? (
                <button
                  onClick={handleRequestToBook}
                  className="w-full rounded-md bg-ocean-dark px-4 py-2.5 font-semibold text-white hover:bg-ocean"
                >
                  Request to book
                </button>
              ) : (
                <p className="text-sm text-ink/60">
                  {user
                    ? "Only travelers can request to book."
                    : "Log in as a traveler to request to book."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PackageDetail;
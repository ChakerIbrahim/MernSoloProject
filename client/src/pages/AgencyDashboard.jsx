import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import PackageForm from "../components/PackageForm";

const statusStyles = {
  pending: "bg-sand/20 text-sand-dark",
  confirmed: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
};

function AgencyDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newInquiryCount, setNewInquiryCount] = useState(0);

  const [showCreateForm, setShowCreateForm] = useState(false);
  // Holds the _id of whichever package is currently being edited, or null
  // if nothing is — only one package can be edited inline at a time
  const [editingPackageId, setEditingPackageId] = useState(null);

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

  useEffect(() => {
    if (!user) return;

    socket.emit("join_agency", user._id);

    const handleNewInquiry = (inquiry) => {
      setInquiries((prev) => [inquiry, ...prev]);
      setNewInquiryCount((prev) => prev + 1);
    };

    socket.on("new_inquiry", handleNewInquiry);

    return () => {
      socket.off("new_inquiry", handleNewInquiry);
    };
  }, [user]);

  const handleUpdateStatus = async (e, inquiryId, status) => {
    e.stopPropagation();
    try {
      const response = await axios.put(
        `http://localhost:8000/api/inquiries/${inquiryId}`,
        { status },
        { withCredentials: true },
      );
      setInquiries((prev) =>
        prev.map((inq) =>
          inq._id === inquiryId ? { ...inq, status: response.data.inquiry.status } : inq,
        ),
      );
    } catch (error) {
      console.log("Error updating inquiry status:", error);
    }
  };

  // Called by PackageForm when creating a brand-new package. Appends the
  // agency ID (PackageForm has no idea what an "agency" even is) before POSTing
  const handleCreatePackage = async (formData) => {
    formData.append("agency", user._id);
    const response = await axios.post("http://localhost:8000/api/packages", formData, {
      withCredentials: true,
    });
    setPackages((prev) => [response.data.package, ...prev]);
    setShowCreateForm(false);
  };

  // Called by PackageForm when editing. packageId comes from the specific
  // package row being edited, bound via closure where this is invoked below
  const handleEditPackage = async (formData, packageId) => {
    const response = await axios.put(
      `http://localhost:8000/api/packages/${packageId}`,
      formData,
      { withCredentials: true },
    );
    setPackages((prev) =>
      prev.map((p) => (p._id === packageId ? response.data.package : p)),
    );
    setEditingPackageId(null);
  };

  const handleDeletePackage = async (e, packageId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this package? This can't be undone.")) return;

    try {
      await axios.delete(`http://localhost:8000/api/packages/${packageId}`, {
        withCredentials: true,
      });
      setPackages((prev) => prev.filter((p) => p._id !== packageId));
    } catch (error) {
      console.log("Error deleting package:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">My Packages</h2>
              <button
                onClick={() => setShowCreateForm((prev) => !prev)}
                className="rounded-md bg-ocean-dark px-3 py-1.5 text-sm font-semibold text-white hover:bg-ocean"
              >
                {showCreateForm ? "Cancel" : "+ Add package"}
              </button>
            </div>

            {showCreateForm && (
              <PackageForm
                key="create"
                submitLabel="Create package"
                onCancel={() => setShowCreateForm(false)}
                onSubmit={handleCreatePackage}
              />
            )}

            {loading && <p className="text-ink/60">Loading...</p>}

            {!loading && packages.length === 0 && (
              <p className="text-ink/60">You haven't listed any packages yet.</p>
            )}

            <div className="flex flex-col gap-3">
              {packages.map((pkg) =>
                editingPackageId === pkg._id ? (
                  <PackageForm
                    key={`edit-${pkg._id}`}
                    initialValues={pkg}
                    submitLabel="Save changes"
                    onCancel={() => setEditingPackageId(null)}
                    onSubmit={(formData) => handleEditPackage(formData, pkg._id)}
                  />
                ) : (
                  <div
                    key={pkg._id}
                    onClick={() => navigate(`/packages/${pkg._id}`)}
                    className="cursor-pointer rounded-lg border border-line bg-white p-4 hover:border-ocean"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-ink">{pkg.title}</p>
                        <p className="text-sm text-ink/60">
                          {pkg.destination} — ${pkg.price} — {pkg.spotsAvailable} spots left
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPackageId(pkg._id);
                          }}
                          className="rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink hover:border-ocean"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDeletePackage(e, pkg._id)}
                          className="rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink hover:border-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <div>
            <div className="relative mb-4 inline-block">
              <h2 className="text-xl font-semibold text-ink">Incoming Inquiries</h2>
              {newInquiryCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {newInquiryCount}
                </span>
              )}
            </div>

            {loading && <p className="text-ink/60">Loading...</p>}

            {!loading && inquiries.length === 0 && (
              <p className="text-ink/60">No inquiries yet.</p>
            )}

            <div className="flex flex-col gap-3">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  onClick={() => navigate(`/inquiries/${inquiry._id}`)}
                  className="cursor-pointer rounded-lg border border-line bg-white p-4 hover:border-ocean"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-ink">
                        {inquiry.traveler?.firstName || "Traveler"}
                      </p>
                      <p className="text-sm text-ink/60">{inquiry.package?.title}</p>
                    </div>
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[inquiry.status] || "bg-line text-ink"
                      }`}
                    >
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </span>
                  </div>

                  {inquiry.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => handleUpdateStatus(e, inquiry._id, "confirmed")}
                        className="rounded-md bg-ocean-dark px-3 py-1.5 text-sm font-semibold text-white hover:bg-ocean"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={(e) => handleUpdateStatus(e, inquiry._id, "declined")}
                        className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:border-red-400 hover:text-red-600"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AgencyDashboard;
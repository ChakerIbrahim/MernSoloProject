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
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-xl font-extrabold tracking-tight text-ocean-dark no-underline"
        >
          SafeTravel
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/browse"
            className="text-sm font-medium text-ink hover:text-ocean-dark"
          >
            Browse
          </Link>

          {loading ? null : user ? (
            <>
              {user.role === "traveler" && (
                <Link
                  to="/dashboard/traveler"
                  className="text-sm font-medium text-ink hover:text-ocean-dark"
                >
                  My inquiries
                </Link>
              )}

              {user.role === "agency" && (
                <Link
                  to="/dashboard/agency"
                  className="text-sm font-medium text-ink hover:text-ocean-dark"
                >
                  Dashboard
                </Link>
              )}

              <span className="text-sm text-ink/60">{user.firstName}</span>

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-ink hover:text-ocean-dark"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-ocean-dark px-4 py-2 text-sm font-semibold text-white hover:bg-ocean"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
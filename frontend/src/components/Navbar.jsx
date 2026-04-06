import { useEffect, useState } from "react";
import { HiArrowRightOnRectangle, HiMiniUserCircle } from "react-icons/hi2";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearStoredAuth, getStoredUser } from "../utils/authStorage";

const navLinkClass = (active) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    active
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-600 hover:bg-white hover:text-slate-900"
  }`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("token"));
      setUser(getStoredUser());
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-[rgba(248,250,252,0.78)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#fb7185)] text-lg font-black text-white shadow-[0_16px_40px_-20px_rgba(244,114,182,0.85)]">
            NM
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
              NightMarathon
            </p>
            <p className="text-base font-semibold text-slate-900">
              Interview Studio
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 p-1 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.65)]">
          {token ? (
            <>
              <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-600 sm:inline-flex">
                <HiMiniUserCircle className="h-4 w-4 text-amber-600" />
                <span className="max-w-32 truncate font-medium text-slate-800">
                  {user?.name || "Profile"}
                </span>
              </div>
              <Link
                to="/dashboard"
                className={navLinkClass(location.pathname.startsWith("/dashboard"))}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
              >
                <HiArrowRightOnRectangle className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={navLinkClass(location.pathname.startsWith("/login"))}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-[linear-gradient(135deg,#111827,#1f2937)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Start Free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

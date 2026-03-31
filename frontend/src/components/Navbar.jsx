import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="border-b border-slate-800 bg-charcoal-950/95 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto p-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="font-bold text-xl text-white">
          Crowdy
        </Link>

        <div className="flex flex-wrap gap-3 items-center">
          {user?.role === "creator" && (
            <>
              <Link to="/dashboard" className="text-sm text-slate-300 hover:text-white transition">
                Dashboard
              </Link>
              <Link to="/tiers" className="text-sm text-slate-300 hover:text-white transition">
                Tiers
              </Link>
              <Link to="/create-campaign" className="text-sm text-slate-300 hover:text-white transition">
                New campaign
              </Link>
              <Link to="/create-post" className="text-sm text-slate-300 hover:text-white transition">
                New post
              </Link>
            </>
          )}

          {user ? (
            <>
              <Link to="/my-subscriptions" className="text-sm text-slate-300 hover:text-white transition">
                My subscriptions
              </Link>
              <Link to="/search" className="text-sm text-slate-300 hover:text-white transition">
                Search
              </Link>
              <Link to="/profile" className="text-sm text-slate-300 hover:text-white transition">
                Profile
              </Link>
              <span className="text-sm text-slate-400">
                {user.email} ({user.role})
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 rounded bg-crowdy-accent text-white text-sm hover:bg-crowdy-accent2 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1 rounded bg-crowdy-accent text-white text-sm hover:bg-crowdy-accent2 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 rounded border border-slate-700 text-slate-200 text-sm hover:border-crowdy-accent hover:text-white transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

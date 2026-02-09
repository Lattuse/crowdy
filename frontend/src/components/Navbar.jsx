import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="border-b bg-white">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          Crowdy
        </Link>

        <div className="flex gap-3 items-center">
          {user?.role === "creator" && (
            <>
              <Link to="/dashboard" className="text-sm hover:underline">
                Dashboard
              </Link>
              <Link to="/tiers" className="text-sm hover:underline">
                Tiers
              </Link>
              <Link to="/create-campaign" className="text-sm hover:underline">
                New campaign
              </Link>
              <Link to="/create-post" className="text-sm hover:underline">
                New post
              </Link>
            </>
          )}

          {user ? (
            <>
              <Link to="/my-subscriptions" className="text-sm hover:underline">
                My subscriptions
              </Link>
              <Link to="/search" className="text-sm hover:underline">
                Search
              </Link>
              <Link to="/profile" className="text-sm hover:underline">
                Profile
              </Link>
              <span className="text-sm text-gray-600">
                {user.email} ({user.role})
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 rounded bg-black text-white text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1 rounded bg-black text-white text-sm"
              >
                Login
              </Link>
              <Link to="/register" className="px-3 py-1 rounded border text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

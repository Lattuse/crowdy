import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./auth/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatorPage from "./pages/CreatorPage";
import Dashboard from "./pages/Dashboard";
import CreateCampaign from "./pages/CreateCampaign";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import PostDetails from "./pages/PostDetails";
import CampaignDetails from "./pages/CampaignDetails";
import RoleGate from "./auth/RoleGate";
import ManageTiers from "./pages/ManageTiers";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";
import MySubscriptions from "./pages/MySubscriptions";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campaign/:id" element={<CampaignDetails />} />
          <Route path="/creator/:id" element={<CreatorPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <RoleGate role="creator">
                <Dashboard />
              </RoleGate>
            }
          />
          <Route
            path="/create-campaign"
            element={
              <RoleGate role="creator">
                <CreateCampaign />
              </RoleGate>
            }
          />
          <Route
            path="/create-post"
            element={
              <RoleGate role="creator">
                <CreatePost />
              </RoleGate>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/post/:id" element={<PostDetails />} />
          <Route
            path="/tiers"
            element={
              <RoleGate role="creator">
                <ManageTiers />
              </RoleGate>
            }
          />

          <Route path="/search" element={<Search />} />

          <Route path="/user/:id" element={<UserProfile />} />

          <Route
            path="/my-subscriptions"
            element={
              <ProtectedRoute>
                <MySubscriptions />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./authContext";
import axios from "axios";

import LandingPage from "./pages/LandingPage";
import HealthProfile from "./pages/HealthProfile";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Dash from "./AdminPanel/pages/Dashboard";
import StreamVideoProvider from "./providers/StreamProvider";

// Axios setup
const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Private Route
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  console.log("🔐 PrivateRoute:", { isLoading, isAuthenticated });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ Authenticated, rendering page");
  return <>{children}</>;
}

// ✅ Main App
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Routes>
          {/* ---------- PUBLIC ROUTES ---------- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          {/* ---------- PROTECTED ROUTES ---------- */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <HealthProfile />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />

          <Route
            path="/admindashboard"
            element={
              <PrivateRoute>
                <Dash />
              </PrivateRoute>
            }
          />

          {/* ---------- STREAM.IO WRAPPED ROUTE ---------- */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {/* Wrap ONLY Dashboard with Stream Provider */}
                <StreamVideoProvider>
                  <Dashboard />
                </StreamVideoProvider>
              </PrivateRoute>
            }
          />

          {/* ---------- FALLBACK ---------- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

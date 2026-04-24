import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Prediksi = lazy(() => import("./pages/Prediksi"));

function AppRoutes({ theme, toggleTheme }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
      <div style={{ color:"var(--text-secondary)", fontSize:15 }}>Memuat...</div>
    </div>
  );

  if (!user) return <Login />;

  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} user={user} />
      <Suspense fallback={<div style={{ minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>Memuat...</div>}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/prediksi" element={<Prediksi user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes theme={theme} toggleTheme={toggleTheme} />
      </BrowserRouter>
    </AuthProvider>
  );
}

import React from "react";
import { Routes, Route } from "react-router-dom";
import Theaters from "./pages/Theaters.jsx";
import Home from "./pages/Home.jsx";
import Movie from "./pages/Movie.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import NavBar from "./components/NavBar.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <div className="container">
      <NavBar />

      <main>
        <Routes>
          <Route path="/" element={<Theaters />} />
          <Route path="/theater/:theaterId" element={<Home />} />
          <Route path="/movie/:id" element={<Movie />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin", "employee"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <footer>
        <span>North Star Cinemas · Demo project</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

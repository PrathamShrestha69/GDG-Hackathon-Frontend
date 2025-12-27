import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import QuizPage from "./Pages/QuizPage";
import InterviewPage from "./Pages/InterviewPage";
import UserStatsPage from "./Pages/UserStatsPage";
import AtsScorePage from "./Pages/AtsScorePage";
import Navbar from "./Components/Navbar";
import SignInPage from "./Pages/SignInPage.jsx";
import SignUpPage from "./Pages/SignUpPage.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <div className="glass-panel px-6 py-4 rounded-xl">
          Loading your space...
        </div>
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

const AppShell = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="layout-width pb-16 pt-6">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewPage />
              </ProtectedRoute>
            }
          />
          <Route path="/ats" element={<AtsScorePage />} />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <UserStatsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

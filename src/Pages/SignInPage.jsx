import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const SignInPage = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.signin({ email, password });
      const token = res?.token || res?.accessToken;
      if (token) {
        localStorage.setItem("auth_token", token);
        setToken(token);
        setUser(res?.user || null);
        navigate("/quiz");
      } else {
        setError("No token returned. Check backend response.");
      }
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="glass-panel rounded-3xl p-8 border border-[rgba(250,203,181,0.3)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <div className="pill-badge">Secure access</div>
        </div>
        <p className="text-muted mb-6">
          Sign in to continue with quizzes, AI interviews, and stats.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted">Email</label>
            <input
              className="input-base mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-muted">Password</label>
            <input
              className="input-base mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              placeholder="••••••••"
            />
          </div>
          {error ? <div className="text-red-400 text-sm">{error}</div> : null}
          <button
            className="primary-btn w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
      <div className="text-center text-muted">
        New here?{" "}
        <Link to="/signup" className="text-peach">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default SignInPage;

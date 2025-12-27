import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await authApi.signup({
        username,
        email,
        password,
        confirmPassword,
      });
      const token = res?.token || res?.accessToken;
      if (token) {
        localStorage.setItem("auth_token", token);
        setToken(token);
        setUser(res?.user || { username, email });
        navigate("/quiz");
      } else {
        setError("No token returned. Check backend response.");
      }
    } catch (err) {
      setError(err.message || "Unable to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="glass-panel rounded-3xl p-8 border border-[rgba(250,203,181,0.3)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-semibold">Join the lab</h1>
          <div className="pill-badge">Free starter</div>
        </div>
        <p className="text-muted mb-6">
          Create an account to unlock quizzes, AI interviews, and ATS scoring.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted">Username</label>
            <input
              className="input-base mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="alex_student"
            />
          </div>
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
              placeholder="Create a strong password"
            />
          </div>
          <div>
            <label className="text-sm text-muted">Confirm password</label>
            <input
              className="input-base mt-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              type="password"
              placeholder="Repeat your password"
            />
          </div>
          {error ? <div className="text-red-400 text-sm">{error}</div> : null}
          <button
            className="primary-btn w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
      <div className="text-center text-muted">
        Already have an account?{" "}
        <Link to="/signin" className="text-peach">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignUpPage;

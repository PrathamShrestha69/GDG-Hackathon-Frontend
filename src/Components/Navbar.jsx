import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/quiz", label: "Quiz" },
  { to: "/interview", label: "Interview" },
  { to: "/ats", label: "ATS" },
  { to: "/stats", label: "Stats" },
];

const Navbar = () => {
  const { token, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate("/signin");
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-lg">
      <div className="layout-width flex items-center justify-between py-4 sm:py-5">
        <Link
          to="/"
          className="flex items-center gap-3 font-bold tracking-tight text-lg"
        >
          <span className="w-9 h-9 rounded-xl flex items-center justify-center glass-panel border border-[rgba(250,203,181,0.4)]">
            <span className="text-peach text-xl">◎</span>
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm text-muted">Career Lab</span>
            <span>Pulse</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[rgba(250,203,181,0.16)] border border-[rgba(250,203,181,0.3)]"
                    : "text-muted hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {token ? (
            <>
              <div className="pill-badge hidden sm:inline-flex">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                {user?.username || user?.email || "Signed in"}
              </div>
              <button onClick={handleLogout} className="ghost-btn text-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="ghost-btn text-sm">
                Sign in
              </Link>
              <Link to="/signup" className="primary-btn text-sm">
                Create account
              </Link>
            </>
          )}
          <button
            aria-label="Open menu"
            className="md:hidden ghost-btn text-sm"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div className="divider"></div>
      {open && (
        <div className="layout-width md:hidden py-2">
          <div className="glass-panel border border-[rgba(250,203,181,0.25)] rounded-xl p-2 flex flex-col">
            {navLinks.map((link) => (
              <NavLink
                key={`m-${link.to}`}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold ${
                    isActive ? "bg-[rgba(250,203,181,0.16)]" : "text-muted"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

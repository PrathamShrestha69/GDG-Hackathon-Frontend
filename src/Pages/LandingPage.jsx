import React from "react";
import { Link } from "react-router-dom";
import UserStatsCard from "../Components/UserStatsCard";

const features = [
  {
    title: "Adaptive quizzes",
    body: "Category-based practice with real-time scoring and insights so you know exactly where to focus.",
    cta: "Start quiz",
    href: "/quiz",
  },
  {
    title: "AI mock interviews",
    body: "Video-call style practice powered by Gemini to sharpen your behavioral and technical responses.",
    cta: "Open interview",
    href: "/interview",
  },
  {
    title: "ATS radar",
    body: "See how your resume reads to applicant tracking systems and get actionable edits in seconds.",
    cta: "Score resume",
    href: "/ats",
  },
];

const LandingPage = () => {
  return (
    <div className="space-y-10 sm:space-y-14">
      <section className="grid gap-6 md:grid-cols-2 md:gap-10 items-center">
        <div className="space-y-6">
          <span className="accent-pill w-fit">Career GPS for students</span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Interview, quiz, and resume lab built for the next hire.
          </h1>
          <p className="text-muted text-lg md:w-4/5">
            Move from guesswork to confidence with guided quizzes, AI-driven
            mock interviews, and ATS clarity—all in one focused workspace.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className="primary-btn">
              Create a free account
            </Link>
            <Link to="/interview" className="ghost-btn">
              Try an AI mock
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted">
            <div className="glass-panel p-3 rounded-xl border border-[rgba(250,203,181,0.25)]">
              Protected quizzes with instant stats
            </div>
            <div className="glass-panel p-3 rounded-xl border border-[rgba(250,203,181,0.25)]">
              Gemini-powered interview prompts
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-[rgba(250,203,181,0.35)] grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Weekly progress</p>
              <h3 className="text-2xl font-semibold">Momentum</h3>
            </div>
            <div className="pill-badge">Live demo</div>
          </div>
          <div className="card-grid">
            <UserStatsCard
              title="Readiness"
              value="86%"
              trend={8}
              hint="Based on last 5 quizzes"
            />
            <UserStatsCard
              title="Interview score"
              value="7.9/10"
              trend={5}
              hint="Mock with Gemini"
            />
            <UserStatsCard
              title="ATS alignment"
              value="82"
              trend={3}
              hint="Your latest resume"
            />
          </div>
          <div className="divider"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="glass-panel rounded-xl p-3 border border-[rgba(250,203,181,0.2)]">
              <p className="text-muted mb-1">Next quiz</p>
              <p className="font-semibold">Data Structures</p>
            </div>
            <div className="glass-panel rounded-xl p-3 border border-[rgba(250,203,181,0.2)]">
              <p className="text-muted mb-1">Mock focus</p>
              <p className="font-semibold">Product thinking</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="section-heading">Build skills across tracks</h2>
          <Link to="/quiz" className="ghost-btn text-sm">
            Browse tracks
          </Link>
        </div>
        <div className="card-grid">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-panel rounded-2xl p-4 sm:p-5 border border-[rgba(250,203,181,0.35)] flex flex-col gap-4"
            >
              <div>
                <p className="text-sm text-muted">{feature.title}</p>
                <h3 className="text-xl font-semibold mt-1">{feature.body}</h3>
              </div>
              <Link to={feature.href} className="primary-btn text-sm w-fit">
                {feature.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="section-heading">How it works</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            "Pick a category or upload a mock role.",
            "Practice with adaptive quizzes or interview prompts.",
            "Review stats, polish resume, and repeat.",
          ].map((step, idx) => (
            <div
              key={step}
              className="glass-panel rounded-2xl p-4 sm:p-5 border border-[rgba(250,203,181,0.3)]"
            >
              <div className="accent-pill mb-3">Step {idx + 1}</div>
              <p className="font-semibold text-lg">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

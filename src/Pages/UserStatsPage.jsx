import React, { useEffect, useMemo, useState } from "react";
import UserStatsCard from "../Components/UserStatsCard";
import { quizApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const UserStatsPage = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const getCategoryName = (c) => {
    if (!c) return "–";
    if (typeof c === "object") return c.name || c.title || c._id || "Category";
    return c;
  };
  const isEmpty = useMemo(() => {
    if (!stats) return true;
    const keys = Object.keys(stats || {});
    return (
      keys.length === 0 ||
      ((stats?.totalQuizzes ?? 0) === 0 &&
        (stats?.recentResults?.length ?? 0) === 0)
    );
  }, [stats]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await quizApi.stats(token);
        setStats(data?.stats || {});
      } catch (err) {
        setError(err.message || "Unable to load stats");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [token]);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-[rgba(250,203,181,0.3)]">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 bg-[rgba(250,203,181,0.1)] rounded"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-[rgba(250,203,181,0.08)] rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted text-sm">Your performance</p>
          <h1 className="text-3xl font-semibold">Stats & insights</h1>
        </div>
        <div className="pill-badge">Private</div>
      </div>
      {error ? (
        <div className="glass-panel rounded-xl p-4 border border-[rgba(250,203,181,0.35)] text-red-300">
          {error}
          <div className="text-sm text-muted mt-2">
            Try signing in again or completing a quiz to populate stats.
          </div>
        </div>
      ) : null}
      {!isEmpty && (
        <div className="card-grid">
          <UserStatsCard
            title="Quizzes taken"
            value={stats?.totalQuizzes ?? "–"}
            trend={stats?.weekChange || 0}
          />
          <UserStatsCard
            title="Average score"
            value={
              stats?.averagePercentage != null
                ? `${Math.round(stats.averagePercentage)}%`
                : "–"
            }
            trend={stats?.scoreChange || 0}
          />
          <UserStatsCard
            title="Strongest category"
            value={getCategoryName(stats?.categoryStats?.[0]?.category)}
            hint="Based on recent submissions"
          />
          <UserStatsCard
            title="Time spent"
            value={stats?.timeSpent ? `${stats.timeSpent} mins` : "–"}
          />
        </div>
      )}
      {isEmpty && !error && (
        <div className="glass-panel rounded-2xl p-6 border border-[rgba(250,203,181,0.3)]">
          <p className="text-muted">No stats yet.</p>
          <p className="mt-1">Take a quiz to generate your first insights.</p>
        </div>
      )}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-[rgba(250,203,181,0.3)] space-y-3">
        <h3 className="panel-title">Recent activity</h3>
        <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
          {(stats?.recentResults || []).map((item, idx) => (
            <div
              key={`${item.category || item.categoryName}-${idx}`}
              className="flex items-center justify-between glass-panel border border-[rgba(250,203,181,0.15)] rounded-xl p-3"
            >
              <div>
                <p className="font-semibold">
                  {getCategoryName(item.category) || item.categoryName}
                </p>
                <p className="text-muted text-sm">
                  {item.date || item.takenAt}
                </p>
              </div>
              <div className="pill-badge">{item.percentage ?? item.score}%</div>
            </div>
          ))}
          {(stats?.recentResults || []).length === 0 ? (
            <p className="text-muted text-sm">
              No activity yet. Complete your first quiz to see insights.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserStatsPage;

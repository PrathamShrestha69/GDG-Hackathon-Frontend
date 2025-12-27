import React from "react";

const UserStatsCard = ({ title, value, trend, hint }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-[rgba(250,203,181,0.3)]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted">{title}</p>
        {trend ? (
          <span
            className={`pill-badge ${
              trend > 0 ? "" : "bg-[rgba(134,78,122,0.16)]"
            }`}
          >
            {trend > 0 ? "▲" : "●"} {trend}%
          </span>
        ) : null}
      </div>
      <h3 className="text-3xl font-semibold">{value}</h3>
      {hint ? <p className="text-muted text-sm mt-2">{hint}</p> : null}
    </div>
  );
};

export default UserStatsCard;

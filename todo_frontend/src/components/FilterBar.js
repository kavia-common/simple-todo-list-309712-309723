import React from "react";

/**
 * PUBLIC_INTERFACE
 * Filter bar for switching between All/Active/Completed.
 */
export default function FilterBar({ value, onChange, counts }) {
  return (
    <div className="filterBar" role="tablist" aria-label="Task filter">
      <div className="filterPills">
        <button
          type="button"
          className={`pill ${value === "all" ? "pillActive" : ""}`}
          onClick={() => onChange("all")}
          role="tab"
          aria-selected={value === "all"}
        >
          All <span className="pillCount">{counts.all}</span>
        </button>
        <button
          type="button"
          className={`pill ${value === "active" ? "pillActive" : ""}`}
          onClick={() => onChange("active")}
          role="tab"
          aria-selected={value === "active"}
        >
          Active <span className="pillCount">{counts.active}</span>
        </button>
        <button
          type="button"
          className={`pill ${value === "completed" ? "pillActive" : ""}`}
          onClick={() => onChange("completed")}
          role="tab"
          aria-selected={value === "completed"}
        >
          Completed <span className="pillCount">{counts.completed}</span>
        </button>
      </div>
    </div>
  );
}

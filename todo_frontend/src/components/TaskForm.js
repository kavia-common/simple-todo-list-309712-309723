import React, { useMemo, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Form for creating a new task.
 */
export default function TaskForm({ onSubmit, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = useMemo(() => title.trim().length > 0 && !isSubmitting, [title, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      completed: false,
    });

    setTitle("");
    setDescription("");
  };

  return (
    <form className="taskForm" onSubmit={handleSubmit}>
      <div className="taskFormRow">
        <div className="field">
          <label className="label" htmlFor="new-title">Title</label>
          <input
            id="new-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Buy groceries"
            maxLength={200}
            required
          />
        </div>

        <button className="btn btnPrimary btnLarge" type="submit" disabled={!canSubmit}>
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </div>

      <div className="field">
        <label className="label" htmlFor="new-desc">Description (optional)</label>
        <textarea
          id="new-desc"
          className="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
          rows={2}
          maxLength={1000}
        />
      </div>
    </form>
  );
}

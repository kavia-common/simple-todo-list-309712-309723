import React, { useMemo, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * A single task row with toggle, edit, and delete controls.
 */
export default function TaskItem({ task, onToggle, onDelete, onUpdate, busy }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");

  const canSave = useMemo(() => title.trim().length > 0 && !busy, [title, busy]);

  const startEdit = () => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!canSave) return;
    await onUpdate(task.id, {
      title: title.trim(),
      description: description.trim(),
    });
    setIsEditing(false);
  };

  return (
    <li className={`taskItem ${task.completed ? "taskCompleted" : ""}`}>
      <div className="taskMain">
        <label className="checkWrap">
          <input
            type="checkbox"
            checked={!!task.completed}
            onChange={() => onToggle(task)}
            disabled={busy}
            aria-label={task.completed ? "Mark as active" : "Mark as completed"}
          />
          <span className="checkVisual" aria-hidden="true" />
        </label>

        <div className="taskContent">
          {isEditing ? (
            <>
              <input
                className="input inputInline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
                maxLength={200}
                aria-label="Edit title"
              />
              <textarea
                className="textarea textareaInline"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy}
                rows={2}
                maxLength={1000}
                aria-label="Edit description"
              />
              <div className="metaRow">
                <span className="meta">
                  Updated: {new Date(task.updated_at).toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="taskTitleRow">
                <span className="taskTitle">{task.title}</span>
                {task.completed ? <span className="badge badgeSuccess">Done</span> : null}
              </div>
              {task.description ? <p className="taskDesc">{task.description}</p> : null}
              <div className="metaRow">
                <span className="meta">
                  Created: {new Date(task.created_at).toLocaleDateString()}
                </span>
                <span className="dot" aria-hidden="true">•</span>
                <span className="meta">
                  Updated: {new Date(task.updated_at).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="taskActions">
        {isEditing ? (
          <>
            <button className="btn btnPrimary" type="button" onClick={saveEdit} disabled={!canSave}>
              Save
            </button>
            <button className="btn" type="button" onClick={cancelEdit} disabled={busy}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn" type="button" onClick={startEdit} disabled={busy}>
              Edit
            </button>
            <button className="btn btnDanger" type="button" onClick={() => onDelete(task)} disabled={busy}>
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

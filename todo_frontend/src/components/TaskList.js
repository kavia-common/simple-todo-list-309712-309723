import React from "react";
import TaskItem from "./TaskItem";

/**
 * PUBLIC_INTERFACE
 * Renders the list of tasks with empty-state handling.
 */
export default function TaskList({ tasks, onToggle, onDelete, onUpdate, busyIds }) {
  if (!tasks.length) {
    return (
      <div className="emptyState">
        <div className="emptyTitle">No tasks here</div>
        <div className="emptyDesc">Add a task above to get started.</div>
      </div>
    );
  }

  return (
    <ul className="taskList" aria-label="Task list">
      {tasks.map((t) => (
        <TaskItem
          key={t.id}
          task={t}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          busy={busyIds.has(t.id)}
        />
      ))}
    </ul>
  );
}

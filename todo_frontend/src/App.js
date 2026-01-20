import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { getApiBaseUrl } from "./api/client";
import { createTask, deleteTask, listTasks, updateTask } from "./api/tasks";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import FilterBar from "./components/FilterBar";

function sortByNewest(a, b) {
  // Backend returns newest first already, but keep stable ordering client-side as well.
  return (b.id || 0) - (a.id || 0);
}

// PUBLIC_INTERFACE
function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [error, setError] = useState("");

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  const counts = useMemo(() => {
    const all = tasks.length;
    const completed = tasks.filter((t) => !!t.completed).length;
    const active = all - completed;
    return { all, active, completed };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const sorted = [...tasks].sort(sortByNewest);
    if (filter === "active") return sorted.filter((t) => !t.completed);
    if (filter === "completed") return sorted.filter((t) => !!t.completed);
    return sorted;
  }, [tasks, filter]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(`Could not load tasks. ${e?.message || ""}`.trim());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const withBusy = async (taskId, fn) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e?.message || "Something went wrong.");
      // Fallback to reload to ensure consistency after a failed optimistic update.
      await load();
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const handleCreate = async (payload) => {
    setSubmitting(true);
    setError("");
    // Optimistically insert a temporary task to keep UI snappy.
    const tempId = -Date.now();
    const now = new Date().toISOString();
    const tempTask = {
      id: tempId,
      title: payload.title,
      description: payload.description || "",
      completed: false,
      created_at: now,
      updated_at: now,
    };

    setTasks((prev) => [tempTask, ...prev]);

    try {
      const created = await createTask(payload);
      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
    } catch (e) {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      setError(e?.message || "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (task) => {
    // Optimistic toggle for immediate feedback.
    const optimistic = { ...task, completed: !task.completed };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? optimistic : t)));

    await withBusy(task.id, async () => {
      const updated = await updateTask(task.id, { completed: optimistic.completed });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    });
  };

  const handleUpdate = async (taskId, patch) => {
    // Optimistic update of title/description
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...patch, updated_at: new Date().toISOString() } : t))
    );

    await withBusy(taskId, async () => {
      const updated = await updateTask(taskId, patch);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    });
  };

  const handleDelete = async (task) => {
    // Optimistic removal
    const snapshot = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    await withBusy(task.id, async () => {
      await deleteTask(task.id);
    }).catch(() => {
      // restore from snapshot (withBusy already triggers load, but this keeps UI coherent instantly)
      setTasks(snapshot);
    });
  };

  return (
    <div className="AppShell">
      <header className="topBar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">✓</div>
          <div>
            <div className="brandTitle">Todo</div>
            <div className="brandSub">Simple, fast, and persistent.</div>
          </div>
        </div>

        <div className="topBarRight">
          <div className="apiHint" title="Backend API base URL">
            API: <code className="codePill">{apiBase}</code>
          </div>
          <button className="btn" type="button" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <main className="container">
        <section className="card">
          <div className="cardHeader">
            <h1 className="h1">Your tasks</h1>
            <div className="subtle">
              {counts.active} active / {counts.completed} completed
            </div>
          </div>

          <TaskForm onSubmit={handleCreate} isSubmitting={submitting} />

          <FilterBar value={filter} onChange={setFilter} counts={counts} />

          {error ? (
            <div className="alert" role="alert">
              <div className="alertTitle">Error</div>
              <div className="alertBody">{error}</div>
            </div>
          ) : null}

          {loading ? (
            <div className="loading">
              <div className="spinner" aria-hidden="true" />
              <div>Loading tasks...</div>
            </div>
          ) : (
            <TaskList
              tasks={visibleTasks}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              busyIds={busyIds}
            />
          )}
        </section>

        <footer className="footer">
          <span className="subtle">
            Tip: click a task’s checkbox to toggle completion. Use Edit to update title/description.
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;

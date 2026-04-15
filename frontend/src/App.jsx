import { useEffect, useState } from "react";

const API = "/api/tasks";

function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-800"></div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <p className="text-lg font-medium text-slate-700">No tasks yet</p>
      <p className="mt-2 text-sm text-slate-500">
        Add your first task to get started.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <p className="font-semibold text-red-700">Something went wrong</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Failed to load tasks.");
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title.trim(),
          completed: false
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add task.");
      }

      setTitle("");
      await fetchTasks();
    } catch (err) {
      setError(err.message || "Unexpected error.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = async (task) => {
    if (!editingTitle.trim()) return;

    try {
      setProcessingId(task.id);
      setError("");

      const response = await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: editingTitle.trim(),
          completed: task.completed
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update task.");
      }

      setEditingId(null);
      setEditingTitle("");
      await fetchTasks();
    } catch (err) {
      setError(err.message || "Unexpected error.");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleTask = async (task) => {
    try {
      setProcessingId(task.id);
      setError("");

      const response = await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: task.title,
          completed: !task.completed
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update task status.");
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message || "Unexpected error.");
    } finally {
      setProcessingId(null);
    }
  };

  const deleteTask = async (id) => {
    try {
      setProcessingId(id);
      setError("");

      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete task.");
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message || "Unexpected error.");
    } finally {
      setProcessingId(null);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Docker Demo
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Task Manager CRUD
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Full CRUD with React, Tailwind CSS, Spring Boot, PostgreSQL, Nginx, and Docker Compose.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-lg">
            <p className="text-sm text-slate-300">System status</p>
            <p className="mt-1 text-lg font-semibold">Running</p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Total tasks" value={totalTasks} />
          <StatCard label="Completed" value={completedTasks} />
          <StatCard label="Pending" value={pendingTasks} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Create task</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a new task to the system.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Task title
                </label>
                <input
                  type="text"
                  placeholder="Write your task here..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !submitting) addTask();
                  }}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
                />
              </div>

              <button
                onClick={addTask}
                disabled={submitting || !title.trim()}
                className="w-full rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Adding task..." : "Add task"}
              </button>
            </div>

            {error && (
              <div className="mt-4">
                <ErrorState message={error} onRetry={fetchTasks} />
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">Task list</h2>
              <p className="mt-1 text-sm text-slate-500">
                Read, update, complete, and delete tasks.
              </p>
            </div>

            {loading ? (
              <Spinner />
            ) : tasks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const isBusy = processingId === task.id;
                  const isEditing = editingId === task.id;

                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex flex-1 items-start gap-3">
                          <div
                            className={`mt-1 h-3.5 w-3.5 rounded-full ${
                              task.completed ? "bg-green-500" : "bg-amber-400"
                            }`}
                          ></div>

                          <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
                                />

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveEdit(task)}
                                    disabled={isBusy || !editingTitle.trim()}
                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isBusy ? "Saving..." : "Save"}
                                  </button>

                                  <button
                                    onClick={cancelEdit}
                                    disabled={isBusy}
                                    className="rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p
                                  className={`text-base font-semibold ${
                                    task.completed
                                      ? "text-slate-400 line-through"
                                      : "text-slate-800"
                                  }`}
                                >
                                  {task.title}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {task.completed ? "Completed" : "Pending"}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {!isEditing && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => startEdit(task)}
                              disabled={isBusy}
                              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => toggleTask(task)}
                              disabled={isBusy}
                              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isBusy
                                ? "Processing..."
                                : task.completed
                                ? "Mark pending"
                                : "Mark done"}
                            </button>

                            <button
                              onClick={() => deleteTask(task.id)}
                              disabled={isBusy}
                              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isBusy ? "Processing..." : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

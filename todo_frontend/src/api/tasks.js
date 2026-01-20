import { apiRequest } from "./client";

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} [description]
 * @property {boolean} completed
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * PUBLIC_INTERFACE
 * Fetch all tasks.
 * @returns {Promise<Task[]>}
 */
export async function listTasks() {
  return await apiRequest("/api/tasks", { method: "GET" });
}

/**
 * PUBLIC_INTERFACE
 * Create a task.
 * @param {{title: string, description?: string, completed?: boolean}} payload
 * @returns {Promise<Task>}
 */
export async function createTask(payload) {
  return await apiRequest("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * PUBLIC_INTERFACE
 * Update a task by id (partial update fields supported).
 * @param {number} taskId
 * @param {{title?: (string|null), description?: (string|null), completed?: (boolean|null)}} patch
 * @returns {Promise<Task>}
 */
export async function updateTask(taskId, patch) {
  return await apiRequest(`/api/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

/**
 * PUBLIC_INTERFACE
 * Delete a task by id.
 * @param {number} taskId
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId) {
  await apiRequest(`/api/tasks/${taskId}`, { method: "DELETE" });
}

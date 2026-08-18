// WhatsApp Profile Checker API — browser JavaScript example.
// This browser client calls your same-origin backend proxy. The proxy must
// add X-API-Key from its server-side NUMBERCHECKER_API_KEY environment value.
const BASE_URL = "/api/numberchecker";
const TASK_TYPE = "ws_avatar";

async function submitTask(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("task_type", TASK_TYPE);

  const response = await fetch(`${BASE_URL}/v1/tasks`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`submit failed: ${response.status}`);
  return response.json();
}

async function getTask(taskId) {
  const form = new FormData();
  form.append("task_id", taskId);

  const response = await fetch(`${BASE_URL}/v1/gettasks`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`get task failed: ${response.status}`);
  return response.json();
}

export async function check(file) {
  const created = await submitTask(file);
  console.log("task_id:", created.task_id);

  for (;;) {
    const task = await getTask(created.task_id);
    if (task.status === "exported") return task.result_url;
    if (task.status === "failed") throw new Error("task failed");
    await new Promise((r) => setTimeout(r, 5000));
  }
}

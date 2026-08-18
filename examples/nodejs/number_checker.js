// WhatsApp Profile Checker API — Node.js 18+ example. Docs: https://docs.numberchecker.ai/whatsapp-bulk-number-checker-avatar
import fs from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
const BASE_URL = process.env.API_BASE_URL || "https://api.numberchecker.ai";
const API_KEY = process.env.NUMBERCHECKER_API_KEY;
if (!API_KEY) throw new Error("NUMBERCHECKER_API_KEY is required");
const TASK_TYPE = "ws_avatar";
async function submitTask(path) { const form = new FormData(); form.append("file", new Blob([fs.readFileSync(path)]), "numbers.txt"); form.append("task_type", TASK_TYPE);
  const r = await fetch(`${BASE_URL}/v1/tasks`, { method: "POST", headers: { "X-API-Key": API_KEY }, body: form }); if (!r.ok) throw new Error(`submit: ${r.status}`); return r.json(); }
async function getTask(id) { const form = new FormData(); form.append("task_id", id); const r = await fetch(`${BASE_URL}/v1/gettasks`, { method: "POST", headers: { "X-API-Key": API_KEY }, body: form }); if (!r.ok) throw new Error(`get: ${r.status}`); return r.json(); }
const created = await submitTask("examples/numbers.txt"); console.log("task_id:", created.task_id);
for (;;) { const task = await getTask(created.task_id); console.log("status:", task.status); if (task.status === "exported") { if (task.result_url) {
    const dl = await fetch(task.result_url);
    if (!dl.ok) throw new Error(`download: ${dl.status}`);
    fs.writeFileSync("results.zip", Buffer.from(await dl.arrayBuffer()));
  } break; } if (task.status === "failed") throw new Error("task failed"); await sleep(5000); }

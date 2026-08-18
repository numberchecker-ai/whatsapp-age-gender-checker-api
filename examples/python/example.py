#!/usr/bin/env python3
"""WhatsApp Profile Checker API — asynchronous bulk example."""
import os
import time

import requests

BASE_URL = os.environ.get("API_BASE_URL", "https://api.numberchecker.ai")
API_KEY = os.environ["NUMBERCHECKER_API_KEY"]
TASK_TYPE = "ws_avatar"


def submit_task(file_path):
    with open(file_path, "rb") as stream:
        response = requests.post(
            f"{BASE_URL}/v1/tasks",
            headers={"X-API-Key": API_KEY},
            files={"file": (os.path.basename(file_path), stream, "text/plain")},
            data={"task_type": TASK_TYPE},
            timeout=30,
        )
    response.raise_for_status()
    return response.json()


def get_task(task_id):
    response = requests.post(
        f"{BASE_URL}/v1/gettasks",
        headers={"X-API-Key": API_KEY},
        data={"task_id": task_id},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def poll(task_id, interval=5):
    while True:
        task = get_task(task_id)
        print(f"status={task.get('status')} success={task.get('success', 0)}/{task.get('total', 0)}")
        if task.get("status") == "exported":
            return task
        if task.get("status") == "failed":
            raise RuntimeError("task failed")
        time.sleep(interval)


def download(url, output="results.zip"):
    response = requests.get(url, stream=True, timeout=300)
    response.raise_for_status()
    with open(output, "wb") as stream:
        for chunk in response.iter_content(chunk_size=8192):
            stream.write(chunk)
    return output


if __name__ == "__main__":
    created = submit_task("examples/numbers.txt")
    print("task_id:", created["task_id"])
    final = poll(created["task_id"])
    if final.get("result_url"):
        print("saved to:", download(final["result_url"]))

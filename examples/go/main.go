// WhatsApp Profile Checker API — Go example. Docs: https://docs.numberchecker.ai/whatsapp-bulk-number-checker-avatar
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"
)

const baseURL = "https://api.numberchecker.ai"
const taskType = "ws_avatar"

type Task struct {
	TaskID    string `json:"task_id"`
	Status    string `json:"status"`
	Total     int    `json:"total"`
	Success   int    `json:"success"`
	ResultURL string `json:"result_url"`
}

func key() string {
	v, ok := os.LookupEnv("NUMBERCHECKER_API_KEY")
	if !ok || v == "" {
		panic("NUMBERCHECKER_API_KEY is required")
	}
	return v
}

func post(path string, fields map[string]string, file string) (*Task, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	if file != "" {
		f, err := os.Open(file)
		if err != nil {
			return nil, err
		}
		defer f.Close()
		part, _ := writer.CreateFormFile("file", file)
		io.Copy(part, f)
	}
	for k, v := range fields {
		writer.WriteField(k, v)
	}
	writer.Close()

	req, _ := http.NewRequest("POST", baseURL+path, &body)
	req.Header.Set("X-API-Key", key())
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 && resp.StatusCode != 202 {
		return nil, fmt.Errorf("http %d", resp.StatusCode)
	}
	var t Task
	return &t, json.NewDecoder(resp.Body).Decode(&t)
}

func download(url string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download http %d", resp.StatusCode)
	}
	out, err := os.Create("results.zip")
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, resp.Body)
	return err
}

func main() {
	t, err := post("/v1/tasks", map[string]string{"task_type": taskType}, "examples/numbers.txt")
	if err != nil {
		panic(err)
	}
	fmt.Println("task_id:", t.TaskID)

	for {
		t, err = post("/v1/gettasks", map[string]string{"task_id": t.TaskID}, "")
		if err != nil {
			panic(err)
		}
		fmt.Println("status:", t.Status)
		if t.Status == "exported" || t.Status == "failed" {
			break
		}
		time.Sleep(5 * time.Second)
	}

	if t.ResultURL != "" {
		if err := download(t.ResultURL); err != nil {
			panic(err)
		}
		fmt.Println("saved to: results.zip")
	}
}

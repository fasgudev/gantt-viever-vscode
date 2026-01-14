import * as vscode from "vscode";
import { CsvTask } from "./csv";

function nonce() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let v = "";
  for (let i = 0; i < 32; i++) v += chars.charAt(Math.floor(Math.random() * chars.length));
  return v;
}

export function createOrShowGanttPanel(
  title: string,
  initialTasks: any[]
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    "ganttPreview",
    title,
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true }
  );

  const n = nonce();

  panel.webview.html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'none';
    img-src ${panel.webview.cspSource} https: data:;
    style-src ${panel.webview.cspSource} 'unsafe-inline' https:;
    script-src 'nonce-${n}' https:;
  " />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <link rel="stylesheet" href="https://unpkg.com/frappe-gantt@1.0.4/dist/frappe-gantt.css" />
  <style>
    body { font-family: sans-serif; padding: 10px; }
    #gantt { height: 520px; border: 1px solid #ddd; border-radius: 8px; overflow: auto; }
    .muted { color: #666; }
  </style>
</head>
<body>
  <h2>Gantt desde CSV</h2>
  <p class="muted" id="status"></p>
  <div id="gantt"></div>

  <script nonce="${n}" src="https://unpkg.com/frappe-gantt@1.0.4/dist/frappe-gantt.umd.js"></script>
  <script nonce="${n}">
    const vscode = acquireVsCodeApi();
    let gantt = null;

    function render(tasks) {
      const el = document.querySelector("#gantt");
      el.innerHTML = ""; // re-render limpio
      if (!tasks || tasks.length === 0) {
        document.querySelector("#status").textContent = "No hay tareas válidas.";
        return;
      }
      document.querySelector("#status").textContent = "Actualizado: " + new Date().toLocaleTimeString();
      gantt = new Gantt("#gantt", tasks, { view_mode: "Day" });
    }

    // primer render
    render(${JSON.stringify(initialTasks)});

    // escuchar updates desde la extensión
    window.addEventListener("message", (event) => {
      const msg = event.data;
      if (msg?.type === "update") render(msg.tasks);
      if (msg?.type === "error") {
        document.querySelector("#status").textContent = msg.message || "Error";
      }
    });
  </script>
</body>
</html>`;

  return panel;
}
import * as vscode from "vscode";
import { CsvTask } from "./csv";

function nonce() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let v = "";
  for (let i = 0; i < 32; i++) v += chars.charAt(Math.floor(Math.random() * chars.length));
  return v;
}

function toFrappeTasks(tasks: CsvTask[]) {
  return tasks.map(t => ({
    id: String(t.id),
    name: t.name,
    start: t.start,          // YYYY-MM-DD
    end: t.end,              // YYYY-MM-DD
    progress: Number(t.progress ?? 0),
    // frappe-gantt espera "dependencies" (string con ids separados por coma)
    dependencies: (t.depends ?? []).join(",")
  }));
}

export function showGantt(panelTitle: string, tasks: CsvTask[]) {
  const panel = vscode.window.createWebviewPanel(
    "ganttPreview",
    panelTitle,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  const n = nonce();
  const data = JSON.stringify(toFrappeTasks(tasks));

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
  </style>
</head>
<body>
  <h2>Gantt desde CSV</h2>
  <div id="gantt"></div>

  <script src="https://unpkg.com/frappe-gantt@1.0.4/dist/frappe-gantt.umd.js"></script>
  <script nonce="${n}">
    const tasks = ${data};

    console.log("Tasks:", tasks);

    if (!tasks || tasks.length === 0) {
      document.body.insertAdjacentHTML("beforeend", "<p>No hay tareas válidas.</p>");
    } else {
      new Gantt("#gantt", tasks, { view_mode: "Day" });
    }
  </script>
</body>
</html>`;
}
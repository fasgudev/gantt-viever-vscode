import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

function nonce() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let v = "";
  for (let i = 0; i < 32; i++) v += chars.charAt(Math.floor(Math.random() * chars.length));
  return v;
}

function getWebviewHtml(
  extensionPath: string,
  cspSource: string,
  n: string,
  initialTasks: any[],
  webview: vscode.Webview
): string {
  const templatePath = path.join(extensionPath, "src", "webview", "gantt.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  const frappePath = vscode.Uri.file(path.join(extensionPath, "assets", "js", "frappe-gantt.umd.js"));
  const vuePath = vscode.Uri.file(path.join(extensionPath, "assets", "js", "vue.runtime.global.prod.js"));
  const frappeScript = webview.asWebviewUri(frappePath).toString();
  const vueScript = webview.asWebviewUri(vuePath).toString();

  html = html
    .replace(/\{\{cspSource\}\}/g, cspSource)
    .replace(/\{\{nonce\}\}/g, n)
    .replace(/\{\{initialTasks\}\}/g, JSON.stringify(initialTasks));

  html = html
    .replace(/\{\{frappeScript\}\}/g, frappeScript)
    .replace(/\{\{vueScript\}\}/g, vueScript);

  return html;
}

export function createOrShowGanttPanel(
  title: string,
  initialTasks: any[],
  extensionPath: string
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    "ganttPreview",
    title,
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true }
  );

  const n = nonce();

  panel.webview.html = getWebviewHtml(
    extensionPath,
    panel.webview.cspSource,
    n,
    initialTasks,
    panel.webview
  );

  return panel;
}

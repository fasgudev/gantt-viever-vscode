import * as vscode from "vscode";
import { parseTasksFromCsv, CsvTask } from "./csv";
import { createOrShowGanttPanel } from "./ganttView";

let currentPanel: vscode.WebviewPanel | undefined;
let currentCsvUri: vscode.Uri | undefined;

function isCsvDoc(doc: vscode.TextDocument) {
  return doc.fileName.toLowerCase().endsWith(".csv");
}

function toFrappeTasks(tasks: CsvTask[]) {
  return tasks.map(t => ({
    id: String(t.id),
    name: t.name,
    start: t.start,
    end: t.end,
    progress: Number(t.progress ?? 0),
    dependencies: (t.depends ?? []).join(",")
  }));
}

function updatePanelFromDocument(doc: vscode.TextDocument) {
  if (!currentPanel) return;

  const tasks = parseTasksFromCsv(doc.getText());
  const frappeTasks = toFrappeTasks(tasks);

  if (!frappeTasks.length) {
    currentPanel.webview.postMessage({ type: "error", message: "No se encontraron tareas válidas en el CSV." });
    currentPanel.webview.postMessage({ type: "update", tasks: [] });
    return;
  }

  currentPanel.webview.postMessage({ type: "update", tasks: frappeTasks });
}

export function activate(context: vscode.ExtensionContext) {

  // 1) Comando: preview desde CSV activo (sin explorador)
  context.subscriptions.push(
    vscode.commands.registerCommand("ganttviewer.previewFromCsv", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !isCsvDoc(editor.document)) {
        vscode.window.showErrorMessage("Abre un archivo .csv para previsualizar el Gantt.");
        return;
      }

      currentCsvUri = editor.document.uri;

      const tasks = toFrappeTasks(parseTasksFromCsv(editor.document.getText()));

      if (!currentPanel) {
        currentPanel = createOrShowGanttPanel("Gantt Preview", tasks, context.extensionPath);
        currentPanel.onDidDispose(() => {
          currentPanel = undefined;
          currentCsvUri = undefined;
        });
      } else {
        currentPanel.title = "Gantt Preview";
        currentPanel.reveal(vscode.ViewColumn.One);
        currentPanel.webview.postMessage({ type: "update", tasks });
      }
    })
  );

  // 2) Auto-refresh al GUARDAR el CSV que se está previsualizando
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (!currentPanel || !currentCsvUri) return;
      if (doc.uri.toString() !== currentCsvUri.toString()) return;
      if (!isCsvDoc(doc)) return;

      updatePanelFromDocument(doc);
    })
  );
}

export function deactivate() {}
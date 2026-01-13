import * as vscode from "vscode";
import { parseTasksFromCsv } from "./csv";
import { showGantt } from "./ganttView";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("ganttviewer.previewFromCsv", async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No hay un archivo abierto.");
        return;
      }

	  const fileName = editor.document.fileName.toLowerCase();

      if (!fileName.endsWith(".csv")) {
        vscode.window.showErrorMessage("Abre un archivo CSV para previsualizar el Gantt.");
        return;
      }

      const csvText = editor.document.getText();
      const tasks = parseTasksFromCsv(csvText);

      if (!tasks.length) {
        vscode.window.showErrorMessage("No se encontraron tareas válidas en el CSV.");
        return;
      }

      showGantt("Gantt Preview", tasks);
    })
  );
}

export function deactivate() {}
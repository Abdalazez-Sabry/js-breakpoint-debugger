import * as vscode from "vscode";

const debug = "debugger;";

const supportedLanguages = [
  "javascript",
  "typescript",
  "javascriptreact",
  "typescriptreact",
  "svelte",
  "vue",
];

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.debug.onDidChangeBreakpoints((event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    if (!supportedLanguages.includes(editor.document.languageId)) {
      return;
    }

    event.added.forEach((bp) => {
      if (
        bp instanceof vscode.SourceBreakpoint &&
        bp.location.uri.toString() === editor.document.uri.toString()
      ) {
        const lineNum = bp.location.range.start.line;
        const textLine = editor.document.lineAt(lineNum);
        const firstChar = textLine.firstNonWhitespaceCharacterIndex;
        const indent = textLine.text.substring(0, firstChar);

        editor.edit((editBuilder) => {
          editBuilder.insert(
            new vscode.Position(lineNum, 0),
            `${indent}${debug}\n`,
          );
        });
      }
    });

    event.removed.forEach((bp) => {
      if (
        bp instanceof vscode.SourceBreakpoint &&
        bp.location.uri.toString() === editor.document.uri.toString()
      ) {
        const lineNum = bp.location.range.start.line;
        const line = editor.document.lineAt(lineNum);

        editor.edit((editBuilder) => {
          if (
            [debug, debug.slice(0, debug.length - 1)].includes(line.text.trim())
          ) {
            const deleteRange = new vscode.Range(
              new vscode.Position(lineNum, 0),
              new vscode.Position(lineNum + 1, 0),
            );
            editBuilder.delete(deleteRange);
          }
        });
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

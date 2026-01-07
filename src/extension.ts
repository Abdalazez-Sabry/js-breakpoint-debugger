import * as vscode from "vscode";

const debug = "debugger;";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.debug.onDidChangeBreakpoints((event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

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
            `${indent}${debug}\n`
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
        const startLine = Math.max(0, lineNum - 5);
        const endLine = Math.min(editor.document.lineCount - 1, lineNum + 5);

        for (let l = startLine; l <= endLine; l++) {
          const textLine = editor.document.lineAt(l);
          const trimmed = textLine.text.trim();
          if (trimmed === debug) {
            editor.edit((editBuilder) => {
              const deleteRange = new vscode.Range(
                new vscode.Position(l, 0),
                new vscode.Position(l + 1, 0)
              );
              editBuilder.delete(deleteRange);
            });
            break;
          }
        }
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

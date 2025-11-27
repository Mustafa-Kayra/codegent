import * as vscode from 'vscode';

export class ContextService {
  // Maximum lines to include before cursor for context
  private maxContextLines = 100;
  
  // Maximum characters for context
  private maxContextChars = 4000;

  getContextRange(document: vscode.TextDocument, position: vscode.Position): vscode.Range {
    // Calculate how many lines to include
    const startLine = Math.max(0, position.line - this.maxContextLines);
    
    // Create range from start to cursor position
    const range = new vscode.Range(
      new vscode.Position(startLine, 0),
      position
    );

    // Check if it's too long
    const text = document.getText(range);
    if (text.length <= this.maxContextChars) {
      return range;
    }

    // Truncate from the beginning if too long
    const truncatedText = text.slice(-this.maxContextChars);
    
    // Find the first newline to start at a clean line
    const firstNewline = truncatedText.indexOf('\n');
    if (firstNewline > 0) {
      const offset = text.length - this.maxContextChars + firstNewline + 1;
      const startOffset = document.offsetAt(new vscode.Position(startLine, 0));
      return new vscode.Range(
        document.positionAt(startOffset + offset),
        position
      );
    }

    return range;
  }

  getFileContext(document: vscode.TextDocument): string {
    const text = document.getText();
    if (text.length <= this.maxContextChars * 2) {
      return text;
    }
    
    // Return first and last parts of the file
    const halfMax = this.maxContextChars;
    const first = text.slice(0, halfMax);
    const last = text.slice(-halfMax);
    
    return `${first}\n\n... [truncated] ...\n\n${last}`;
  }

  getSelectionContext(
    document: vscode.TextDocument,
    selection: vscode.Selection
  ): {
    before: string;
    selected: string;
    after: string;
    language: string;
  } {
    const selectedText = document.getText(selection);
    
    // Get some context before and after
    const beforeStart = Math.max(0, selection.start.line - 10);
    const afterEnd = Math.min(document.lineCount - 1, selection.end.line + 10);
    
    const beforeRange = new vscode.Range(
      new vscode.Position(beforeStart, 0),
      selection.start
    );
    
    const afterRange = new vscode.Range(
      selection.end,
      new vscode.Position(afterEnd, document.lineAt(afterEnd).text.length)
    );

    return {
      before: document.getText(beforeRange),
      selected: selectedText,
      after: document.getText(afterRange),
      language: document.languageId
    };
  }

  getRelatedFiles(document: vscode.TextDocument): Promise<string[]> {
    // Find related files based on imports/requires
    const text = document.getText();
    const relatedFiles: string[] = [];

    // JavaScript/TypeScript imports
    const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
    let match;
    while ((match = importRegex.exec(text)) !== null) {
      relatedFiles.push(match[1]);
    }

    // Python imports
    const pythonImportRegex = /(?:from|import)\s+([^\s]+)/g;
    while ((match = pythonImportRegex.exec(text)) !== null) {
      relatedFiles.push(match[1]);
    }

    return Promise.resolve([...new Set(relatedFiles)]);
  }

  async getWorkspaceContext(): Promise<{
    workspaceName: string;
    openFiles: string[];
    activeFile: string | null;
  }> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspaceName = workspaceFolders?.[0]?.name || 'Untitled';
    
    const openFiles = vscode.window.tabGroups.all
      .flatMap(group => group.tabs)
      .filter(tab => tab.input instanceof vscode.TabInputText)
      .map(tab => (tab.input as vscode.TabInputText).uri.fsPath);
    
    const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath || null;

    return {
      workspaceName,
      openFiles,
      activeFile
    };
  }

  getDiagnosticsContext(document: vscode.TextDocument): string {
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    
    if (diagnostics.length === 0) {
      return 'No diagnostics found.';
    }

    return diagnostics.map(d => {
      const severity = ['Error', 'Warning', 'Info', 'Hint'][d.severity];
      return `${severity} at line ${d.range.start.line + 1}: ${d.message}`;
    }).join('\n');
  }
}

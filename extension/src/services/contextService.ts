/**
 * Context Service
 * Gathers context from the current editor and workspace
 */

import * as vscode from 'vscode';

export interface EditorContext {
  fileName: string;
  languageId: string;
  selectedText: string;
  visibleText: string;
  cursorPosition: vscode.Position;
  lineCount: number;
}

export interface WorkspaceContext {
  workspaceName: string | undefined;
  openFiles: string[];
  recentFiles: string[];
}

export class ContextService {
  private recentFiles: string[] = [];
  private maxRecentFiles: number = 10;

  constructor() {
    // Track file opens
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && !editor.document.isUntitled) {
        this.addRecentFile(editor.document.uri.fsPath);
      }
    });
  }

  private addRecentFile(filePath: string): void {
    // Remove if already exists
    this.recentFiles = this.recentFiles.filter(f => f !== filePath);
    // Add to front
    this.recentFiles.unshift(filePath);
    // Keep only recent files
    if (this.recentFiles.length > this.maxRecentFiles) {
      this.recentFiles.pop();
    }
  }

  /**
   * Get context from the current active editor
   */
  public getCurrentEditorContext(): EditorContext | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return undefined;
    }

    const document = editor.document;
    const selection = editor.selection;

    // Get selected text or visible range
    const selectedText = document.getText(selection);
    
    // Get visible text (what's shown in the viewport)
    const visibleRanges = editor.visibleRanges;
    let visibleText = '';
    if (visibleRanges.length > 0) {
      visibleText = document.getText(visibleRanges[0]);
    }

    return {
      fileName: document.fileName.split(/[/\\]/).pop() || document.fileName,
      languageId: document.languageId,
      selectedText,
      visibleText,
      cursorPosition: selection.active,
      lineCount: document.lineCount
    };
  }

  /**
   * Get workspace context
   */
  public getWorkspaceContext(): WorkspaceContext {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    return {
      workspaceName: workspaceFolders?.[0]?.name,
      openFiles: vscode.workspace.textDocuments
        .filter(doc => !doc.isUntitled)
        .map(doc => doc.fileName),
      recentFiles: this.recentFiles
    };
  }

  /**
   * Get code around the cursor
   */
  public getCodeAroundCursor(
    linesBefore: number = 50,
    linesAfter: number = 20
  ): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return undefined;
    }

    const document = editor.document;
    const position = editor.selection.active;

    const startLine = Math.max(0, position.line - linesBefore);
    const endLine = Math.min(document.lineCount - 1, position.line + linesAfter);

    const range = new vscode.Range(
      new vscode.Position(startLine, 0),
      new vscode.Position(endLine, document.lineAt(endLine).text.length)
    );

    return document.getText(range);
  }

  /**
   * Get the current line
   */
  public getCurrentLine(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return undefined;
    }

    return editor.document.lineAt(editor.selection.active.line).text;
  }

  /**
   * Get diagnostics for the current file
   */
  public getCurrentDiagnostics(): vscode.Diagnostic[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return [];
    }

    return vscode.languages.getDiagnostics(editor.document.uri);
  }

  /**
   * Get imports/requires from the current file
   */
  public getImports(): string[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return [];
    }

    const document = editor.document;
    const text = document.getText();
    const imports: string[] = [];

    // Match various import patterns
    const patterns = [
      /import\s+.*?from\s+['"](.+?)['"]/g,  // ES6 imports
      /import\s+['"](.+?)['"]/g,             // Side-effect imports
      /require\(['"](.+?)['"]\)/g,           // CommonJS requires
      /from\s+['"](.+?)['"]/g                // Python imports
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (!imports.includes(match[1])) {
          imports.push(match[1]);
        }
      }
    }

    return imports;
  }

  /**
   * Get function/class definitions in the current file
   */
  public async getSymbols(): Promise<vscode.DocumentSymbol[]> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return [];
    }

    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      editor.document.uri
    );

    return symbols || [];
  }

  /**
   * Build a context string for AI prompts
   */
  public async buildContextPrompt(): Promise<string> {
    const parts: string[] = [];

    // Editor context
    const editorContext = this.getCurrentEditorContext();
    if (editorContext) {
      parts.push(`File: ${editorContext.fileName}`);
      parts.push(`Language: ${editorContext.languageId}`);
      parts.push(`Lines: ${editorContext.lineCount}`);
    }

    // Workspace context
    const workspaceContext = this.getWorkspaceContext();
    if (workspaceContext.workspaceName) {
      parts.push(`Workspace: ${workspaceContext.workspaceName}`);
    }

    // Diagnostics
    const diagnostics = this.getCurrentDiagnostics();
    const errors = diagnostics.filter(
      d => d.severity === vscode.DiagnosticSeverity.Error
    );
    if (errors.length > 0) {
      parts.push(`Errors: ${errors.length}`);
      parts.push(`First error: ${errors[0].message}`);
    }

    // Imports
    const imports = this.getImports();
    if (imports.length > 0) {
      parts.push(`Dependencies: ${imports.slice(0, 5).join(', ')}`);
    }

    return parts.join('\n');
  }
}

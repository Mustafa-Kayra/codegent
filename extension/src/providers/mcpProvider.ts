/**
 * MCP (Model Context Protocol) Provider
 * Handles advanced AI context and tool integration
 */

import * as vscode from 'vscode';
import { AIService } from '../services/aiService';

interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

interface MCPContext {
  files: string[];
  symbols: string[];
  diagnostics: vscode.Diagnostic[];
}

export class MCPProvider {
  private tools: MCPTool[] = [];
  private context: MCPContext = {
    files: [],
    symbols: [],
    diagnostics: []
  };

  constructor(private aiService: AIService) {
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.tools = [
      {
        name: 'read_file',
        description: 'Read the contents of a file',
        parameters: {
          path: { type: 'string', description: 'File path to read' }
        }
      },
      {
        name: 'write_file',
        description: 'Write content to a file',
        parameters: {
          path: { type: 'string', description: 'File path to write' },
          content: { type: 'string', description: 'Content to write' }
        }
      },
      {
        name: 'search_files',
        description: 'Search for files matching a pattern',
        parameters: {
          pattern: { type: 'string', description: 'Glob pattern to search' }
        }
      },
      {
        name: 'get_diagnostics',
        description: 'Get current diagnostics (errors, warnings) for a file',
        parameters: {
          path: { type: 'string', description: 'File path' }
        }
      },
      {
        name: 'get_symbols',
        description: 'Get symbols (functions, classes, variables) in a file',
        parameters: {
          path: { type: 'string', description: 'File path' }
        }
      },
      {
        name: 'run_terminal',
        description: 'Run a command in the terminal',
        parameters: {
          command: { type: 'string', description: 'Command to run' }
        }
      }
    ];
  }

  public getTools(): MCPTool[] {
    return this.tools;
  }

  public async executeTool(
    toolName: string,
    parameters: Record<string, unknown>
  ): Promise<unknown> {
    switch (toolName) {
      case 'read_file':
        return this.readFile(parameters.path as string);
      case 'write_file':
        return this.writeFile(
          parameters.path as string,
          parameters.content as string
        );
      case 'search_files':
        return this.searchFiles(parameters.pattern as string);
      case 'get_diagnostics':
        return this.getDiagnostics(parameters.path as string);
      case 'get_symbols':
        return this.getSymbols(parameters.path as string);
      case 'run_terminal':
        return this.runTerminal(parameters.command as string);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async readFile(path: string): Promise<string> {
    try {
      const uri = vscode.Uri.file(path);
      const document = await vscode.workspace.openTextDocument(uri);
      return document.getText();
    } catch (error) {
      throw new Error(`Failed to read file: ${path}`);
    }
  }

  private async writeFile(path: string, content: string): Promise<boolean> {
    try {
      const uri = vscode.Uri.file(path);
      const edit = new vscode.WorkspaceEdit();
      
      // Check if file exists
      try {
        await vscode.workspace.fs.stat(uri);
        // File exists, replace content
        const document = await vscode.workspace.openTextDocument(uri);
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(document.getText().length)
        );
        edit.replace(uri, fullRange, content);
      } catch {
        // File doesn't exist, create it
        edit.createFile(uri, { ignoreIfExists: false });
        edit.insert(uri, new vscode.Position(0, 0), content);
      }
      
      await vscode.workspace.applyEdit(edit);
      return true;
    } catch (error) {
      throw new Error(`Failed to write file: ${path}`);
    }
  }

  private async searchFiles(pattern: string): Promise<string[]> {
    const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
    return files.map(f => f.fsPath);
  }

  private async getDiagnostics(path: string): Promise<vscode.Diagnostic[]> {
    const uri = vscode.Uri.file(path);
    return vscode.languages.getDiagnostics(uri);
  }

  private async getSymbols(path: string): Promise<vscode.DocumentSymbol[]> {
    const uri = vscode.Uri.file(path);
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      uri
    );
    return symbols || [];
  }

  private async runTerminal(command: string): Promise<void> {
    const terminal = vscode.window.createTerminal('Codegent');
    terminal.show();
    terminal.sendText(command);
  }

  public async updateContext(): Promise<void> {
    // Get open files
    this.context.files = vscode.workspace.textDocuments
      .filter(doc => !doc.isUntitled)
      .map(doc => doc.uri.fsPath);

    // Get workspace diagnostics
    this.context.diagnostics = [];
    for (const [uri, diagnostics] of vscode.languages.getDiagnostics()) {
      this.context.diagnostics.push(...diagnostics);
    }
  }

  public getContext(): MCPContext {
    return this.context;
  }

  public buildContextPrompt(): string {
    const parts: string[] = [];

    if (this.context.files.length > 0) {
      parts.push(`Open files: ${this.context.files.join(', ')}`);
    }

    if (this.context.diagnostics.length > 0) {
      const errors = this.context.diagnostics.filter(
        d => d.severity === vscode.DiagnosticSeverity.Error
      );
      const warnings = this.context.diagnostics.filter(
        d => d.severity === vscode.DiagnosticSeverity.Warning
      );

      if (errors.length > 0) {
        parts.push(`Errors: ${errors.length}`);
      }
      if (warnings.length > 0) {
        parts.push(`Warnings: ${warnings.length}`);
      }
    }

    return parts.join('\n');
  }
}

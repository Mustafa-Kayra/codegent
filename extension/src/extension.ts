import * as vscode from 'vscode';
import { CodegentInlineCompletionProvider } from './providers/inlineCompletionProvider';
import { ChatViewProvider } from './providers/chatViewProvider';
import { MCPProvider } from './providers/mcpProvider';
import { AIService } from './services/aiService';
import { DatabaseService } from './services/databaseService';
import { ContextService } from './services/contextService';

let aiService: AIService;
let dbService: DatabaseService;
let contextService: ContextService;
let mcpProvider: MCPProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('Codegent AI Agent is now active!');

  // Initialize services
  aiService = new AIService();
  dbService = new DatabaseService(context);
  contextService = new ContextService();
  mcpProvider = new MCPProvider();

  // Register MCP tools
  registerMCPTools();

  // Register inline completion provider
  const config = vscode.workspace.getConfiguration('codegent');
  if (config.get('enableInlineCompletion', true)) {
    const inlineProvider = new CodegentInlineCompletionProvider(aiService, contextService);
    context.subscriptions.push(
      vscode.languages.registerInlineCompletionItemProvider(
        { pattern: '**' },
        inlineProvider
      )
    );
  }

  // Register chat view provider
  const chatProvider = new ChatViewProvider(context.extensionUri, aiService, dbService);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('codegentChat', chatProvider)
  );

  // Register commands
  registerCommands(context, chatProvider);

  // Show welcome message
  vscode.window.showInformationMessage('Codegent AI Agent activated! Press Ctrl+Shift+C to open chat.');
}

function registerCommands(context: vscode.ExtensionContext, chatProvider: ChatViewProvider) {
  // Open Chat
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.openChat', () => {
      vscode.commands.executeCommand('codegentChat.focus');
    })
  );

  // Explain Code
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.explainCode', async () => {
      const selection = getSelectedText();
      if (selection) {
        await processWithAI('Explain this code in detail:', selection);
      }
    })
  );

  // Refactor Code
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.refactorCode', async () => {
      const selection = getSelectedText();
      if (selection) {
        await processWithAI('Refactor this code to be cleaner and more efficient:', selection);
      }
    })
  );

  // Fix Code
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.fixCode', async () => {
      const selection = getSelectedText();
      if (selection) {
        await processWithAI('Find and fix any bugs or issues in this code:', selection);
      }
    })
  );

  // Generate Tests
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.generateTests', async () => {
      const selection = getSelectedText();
      if (selection) {
        await processWithAI('Generate comprehensive unit tests for this code:', selection);
      }
    })
  );

  // Add Comments
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.addComments', async () => {
      const selection = getSelectedText();
      if (selection) {
        await processWithAI('Add detailed comments to this code explaining what each part does:', selection);
      }
    })
  );

  // Compare Models
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.compareModels', async () => {
      const selection = getSelectedText();
      if (selection) {
        await compareModels(selection);
      } else {
        vscode.window.showWarningMessage('Please select some code first.');
      }
    })
  );
}

function getSelectedText(): string | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found.');
    return null;
  }

  const selection = editor.selection;
  if (selection.isEmpty) {
    vscode.window.showWarningMessage('Please select some code first.');
    return null;
  }

  return editor.document.getText(selection);
}

async function processWithAI(prompt: string, code: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const language = editor.document.languageId;
  const fullPrompt = `${prompt}\n\n\`\`\`${language}\n${code}\n\`\`\``;

  try {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Codegent AI',
        cancellable: true
      },
      async (progress, token) => {
        progress.report({ message: 'Processing...' });

        const config = vscode.workspace.getConfiguration('codegent');
        const model = config.get<string>('model', 'openrouter:openai/gpt-4o');

        const response = await aiService.chat(fullPrompt, model);

        // Create output channel and show response
        const outputChannel = vscode.window.createOutputChannel('Codegent AI');
        outputChannel.clear();
        outputChannel.appendLine('='.repeat(50));
        outputChannel.appendLine(`Model: ${model}`);
        outputChannel.appendLine('='.repeat(50));
        outputChannel.appendLine('');
        outputChannel.appendLine(response);
        outputChannel.show();
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Codegent AI Error: ${error}`);
  }
}

async function compareModels(code: string) {
  const models = [
    { id: 'openrouter:openai/gpt-4o', name: 'GPT-4o' },
    { id: 'openrouter:anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'openrouter:google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro' }
  ];

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const language = editor.document.languageId;
  const prompt = `Analyze and improve this code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  const outputChannel = vscode.window.createOutputChannel('Codegent Model Comparison');
  outputChannel.clear();
  outputChannel.show();

  for (const model of models) {
    outputChannel.appendLine('='.repeat(60));
    outputChannel.appendLine(`Model: ${model.name}`);
    outputChannel.appendLine('='.repeat(60));
    outputChannel.appendLine('');

    try {
      const response = await aiService.chat(prompt, model.id);
      outputChannel.appendLine(response);
    } catch (error) {
      outputChannel.appendLine(`Error: ${error}`);
    }

    outputChannel.appendLine('');
    outputChannel.appendLine('');
  }
}

function registerMCPTools() {
  mcpProvider.registerTool('getCurrentFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return null;
    return {
      path: editor.document.uri.fsPath,
      language: editor.document.languageId,
      content: editor.document.getText()
    };
  });

  mcpProvider.registerTool('getSelectedText', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) return null;
    return editor.document.getText(editor.selection);
  });

  mcpProvider.registerTool('insertText', async (params: { text: string }) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return false;
    await editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.active, params.text);
    });
    return true;
  });

  mcpProvider.registerTool('replaceSelection', async (params: { text: string }) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) return false;
    await editor.edit(editBuilder => {
      editBuilder.replace(editor.selection, params.text);
    });
    return true;
  });

  mcpProvider.registerTool('getWorkspaceFiles', async () => {
    const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**');
    return files.map(f => f.fsPath);
  });

  mcpProvider.registerTool('readFile', async (params: { path: string }) => {
    try {
      const doc = await vscode.workspace.openTextDocument(params.path);
      return doc.getText();
    } catch {
      return null;
    }
  });

  mcpProvider.registerTool('getDiagnostics', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return [];
    const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
    return diagnostics.map(d => ({
      message: d.message,
      severity: vscode.DiagnosticSeverity[d.severity],
      range: {
        start: { line: d.range.start.line, character: d.range.start.character },
        end: { line: d.range.end.line, character: d.range.end.character }
      }
    }));
  });
}

export function deactivate() {
  console.log('Codegent AI Agent deactivated.');
}

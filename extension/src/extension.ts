/**
 * Codegent VS Code Extension - Main Entry Point
 * AI-powered code completion and chat
 */

import * as vscode from 'vscode';
import { InlineCompletionProvider } from './providers/inlineCompletionProvider';
import { ChatViewProvider } from './providers/chatViewProvider';
import { MCPProvider } from './providers/mcpProvider';
import { AIService } from './services/aiService';
import { StorageService } from './services/storageService';
import { ContextService } from './services/contextService';

let aiService: AIService;
let storageService: StorageService;
let contextService: ContextService;
let chatViewProvider: ChatViewProvider;
let inlineCompletionProvider: InlineCompletionProvider;
let mcpProvider: MCPProvider;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  console.log('Codegent AI Agent is activating...');

  // Initialize services
  storageService = new StorageService(context);
  aiService = new AIService(storageService);
  contextService = new ContextService();
  mcpProvider = new MCPProvider(aiService);

  // Initialize with timeout (3 seconds like the web app)
  const initSuccess = await initializeWithTimeout(3000);
  
  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(hubot) Codegent';
  statusBarItem.tooltip = 'Codegent AI Agent - Click to open chat';
  statusBarItem.command = 'codegent.openChat';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register chat view provider
  chatViewProvider = new ChatViewProvider(
    context.extensionUri,
    aiService,
    storageService,
    contextService
  );
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'codegentChat',
      chatViewProvider
    )
  );

  // Register inline completion provider if enabled
  const config = vscode.workspace.getConfiguration('codegent');
  if (config.get('enableInlineCompletion', true)) {
    inlineCompletionProvider = new InlineCompletionProvider(
      aiService,
      contextService
    );
    
    context.subscriptions.push(
      vscode.languages.registerInlineCompletionItemProvider(
        { pattern: '**' },
        inlineCompletionProvider
      )
    );
  }

  // Register commands
  registerCommands(context);

  // Update status bar based on auth state
  updateStatusBar();

  console.log('Codegent AI Agent activated successfully!');
}

async function initializeWithTimeout(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('Codegent: Initialization timeout, running in guest mode');
      resolve(false);
    }, timeoutMs);

    // Try to initialize
    aiService.initialize()
      .then((success) => {
        clearTimeout(timeout);
        resolve(success);
      })
      .catch(() => {
        clearTimeout(timeout);
        resolve(false);
      });
  });
}

function registerCommands(context: vscode.ExtensionContext) {
  // Open Chat command
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.openChat', () => {
      vscode.commands.executeCommand('codegentChat.focus');
    })
  );

  // Explain Code command
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.explainCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      
      if (!selectedText) {
        vscode.window.showWarningMessage('No text selected');
        return;
      }

      await handleCodeAction('explain', selectedText, editor.document.languageId);
    })
  );

  // Refactor Code command
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.refactorCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      
      if (!selectedText) {
        vscode.window.showWarningMessage('No text selected');
        return;
      }

      await handleCodeAction('refactor', selectedText, editor.document.languageId);
    })
  );

  // Fix Code command
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.fixCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      
      if (!selectedText) {
        vscode.window.showWarningMessage('No text selected');
        return;
      }

      await handleCodeAction('fix', selectedText, editor.document.languageId);
    })
  );

  // Generate Tests command
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.generateTests', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      
      if (!selectedText) {
        vscode.window.showWarningMessage('No text selected');
        return;
      }

      await handleCodeAction('test', selectedText, editor.document.languageId);
    })
  );

  // Add Comments command
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.addComments', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      
      if (!selectedText) {
        vscode.window.showWarningMessage('No text selected');
        return;
      }

      await handleCodeAction('comment', selectedText, editor.document.languageId);
    })
  );

  // Sign In command
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.signIn', async () => {
      await aiService.signIn();
      updateStatusBar();
    })
  );

  // Sign Out command
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.signOut', async () => {
      await aiService.signOut();
      updateStatusBar();
    })
  );

  // Select Model command
  context.subscriptions.push(
    vscode.commands.registerCommand('codegent.selectModel', async () => {
      const models = aiService.getAvailableModels();
      const currentModel = aiService.getCurrentModel();

      const items = models.map(m => ({
        label: `${m.id === currentModel ? '$(check) ' : ''}${m.name}`,
        description: m.provider,
        detail: m.requiresAuth ? '🔐 Requires authentication' : '✓ Free',
        modelId: m.id
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select AI Model',
        title: 'Codegent - Select AI Model'
      });

      if (selected) {
        aiService.setModel(selected.modelId);
        vscode.window.showInformationMessage(`Model changed to ${selected.label.replace('$(check) ', '')}`);
      }
    })
  );
}

async function handleCodeAction(
  action: 'explain' | 'refactor' | 'fix' | 'test' | 'comment',
  code: string,
  language: string
) {
  const prompts: Record<string, string> = {
    explain: `Explain the following ${language} code in detail:\n\n\`\`\`${language}\n${code}\n\`\`\``,
    refactor: `Refactor the following ${language} code to make it cleaner and more efficient. Provide only the refactored code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
    fix: `Fix any bugs or issues in the following ${language} code. Explain what was wrong and provide the corrected code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
    test: `Generate unit tests for the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
    comment: `Add comprehensive comments to the following ${language} code. Return the code with added comments:\n\n\`\`\`${language}\n${code}\n\`\`\``
  };

  const prompt = prompts[action];
  
  // Show progress
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Codegent: ${action.charAt(0).toUpperCase() + action.slice(1)}ing code...`,
      cancellable: true
    },
    async (progress, token) => {
      try {
        const response = await aiService.chat(prompt);
        
        if (token.isCancellationRequested) return;

        // Send to chat panel
        if (chatViewProvider) {
          chatViewProvider.addMessage('assistant', response);
        }

        // For refactor, fix, and comment - offer to replace selection
        if (['refactor', 'fix', 'comment'].includes(action)) {
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
            if (codeMatch) {
              const newCode = codeMatch[1];
              const replace = await vscode.window.showInformationMessage(
                'Replace selected code with AI suggestion?',
                'Replace',
                'Cancel'
              );
              
              if (replace === 'Replace') {
                await editor.edit(editBuilder => {
                  editBuilder.replace(editor.selection, newCode);
                });
              }
            }
          }
        }

        // Show in output channel
        const outputChannel = vscode.window.createOutputChannel('Codegent');
        outputChannel.appendLine(`=== ${action.toUpperCase()} ===`);
        outputChannel.appendLine(response);
        outputChannel.show(true);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Codegent error: ${errorMessage}`);
      }
    }
  );
}

function updateStatusBar() {
  const isSignedIn = aiService.isAuthenticated();
  const currentModel = aiService.getCurrentModel();
  
  statusBarItem.text = isSignedIn 
    ? `$(verified) Codegent (${currentModel})`
    : `$(unverified) Codegent (Guest)`;
  
  statusBarItem.tooltip = isSignedIn
    ? `Codegent AI Agent - Signed In\nModel: ${currentModel}`
    : 'Codegent AI Agent - Guest Mode\nClick to open chat';
}

export function deactivate() {
  console.log('Codegent AI Agent deactivated');
}

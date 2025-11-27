import * as vscode from 'vscode';
import { AIService } from '../services/aiService';
import { ContextService } from '../services/contextService';

export class CodegentInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private aiService: AIService;
  private contextService: ContextService;
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastCompletion: string = '';
  private lastPosition: vscode.Position | null = null;

  constructor(aiService: AIService, contextService: ContextService) {
    this.aiService = aiService;
    this.contextService = contextService;
  }

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionList | null> {
    // Check if inline completion is enabled
    const config = vscode.workspace.getConfiguration('codegent');
    if (!config.get('enableInlineCompletion', true)) {
      return null;
    }

    // Get delay setting
    const delay = config.get('inlineCompletionDelay', 500);

    // Debounce
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    return new Promise((resolve) => {
      this.debounceTimer = setTimeout(async () => {
        if (token.isCancellationRequested) {
          resolve(null);
          return;
        }

        try {
          const completion = await this.getCompletion(document, position, token);
          
          if (!completion || token.isCancellationRequested) {
            resolve(null);
            return;
          }

          resolve({
            items: [{
              insertText: completion,
              range: new vscode.Range(position, position)
            }]
          });
        } catch (error) {
          console.error('Codegent inline completion error:', error);
          resolve(null);
        }
      }, delay);
    });
  }

  private async getCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<string | null> {
    const config = vscode.workspace.getConfiguration('codegent');
    const model = config.get<string>('model', 'openrouter:openai/gpt-4o');
    const maxTokens = config.get('maxCompletionTokens', 256);

    // Get context before cursor
    const contextRange = this.contextService.getContextRange(document, position);
    const textBeforeCursor = document.getText(contextRange);

    // Get the current line text after cursor for better completion
    const lineAfterCursor = document.lineAt(position.line).text.substring(position.character);

    // Skip if cursor is in the middle of a word
    if (/^\w/.test(lineAfterCursor)) {
      return null;
    }

    // Skip if too little context
    if (textBeforeCursor.trim().length < 5) {
      return null;
    }

    const language = document.languageId;
    const fileName = document.fileName.split(/[\\/]/).pop() || 'unknown';

    const prompt = this.buildCompletionPrompt(textBeforeCursor, language, fileName);

    if (token.isCancellationRequested) {
      return null;
    }

    try {
      const completion = await this.aiService.complete(prompt, model, maxTokens);
      
      if (!completion || completion.trim().length === 0) {
        return null;
      }

      // Clean up the completion
      return this.cleanCompletion(completion);
    } catch (error) {
      console.error('Completion error:', error);
      return null;
    }
  }

  private buildCompletionPrompt(code: string, language: string, fileName: string): string {
    return `You are an expert ${language} programmer. Complete the code below.
Only provide the completion text, nothing else. Do not repeat the existing code.
Do not include markdown code blocks. Just output the raw code to insert.

File: ${fileName}
Language: ${language}

${code}`;
  }

  private cleanCompletion(completion: string): string {
    // Remove markdown code blocks if present
    let cleaned = completion
      .replace(/^```[\w]*\n?/gm, '')
      .replace(/\n?```$/gm, '');

    // Remove leading/trailing whitespace from each line but preserve structure
    const lines = cleaned.split('\n');
    
    // If first line is empty, remove it
    if (lines.length > 0 && lines[0].trim() === '') {
      lines.shift();
    }

    // Limit to reasonable length
    if (lines.length > 20) {
      lines.length = 20;
    }

    return lines.join('\n');
  }
}

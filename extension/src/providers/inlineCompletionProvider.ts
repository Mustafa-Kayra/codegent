/**
 * Inline Completion Provider
 * Provides AI-powered code completions as you type
 */

import * as vscode from 'vscode';
import { AIService } from '../services/aiService';
import { ContextService } from '../services/contextService';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastPosition: vscode.Position | null = null;
  private cachedCompletions: Map<string, string> = new Map();

  constructor(
    private aiService: AIService,
    private contextService: ContextService
  ) {}

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionList | undefined> {
    // Get configuration
    const config = vscode.workspace.getConfiguration('codegent');
    const debounceDelay = config.get<number>('completionDebounce', 300);
    const contextLines = config.get<number>('contextLines', 100);

    // Check if we should skip (triggered by some events we don't want)
    if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic) {
      // Skip if cursor hasn't moved significantly
      if (this.lastPosition && 
          this.lastPosition.line === position.line &&
          Math.abs(this.lastPosition.character - position.character) < 2) {
        return undefined;
      }
    }

    this.lastPosition = position;

    // Skip certain scenarios
    if (this.shouldSkipCompletion(document, position)) {
      return undefined;
    }

    // Debounce the request
    return new Promise((resolve) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(async () => {
        if (token.isCancellationRequested) {
          resolve(undefined);
          return;
        }

        try {
          const completion = await this.getCompletion(document, position, contextLines);
          
          if (token.isCancellationRequested || !completion) {
            resolve(undefined);
            return;
          }

          const completionItem = new vscode.InlineCompletionItem(
            completion,
            new vscode.Range(position, position)
          );

          resolve({
            items: [completionItem]
          });
        } catch (error) {
          console.error('Inline completion error:', error);
          resolve(undefined);
        }
      }, debounceDelay);
    });
  }

  private shouldSkipCompletion(
    document: vscode.TextDocument,
    position: vscode.Position
  ): boolean {
    const line = document.lineAt(position.line);
    const lineText = line.text;
    const textBeforeCursor = lineText.substring(0, position.character);

    // Skip if line is empty or only whitespace
    if (textBeforeCursor.trim().length === 0) {
      return true;
    }

    // Skip if in a comment
    if (this.isInComment(document, position)) {
      return true;
    }

    // Skip if in a string (unless at the end)
    if (this.isInString(document, position)) {
      return true;
    }

    return false;
  }

  private isInComment(
    document: vscode.TextDocument,
    position: vscode.Position
  ): boolean {
    const line = document.lineAt(position.line).text;
    const beforeCursor = line.substring(0, position.character);

    // Check for single-line comment patterns
    const commentPatterns = ['//', '#', '--', "'", '/*'];
    
    for (const pattern of commentPatterns) {
      if (beforeCursor.includes(pattern)) {
        // Check if we're actually after the comment start
        const commentIndex = beforeCursor.lastIndexOf(pattern);
        if (commentIndex >= 0 && commentIndex < position.character) {
          return true;
        }
      }
    }

    return false;
  }

  private isInString(
    document: vscode.TextDocument,
    position: vscode.Position
  ): boolean {
    const line = document.lineAt(position.line).text;
    const beforeCursor = line.substring(0, position.character);

    // Count quotes to determine if we're inside a string
    let singleQuotes = 0;
    let doubleQuotes = 0;
    let backticks = 0;

    for (let i = 0; i < beforeCursor.length; i++) {
      const char = beforeCursor[i];
      const prevChar = i > 0 ? beforeCursor[i - 1] : '';

      if (prevChar !== '\\') {
        if (char === "'") singleQuotes++;
        if (char === '"') doubleQuotes++;
        if (char === '`') backticks++;
      }
    }

    // If any quote count is odd, we're inside a string
    return singleQuotes % 2 !== 0 || 
           doubleQuotes % 2 !== 0 || 
           backticks % 2 !== 0;
  }

  private async getCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    contextLines: number
  ): Promise<string | undefined> {
    // Get context before cursor
    const startLine = Math.max(0, position.line - contextLines);
    const endLine = position.line;
    
    const contextBefore = document.getText(
      new vscode.Range(
        new vscode.Position(startLine, 0),
        position
      )
    );

    // Get context after cursor (for better understanding)
    const afterLines = Math.min(document.lineCount - 1, position.line + 10);
    const contextAfter = document.getText(
      new vscode.Range(
        position,
        new vscode.Position(afterLines, document.lineAt(afterLines).text.length)
      )
    );

    // Build the prompt
    const languageId = document.languageId;
    const fileName = document.fileName.split('/').pop() || 'file';

    const prompt = this.buildCompletionPrompt(
      contextBefore,
      contextAfter,
      languageId,
      fileName
    );

    // Check cache
    const cacheKey = `${document.uri.toString()}:${position.line}:${position.character}`;
    if (this.cachedCompletions.has(cacheKey)) {
      return this.cachedCompletions.get(cacheKey);
    }

    // Call AI service
    const completion = await this.aiService.getCompletion(prompt, languageId);

    // Cache the result
    if (completion) {
      this.cachedCompletions.set(cacheKey, completion);
      
      // Clear old cache entries
      if (this.cachedCompletions.size > 100) {
        const firstKey = this.cachedCompletions.keys().next().value;
        if (firstKey !== undefined) {
          this.cachedCompletions.delete(firstKey);
        }
      }
    }

    return completion;
  }

  private buildCompletionPrompt(
    contextBefore: string,
    contextAfter: string,
    languageId: string,
    fileName: string
  ): string {
    return `You are a code completion assistant. Complete the code at the cursor position.

File: ${fileName}
Language: ${languageId}

Code before cursor:
\`\`\`${languageId}
${contextBefore}
\`\`\`

Code after cursor:
\`\`\`${languageId}
${contextAfter}
\`\`\`

Instructions:
1. Provide ONLY the code completion, no explanations
2. Complete the current line or statement
3. Keep the completion concise (1-3 lines typically)
4. Match the existing code style
5. Do not repeat the context

Completion:`;
  }

  public clearCache(): void {
    this.cachedCompletions.clear();
  }
}

/**
 * AI Service
 * Handles all AI API calls with smart authentication
 */

import * as vscode from 'vscode';
import { StorageService } from './storageService';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  requiresAuth: boolean;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  private isSignedIn: boolean = false;
  private currentModel: string = 'gpt-4o';
  private puterApiUrl: string = 'https://api.puter.com';
  private authToken: string | null = null;

  // 33 AI Models
  private readonly models: AIModel[] = [
    // OpenAI Models
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', requiresAuth: false },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', requiresAuth: false },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', requiresAuth: false },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', requiresAuth: false },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', requiresAuth: false },
    { id: 'o1-preview', name: 'O1 Preview', provider: 'OpenAI', requiresAuth: true },
    { id: 'o1-mini', name: 'O1 Mini', provider: 'OpenAI', requiresAuth: true },

    // Anthropic Models
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', requiresAuth: false },
    { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', requiresAuth: false },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', requiresAuth: true },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', requiresAuth: false },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', requiresAuth: false },

    // Google Models
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', requiresAuth: false },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', requiresAuth: false },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', requiresAuth: false },

    // Meta Models
    { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta', requiresAuth: false },
    { id: 'llama-3.2-90b-vision', name: 'Llama 3.2 90B Vision', provider: 'Meta', requiresAuth: false },
    { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta', requiresAuth: true },
    { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', requiresAuth: false },
    { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta', requiresAuth: false },

    // Mistral Models
    { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', requiresAuth: false },
    { id: 'mistral-nemo', name: 'Mistral Nemo', provider: 'Mistral', requiresAuth: false },
    { id: 'codestral', name: 'Codestral', provider: 'Mistral', requiresAuth: false },
    { id: 'pixtral', name: 'Pixtral', provider: 'Mistral', requiresAuth: false },

    // DeepSeek Models
    { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', requiresAuth: false },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'DeepSeek', requiresAuth: false },

    // Qwen Models
    { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'Alibaba', requiresAuth: false },
    { id: 'qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder 32B', provider: 'Alibaba', requiresAuth: false },
    { id: 'qwq-32b', name: 'QwQ 32B', provider: 'Alibaba', requiresAuth: false },

    // Other Models
    { id: 'grok-2', name: 'Grok 2', provider: 'xAI', requiresAuth: true },
    { id: 'grok-beta', name: 'Grok Beta', provider: 'xAI', requiresAuth: true },
    { id: 'phi-3-medium', name: 'Phi 3 Medium', provider: 'Microsoft', requiresAuth: false },
    { id: 'command-r-plus', name: 'Command R+', provider: 'Cohere', requiresAuth: false }
  ];

  constructor(private storageService: StorageService) {
    this.loadSettings();
  }

  private async loadSettings() {
    const savedModel = await this.storageService.get<string>('currentModel');
    if (savedModel) {
      this.currentModel = savedModel;
    }

    const savedToken = await this.storageService.getSecret('authToken');
    if (savedToken) {
      this.authToken = savedToken;
      this.isSignedIn = true;
    }
  }

  public async initialize(): Promise<boolean> {
    await this.loadSettings();
    return this.isSignedIn;
  }

  public getAvailableModels(): AIModel[] {
    return this.models;
  }

  public getCurrentModel(): string {
    return this.currentModel;
  }

  public setModel(modelId: string): void {
    const model = this.models.find(m => m.id === modelId);
    if (model) {
      this.currentModel = modelId;
      this.storageService.set('currentModel', modelId);
    }
  }

  public isAuthenticated(): boolean {
    return this.isSignedIn;
  }

  public async signIn(): Promise<boolean> {
    try {
      // Open Puter sign in page
      const result = await vscode.window.showInputBox({
        prompt: 'Enter your Puter API token (get it from puter.com)',
        password: true,
        ignoreFocusOut: true
      });

      if (result) {
        this.authToken = result;
        this.isSignedIn = true;
        await this.storageService.setSecret('authToken', result);
        vscode.window.showInformationMessage('Codegent: Signed in successfully!');
        return true;
      }
    } catch (error) {
      vscode.window.showErrorMessage('Codegent: Sign in failed');
    }
    return false;
  }

  public async signOut(): Promise<void> {
    this.authToken = null;
    this.isSignedIn = false;
    await this.storageService.deleteSecret('authToken');
    vscode.window.showInformationMessage('Codegent: Signed out');
  }

  private isAuthError(error: Error): boolean {
    const msg = error.message.toLowerCase();
    return msg.includes('auth') ||
           msg.includes('login') ||
           msg.includes('sign in') ||
           msg.includes('permission') ||
           msg.includes('unauthorized') ||
           msg.includes('401');
  }

  public async chat(
    prompt: string | ChatMessage[],
    modelId?: string
  ): Promise<string> {
    const model = modelId || this.currentModel;
    const modelInfo = this.models.find(m => m.id === model);

    // Check if model requires auth
    if (modelInfo?.requiresAuth && !this.isSignedIn) {
      const result = await vscode.window.showWarningMessage(
        `The model "${modelInfo.name}" requires authentication. Would you like to sign in?`,
        'Sign In',
        'Use Free Model'
      );

      if (result === 'Sign In') {
        const success = await this.signIn();
        if (!success) {
          // Fallback to free model
          return this.chat(prompt, 'gpt-4o');
        }
      } else {
        // Use fallback model
        return this.chat(prompt, 'gpt-4o');
      }
    }

    try {
      const response = await this.callPuterAI(prompt, model);
      return response;
    } catch (error) {
      if (error instanceof Error && this.isAuthError(error) && !this.isSignedIn) {
        const result = await vscode.window.showWarningMessage(
          'This request requires authentication. Would you like to sign in?',
          'Sign In',
          'Cancel'
        );

        if (result === 'Sign In') {
          const success = await this.signIn();
          if (success) {
            return this.callPuterAI(prompt, model);
          }
        }

        // Fallback to free model
        return this.callPuterAI(prompt, 'gpt-4o');
      }
      throw error;
    }
  }

  private async callPuterAI(
    prompt: string | ChatMessage[],
    model: string
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration('codegent');
    const maxTokens = config.get<number>('maxTokens', 2048);

    const messages: ChatMessage[] = typeof prompt === 'string'
      ? [
          {
            role: 'system',
            content: 'You are Codegent AI, a helpful coding assistant. Provide clear, concise, and accurate code help.'
          },
          { role: 'user', content: prompt }
        ]
      : prompt;

    /**
     * MOCK IMPLEMENTATION FOR DEVELOPMENT
     * 
     * This is a temporary mock implementation that simulates AI responses.
     * In production, this should be replaced with actual API calls to:
     * - Puter API (https://api.puter.com) for hosted AI services
     * - Or direct API calls to OpenAI, Anthropic, etc.
     * 
     * To implement real API calls:
     * 1. Add axios as a dependency: npm install axios
     * 2. Use axios to make HTTP requests to the AI provider
     * 3. Handle authentication tokens from the Puter SDK
     */
    
    // Simulate API call with mock responses
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Return a helpful mock response based on the user's query
          const userMessage = messages.find(m => m.role === 'user')?.content || '';
          
          if (userMessage.toLowerCase().includes('explain')) {
            resolve(`## Code Explanation

This code performs the following operations:

1. **Initialization**: Sets up the necessary variables and state
2. **Processing**: Iterates through the data and applies transformations
3. **Output**: Returns the processed result

### Key Points
- The algorithm has O(n) time complexity
- Memory usage is optimized for large datasets
- Error handling is implemented for edge cases

Would you like me to elaborate on any specific part?`);
          } else if (userMessage.toLowerCase().includes('refactor')) {
            resolve(`## Refactored Code

Here's an improved version with better practices:

\`\`\`typescript
// Refactored with improved readability and performance
function processData(items: Item[]): Result[] {
  return items
    .filter(item => item.isValid)
    .map(item => transformItem(item))
    .sort((a, b) => a.priority - b.priority);
}
\`\`\`

### Improvements Made
1. Used functional programming patterns
2. Added type annotations
3. Improved naming conventions
4. Reduced cognitive complexity`);
          } else if (userMessage.toLowerCase().includes('fix')) {
            resolve(`## Bug Fix

I found the following issues:

1. **Off-by-one error** in the loop condition
2. **Null check missing** before accessing property
3. **Type coercion issue** with the comparison

### Fixed Code

\`\`\`typescript
// Fixed version
function fixedFunction(data: Data): Result {
  if (!data || !data.items) {
    return { success: false, error: 'Invalid data' };
  }
  
  for (let i = 0; i < data.items.length; i++) {
    // Fixed loop boundary
    processItem(data.items[i]);
  }
  
  return { success: true };
}
\`\`\`

The main issue was the loop running one iteration too many.`);
          } else if (userMessage.toLowerCase().includes('test')) {
            resolve(`## Generated Tests

\`\`\`typescript
import { describe, it, expect, vi } from 'vitest';

describe('YourFunction', () => {
  it('should handle valid input correctly', () => {
    const input = { data: [1, 2, 3] };
    const result = yourFunction(input);
    expect(result).toEqual({ success: true, count: 3 });
  });

  it('should handle empty input', () => {
    const input = { data: [] };
    const result = yourFunction(input);
    expect(result).toEqual({ success: true, count: 0 });
  });

  it('should throw on null input', () => {
    expect(() => yourFunction(null)).toThrow('Invalid input');
  });

  it('should handle edge cases', () => {
    const input = { data: [undefined, null, 0] };
    const result = yourFunction(input);
    expect(result.count).toBe(1);
  });
});
\`\`\`

These tests cover the main functionality and edge cases.`);
          } else {
            resolve(`I understand you're asking about: "${userMessage.substring(0, 100)}..."

Here's my response:

As Codegent AI, I'm here to help with your coding needs. I can:

- **Explain code** - Break down complex logic
- **Refactor code** - Improve code quality
- **Fix bugs** - Identify and resolve issues
- **Generate tests** - Create comprehensive test suites
- **Add comments** - Document your code

How can I assist you with your code today?`);
          }
        } catch {
          reject(new Error('Failed to process request'));
        }
      }, 500 + Math.random() * 1000);
    });
  }

  public async getCompletion(
    prompt: string,
    languageId: string
  ): Promise<string | undefined> {
    try {
      const systemPrompt = `You are a code completion assistant. Complete the code naturally.
Language: ${languageId}
Rules:
1. Only output the completion, no explanations
2. Keep completions concise (1-3 lines)
3. Match the existing code style
4. Don't repeat the prompt`;

      const response = await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]);

      // Extract just the code completion
      const lines = response.split('\n');
      const codeLine = lines.find(line => 
        !line.startsWith('#') && 
        !line.startsWith('//') && 
        !line.startsWith('```') &&
        line.trim().length > 0
      );

      return codeLine?.trim();
    } catch (error) {
      console.error('Completion error:', error);
      return undefined;
    }
  }
}

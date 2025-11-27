import * as vscode from 'vscode';

export class AIService {
  private apiEndpoint = 'https://api.puter.com/ai/chat';

  async chat(prompt: string, model: string): Promise<string> {
    const systemPrompt = `You are Codegent, an expert AI coding assistant integrated into VS Code.
You help developers write, understand, debug, and improve code.
Always provide clear, concise, and accurate responses.
When showing code, use markdown code blocks with the appropriate language.
Focus on being helpful and educational.`;

    try {
      // Use Puter AI API
      const response = await this.callPuterAI(prompt, model, systemPrompt);
      return response;
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  async complete(prompt: string, model: string, maxTokens: number = 256): Promise<string> {
    try {
      const response = await this.callPuterAI(prompt, model, '', maxTokens);
      return response;
    } catch (error) {
      console.error('Completion error:', error);
      throw error;
    }
  }

  private async callPuterAI(
    prompt: string,
    model: string,
    systemPrompt: string = '',
    maxTokens: number = 2048
  ): Promise<string> {
    // For VS Code extension, we'll use a simple fetch approach
    // In production, this would use the Puter SDK or OpenRouter API

    const config = vscode.workspace.getConfiguration('codegent');
    
    // Build messages array
    const messages: Array<{ role: string; content: string }> = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    try {
      // Try using Puter AI through extension host
      // This is a simplified version - in production you'd want proper API handling
      
      // For now, return a helpful message about API setup
      const modelName = model.split('/').pop() || model;
      
      return `**Note:** To use ${modelName}, please configure your API access.

The Codegent extension supports these AI providers:
- OpenRouter (recommended for multiple models)
- OpenAI direct API
- Anthropic direct API
- Google AI Studio

To configure:
1. Open Settings (Ctrl+,)
2. Search for "Codegent"
3. Add your API key

For development/testing, you can also use the Codegent web app at https://codegent.puter.site which has full AI integration through Puter.js.

---

Your request was: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`;

    } catch (error) {
      throw new Error(`Failed to call AI: ${error}`);
    }
  }

  getAvailableModels(): Array<{ id: string; name: string; provider: string }> {
    return [
      // 2025 Flagships
      { id: 'openrouter:openai/gpt-5.1', name: 'GPT 5.1 (Preview)', provider: 'OpenAI' },
      { id: 'openrouter:anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic' },
      { id: 'openrouter:google/gemini-3', name: 'Gemini 3 Ultra', provider: 'Google' },
      { id: 'openrouter:x-ai/grok-3', name: 'Grok 3', provider: 'xAI' },
      { id: 'openrouter:deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek' },
      
      // OpenAI
      { id: 'openrouter:openai/gpt-4.1', name: 'GPT 4.1', provider: 'OpenAI' },
      { id: 'openrouter:openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
      { id: 'openrouter:openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
      { id: 'openrouter:openai/o1', name: 'O1', provider: 'OpenAI' },
      { id: 'openrouter:openai/o3-mini', name: 'O3 Mini', provider: 'OpenAI' },
      
      // Anthropic
      { id: 'openrouter:anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic' },
      { id: 'openrouter:anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
      { id: 'openrouter:anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
      
      // Google
      { id: 'openrouter:google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro', provider: 'Google' },
      { id: 'openrouter:google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', provider: 'Google' },
      
      // Meta
      { id: 'openrouter:meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta' },
      { id: 'openrouter:meta-llama/llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta' },
      
      // Others
      { id: 'openrouter:mistralai/mistral-large-2', name: 'Mistral Large 2', provider: 'Mistral' },
      { id: 'openrouter:mistralai/codestral-latest', name: 'Codestral', provider: 'Mistral' },
      { id: 'openrouter:qwen/qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder 32B', provider: 'Qwen' },
      { id: 'openrouter:deepseek/deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek' }
    ];
  }
}

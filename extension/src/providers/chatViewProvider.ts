import * as vscode from 'vscode';
import { AIService } from '../services/aiService';
import { DatabaseService } from '../services/databaseService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: number;
}

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'codegentChat';

  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;
  private aiService: AIService;
  private dbService: DatabaseService;
  private chatHistory: ChatMessage[] = [];

  constructor(
    extensionUri: vscode.Uri,
    aiService: AIService,
    dbService: DatabaseService
  ) {
    this._extensionUri = extensionUri;
    this.aiService = aiService;
    this.dbService = dbService;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlContent();

    // Load chat history
    this.loadChatHistory();

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'chat':
          await this.handleChatMessage(message.text);
          break;
        case 'regenerate':
          await this.regenerateWithModel(message.index, message.model);
          break;
        case 'clear':
          this.clearChat();
          break;
        case 'insertCode':
          await this.insertCode(message.code);
          break;
        case 'copyCode':
          await vscode.env.clipboard.writeText(message.code);
          vscode.window.showInformationMessage('Code copied to clipboard!');
          break;
      }
    });
  }

  private async handleChatMessage(text: string) {
    if (!this._view) return;

    const config = vscode.workspace.getConfiguration('codegent');
    const model = config.get<string>('model', 'openrouter:openai/gpt-4o');

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    this.chatHistory.push(userMessage);

    // Update UI with user message
    this._view.webview.postMessage({
      type: 'addMessage',
      message: userMessage
    });

    // Show loading
    this._view.webview.postMessage({ type: 'loading', show: true });

    try {
      // Get current file context
      const editor = vscode.window.activeTextEditor;
      let context = '';
      if (editor) {
        const language = editor.document.languageId;
        const selectedText = editor.document.getText(editor.selection);
        if (selectedText) {
          context = `\n\nCurrently selected code:\n\`\`\`${language}\n${selectedText}\n\`\`\``;
        } else {
          const fullText = editor.document.getText();
          if (fullText.length < 5000) {
            context = `\n\nCurrent file (${editor.document.fileName}):\n\`\`\`${language}\n${fullText}\n\`\`\``;
          }
        }
      }

      const fullPrompt = text + context;
      const response = await this.aiService.chat(fullPrompt, model);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        model: model,
        timestamp: Date.now()
      };
      this.chatHistory.push(assistantMessage);

      // Save to database
      await this.saveChatHistory();

      // Update UI
      this._view.webview.postMessage({
        type: 'addMessage',
        message: assistantMessage
      });
    } catch (error) {
      this._view.webview.postMessage({
        type: 'addMessage',
        message: {
          role: 'assistant',
          content: `Error: ${error}`,
          timestamp: Date.now()
        }
      });
    }

    this._view.webview.postMessage({ type: 'loading', show: false });
  }

  private async regenerateWithModel(index: number, model: string) {
    if (!this._view || index < 1) return;

    const userMessage = this.chatHistory[index - 1];
    if (userMessage.role !== 'user') return;

    this._view.webview.postMessage({ type: 'loading', show: true });

    try {
      const response = await this.aiService.chat(userMessage.content, model);

      // Update the assistant message
      this.chatHistory[index] = {
        role: 'assistant',
        content: response,
        model: model,
        timestamp: Date.now()
      };

      await this.saveChatHistory();

      // Refresh messages
      this._view.webview.postMessage({
        type: 'refreshMessages',
        messages: this.chatHistory
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Regeneration failed: ${error}`);
    }

    this._view.webview.postMessage({ type: 'loading', show: false });
  }

  private clearChat() {
    this.chatHistory = [];
    this.saveChatHistory();
    if (this._view) {
      this._view.webview.postMessage({
        type: 'refreshMessages',
        messages: []
      });
    }
  }

  private async insertCode(code: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor to insert code.');
      return;
    }

    await editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.active, code);
    });
  }

  private async loadChatHistory() {
    const history = await this.dbService.get('chatHistory');
    if (history) {
      this.chatHistory = history;
      if (this._view) {
        this._view.webview.postMessage({
          type: 'refreshMessages',
          messages: this.chatHistory
        });
      }
    }
  }

  private async saveChatHistory() {
    await this.dbService.set('chatHistory', this.chatHistory);
  }

  private _getHtmlContent(): string {
    const config = vscode.workspace.getConfiguration('codegent');
    const model = config.get<string>('model', 'openrouter:openai/gpt-4o');

    const models = [
      { id: 'openrouter:openai/gpt-5.1', name: 'GPT 5.1' },
      { id: 'openrouter:openai/gpt-4.1', name: 'GPT 4.1' },
      { id: 'openrouter:openai/gpt-4o', name: 'GPT-4o' },
      { id: 'openrouter:openai/gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'openrouter:openai/o1', name: 'O1' },
      { id: 'openrouter:openai/o3-mini', name: 'O3 Mini' },
      { id: 'openrouter:anthropic/claude-opus-4.5', name: 'Claude Opus 4.5' },
      { id: 'openrouter:anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
      { id: 'openrouter:anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'openrouter:google/gemini-3', name: 'Gemini 3 Ultra' },
      { id: 'openrouter:google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro' },
      { id: 'openrouter:x-ai/grok-3', name: 'Grok 3' },
      { id: 'openrouter:deepseek/deepseek-r1', name: 'DeepSeek R1' },
      { id: 'openrouter:meta-llama/llama-4-maverick', name: 'Llama 4 Maverick' }
    ];

    const modelOptions = models.map(m => 
      `<option value="${m.id}" ${m.id === model ? 'selected' : ''}>${m.name}</option>`
    ).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codegent Chat</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      padding: 8px;
      border-bottom: 1px solid var(--vscode-panel-border);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .header select {
      flex: 1;
      padding: 4px 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
    }
    
    .header button {
      padding: 4px 8px;
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .header button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
    
    .message {
      margin-bottom: 12px;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .message-user {
      text-align: right;
    }
    
    .message-user .content {
      display: inline-block;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      padding: 8px 12px;
      border-radius: 12px 12px 4px 12px;
      max-width: 85%;
      text-align: left;
    }
    
    .message-assistant .content {
      background: var(--vscode-editor-inactiveSelectionBackground);
      padding: 8px 12px;
      border-radius: 4px 12px 12px 12px;
    }
    
    .message-assistant pre {
      background: var(--vscode-textCodeBlock-background);
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
      position: relative;
    }
    
    .message-assistant code {
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
    }
    
    .code-actions {
      position: absolute;
      top: 4px;
      right: 4px;
      display: flex;
      gap: 4px;
    }
    
    .code-actions button {
      padding: 2px 6px;
      font-size: 10px;
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }
    
    .regenerate-section {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--vscode-panel-border);
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 11px;
    }
    
    .regenerate-section select {
      padding: 2px 6px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 3px;
      font-size: 11px;
    }
    
    .regenerate-section button {
      padding: 2px 8px;
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    }
    
    .input-area {
      padding: 8px;
      border-top: 1px solid var(--vscode-panel-border);
      display: flex;
      gap: 8px;
    }
    
    .input-area textarea {
      flex: 1;
      padding: 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 6px;
      resize: none;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      min-height: 36px;
      max-height: 120px;
    }
    
    .input-area textarea:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }
    
    .input-area button {
      padding: 8px 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .input-area button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    
    .input-area button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .loading {
      display: none;
      padding: 12px;
      text-align: center;
      color: var(--vscode-descriptionForeground);
    }
    
    .loading.show {
      display: block;
    }
    
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid var(--vscode-progressBar-background);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--vscode-descriptionForeground);
    }
  </style>
</head>
<body>
  <div class="header">
    <select id="model-select">
      ${modelOptions}
    </select>
    <button onclick="clearChat()" title="Clear chat">🗑️</button>
  </div>
  
  <div class="messages" id="messages">
    <div class="empty-state">
      <p>👋 Hi! I'm Codegent AI.</p>
      <p>Ask me anything about coding!</p>
    </div>
  </div>
  
  <div class="loading" id="loading">
    <span class="spinner"></span> Thinking...
  </div>
  
  <div class="input-area">
    <textarea 
      id="input" 
      placeholder="Ask me anything..."
      rows="1"
      onkeydown="handleKeydown(event)"
      oninput="autoResize(this)"
    ></textarea>
    <button onclick="sendMessage()" id="send-btn">Send</button>
  </div>
  
  <script>
    const vscode = acquireVsCodeApi();
    let messages = [];
    
    const models = ${JSON.stringify(models)};
    
    function sendMessage() {
      const input = document.getElementById('input');
      const text = input.value.trim();
      if (!text) return;
      
      input.value = '';
      autoResize(input);
      
      vscode.postMessage({ type: 'chat', text });
    }
    
    function handleKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    }
    
    function autoResize(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    function clearChat() {
      vscode.postMessage({ type: 'clear' });
    }
    
    function regenerate(index, selectEl) {
      const model = selectEl.value;
      vscode.postMessage({ type: 'regenerate', index, model });
    }
    
    function copyCode(code) {
      vscode.postMessage({ type: 'copyCode', code });
    }
    
    function insertCode(code) {
      vscode.postMessage({ type: 'insertCode', code });
    }
    
    function renderMessages() {
      const container = document.getElementById('messages');
      
      if (messages.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>👋 Hi! I\\'m Codegent AI.</p><p>Ask me anything about coding!</p></div>';
        return;
      }
      
      container.innerHTML = messages.map((msg, index) => {
        if (msg.role === 'user') {
          return '<div class="message message-user"><div class="content">' + escapeHtml(msg.content) + '</div></div>';
        } else {
          const modelOptions = models.map(m => 
            '<option value="' + m.id + '"' + (m.id === msg.model ? ' selected' : '') + '>' + m.name + '</option>'
          ).join('');
          
          return '<div class="message message-assistant"><div class="content">' + 
            formatMarkdown(msg.content) + 
            '<div class="regenerate-section">' +
            '<span>🔄 Try another model:</span>' +
            '<select onchange="regenerate(' + index + ', this)">' + modelOptions + '</select>' +
            '</div></div></div>';
        }
      }).join('');
      
      container.scrollTop = container.scrollHeight;
    }
    
    function formatMarkdown(text) {
      // Simple markdown parsing
      return text
        .replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, (match, lang, code) => {
          const escapedCode = escapeHtml(code.trim());
          return '<pre><div class="code-actions"><button onclick="copyCode(\\\'' + escapedCode.replace(/'/g, "\\\\'") + '\\\')">Copy</button><button onclick="insertCode(\\\'' + escapedCode.replace(/'/g, "\\\\'") + '\\\')">Insert</button></div><code>' + escapedCode + '</code></pre>';
        })
        .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
        .replace(/\\n/g, '<br>');
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    window.addEventListener('message', event => {
      const message = event.data;
      
      switch (message.type) {
        case 'addMessage':
          messages.push(message.message);
          renderMessages();
          break;
        case 'refreshMessages':
          messages = message.messages || [];
          renderMessages();
          break;
        case 'loading':
          document.getElementById('loading').classList.toggle('show', message.show);
          document.getElementById('send-btn').disabled = message.show;
          break;
      }
    });
  </script>
</body>
</html>`;
  }
}

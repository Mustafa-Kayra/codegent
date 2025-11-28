/**
 * Chat View Provider
 * Provides the AI chat panel in VS Code sidebar
 */

import * as vscode from 'vscode';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { ContextService } from '../services/contextService';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
}

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'codegentChat';
  private _view?: vscode.WebviewView;
  private chatHistory: ChatMessage[] = [];

  constructor(
    private readonly extensionUri: vscode.Uri,
    private aiService: AIService,
    private storageService: StorageService,
    private contextService: ContextService
  ) {
    // Load chat history
    this.loadChatHistory();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getHtmlContent(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'chat':
          await this.handleChatMessage(message.text);
          break;
        case 'clear':
          this.clearChat();
          break;
        case 'regenerate':
          await this.regenerateLastResponse(message.model);
          break;
        case 'signIn':
          await vscode.commands.executeCommand('codegent.signIn');
          break;
        case 'signOut':
          await vscode.commands.executeCommand('codegent.signOut');
          break;
        case 'selectModel':
          await vscode.commands.executeCommand('codegent.selectModel');
          break;
        case 'insertCode':
          await this.insertCodeToEditor(message.code);
          break;
        case 'copyCode':
          await vscode.env.clipboard.writeText(message.code);
          vscode.window.showInformationMessage('Code copied to clipboard');
          break;
      }
    });

    // Send initial state
    this.sendInitialState();
  }

  private async handleChatMessage(text: string) {
    if (!this._view) return;

    // Add user message to history
    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    this.chatHistory.push(userMessage);

    // Send user message to webview
    this._view.webview.postMessage({
      type: 'message',
      role: 'user',
      content: text
    });

    // Show thinking indicator
    this._view.webview.postMessage({ type: 'thinking', show: true });

    try {
      // Get current editor context if available
      const editorContext = this.contextService.getCurrentEditorContext();
      
      // Build the prompt with context
      const contextPrompt = editorContext 
        ? `Current file: ${editorContext.fileName} (${editorContext.languageId})\n\nSelected code:\n\`\`\`${editorContext.languageId}\n${editorContext.selectedText || editorContext.visibleText}\n\`\`\`\n\n`
        : '';

      const fullPrompt = contextPrompt + text;

      // Call AI
      const response = await this.aiService.chat(fullPrompt);

      // Add assistant message to history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        model: this.aiService.getCurrentModel()
      };
      this.chatHistory.push(assistantMessage);

      // Save chat history
      await this.saveChatHistory();

      // Send response to webview
      this._view.webview.postMessage({
        type: 'message',
        role: 'assistant',
        content: response,
        model: this.aiService.getCurrentModel()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for auth error
      if (errorMessage.toLowerCase().includes('auth') || 
          errorMessage.toLowerCase().includes('sign in')) {
        this._view.webview.postMessage({
          type: 'authRequired'
        });
      }

      this._view.webview.postMessage({
        type: 'error',
        message: errorMessage
      });
    } finally {
      this._view.webview.postMessage({ type: 'thinking', show: false });
    }
  }

  private async regenerateLastResponse(modelId?: string) {
    if (!this._view || this.chatHistory.length < 2) return;

    // Find last user message
    let lastUserIndex = -1;
    for (let i = this.chatHistory.length - 1; i >= 0; i--) {
      if (this.chatHistory[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    // Remove assistant responses after last user message
    this.chatHistory = this.chatHistory.slice(0, lastUserIndex + 1);

    // Change model if specified
    if (modelId) {
      this.aiService.setModel(modelId);
    }

    // Regenerate
    const lastUserMessage = this.chatHistory[lastUserIndex].content;
    await this.handleChatMessage(lastUserMessage);
  }

  private clearChat() {
    this.chatHistory = [];
    this.saveChatHistory();
    
    if (this._view) {
      this._view.webview.postMessage({ type: 'cleared' });
    }
  }

  private async insertCodeToEditor(code: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor');
      return;
    }

    await editor.edit(editBuilder => {
      if (editor.selection.isEmpty) {
        editBuilder.insert(editor.selection.active, code);
      } else {
        editBuilder.replace(editor.selection, code);
      }
    });
  }

  private async loadChatHistory() {
    const history = await this.storageService.get<ChatMessage[]>('chatHistory');
    if (history) {
      this.chatHistory = history;
    }
  }

  private async saveChatHistory() {
    // Keep only last 100 messages
    const historyToSave = this.chatHistory.slice(-100);
    await this.storageService.set('chatHistory', historyToSave);
  }

  private sendInitialState() {
    if (!this._view) return;

    // Send models list
    const models = this.aiService.getAvailableModels();
    const currentModel = this.aiService.getCurrentModel();
    const isAuthenticated = this.aiService.isAuthenticated();

    this._view.webview.postMessage({
      type: 'init',
      models,
      currentModel,
      isAuthenticated,
      chatHistory: this.chatHistory
    });
  }

  public addMessage(role: 'user' | 'assistant', content: string) {
    const message: ChatMessage = {
      role,
      content,
      timestamp: Date.now(),
      model: role === 'assistant' ? this.aiService.getCurrentModel() : undefined
    };
    
    this.chatHistory.push(message);
    this.saveChatHistory();

    if (this._view) {
      this._view.webview.postMessage({
        type: 'message',
        role,
        content,
        model: message.model
      });
    }
  }

  private getHtmlContent(webview: vscode.Webview): string {
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
      background-color: var(--vscode-sideBar-background);
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    
    .header-title {
      font-weight: 600;
      font-size: 12px;
    }
    
    .header-actions {
      display: flex;
      gap: 4px;
    }
    
    .icon-btn {
      background: transparent;
      border: none;
      color: var(--vscode-foreground);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .icon-btn:hover {
      background-color: var(--vscode-toolbar-hoverBackground);
    }
    
    .model-select {
      background-color: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
      border: 1px solid var(--vscode-dropdown-border);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
    }
    
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .message {
      display: flex;
      gap: 8px;
      max-width: 100%;
    }
    
    .message.user {
      flex-direction: row-reverse;
    }
    
    .message-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 14px;
    }
    
    .message.user .message-avatar {
      background-color: var(--vscode-button-background);
    }
    
    .message.assistant .message-avatar {
      background-color: var(--vscode-activityBarBadge-background);
    }
    
    .message-content {
      background-color: var(--vscode-input-background);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      line-height: 1.5;
      max-width: 85%;
      overflow-wrap: break-word;
    }
    
    .message.user .message-content {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    
    .message-content pre {
      background-color: var(--vscode-textCodeBlock-background);
      border-radius: 4px;
      padding: 8px;
      margin: 8px 0;
      overflow-x: auto;
      position: relative;
    }
    
    .message-content code {
      font-family: var(--vscode-editor-font-family);
      font-size: 12px;
    }
    
    .code-actions {
      display: flex;
      gap: 4px;
      margin-top: 4px;
    }
    
    .code-btn {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
    }
    
    .code-btn:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }
    
    .regenerate-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--vscode-panel-border);
    }
    
    .thinking {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }
    
    .thinking-dots {
      display: flex;
      gap: 4px;
    }
    
    .thinking-dots span {
      width: 6px;
      height: 6px;
      background-color: var(--vscode-activityBarBadge-background);
      border-radius: 50%;
      animation: thinking 1.4s infinite ease-in-out both;
    }
    
    .thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
    .thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
    .thinking-dots span:nth-child(3) { animation-delay: 0; }
    
    @keyframes thinking {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    
    .input-container {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid var(--vscode-panel-border);
    }
    
    .chat-input {
      flex: 1;
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 13px;
      resize: none;
      min-height: 36px;
      max-height: 120px;
      font-family: var(--vscode-font-family);
    }
    
    .chat-input:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }
    
    .send-btn {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .send-btn:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    
    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .error {
      color: var(--vscode-errorForeground);
      background-color: var(--vscode-inputValidation-errorBackground);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .auth-prompt {
      text-align: center;
      padding: 20px;
    }
    
    .auth-btn {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 12px;
    }
    
    .hidden {
      display: none !important;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="header-title">AI Chat</span>
    <div class="header-actions">
      <select id="model-select" class="model-select" onchange="selectModel(this.value)">
        <!-- Populated by JavaScript -->
      </select>
      <button class="icon-btn" onclick="clearChat()" title="Clear chat">🗑️</button>
    </div>
  </div>
  
  <div id="messages" class="messages">
    <!-- Messages populated by JavaScript -->
  </div>
  
  <div id="thinking" class="thinking hidden">
    <div class="thinking-dots">
      <span></span><span></span><span></span>
    </div>
    <span>Thinking...</span>
  </div>
  
  <div class="input-container">
    <textarea 
      id="chat-input" 
      class="chat-input" 
      placeholder="Ask anything..."
      rows="1"
      onkeydown="handleKeydown(event)"></textarea>
    <button id="send-btn" class="send-btn" onclick="sendMessage()">Send</button>
  </div>
  
  <script>
    const vscode = acquireVsCodeApi();
    let models = [];
    let currentModel = '';
    let isAuthenticated = false;
    
    // Handle messages from extension
    window.addEventListener('message', event => {
      const message = event.data;
      
      switch (message.type) {
        case 'init':
          models = message.models;
          currentModel = message.currentModel;
          isAuthenticated = message.isAuthenticated;
          populateModels();
          renderChatHistory(message.chatHistory || []);
          break;
          
        case 'message':
          addMessage(message.role, message.content, message.model);
          break;
          
        case 'thinking':
          document.getElementById('thinking').classList.toggle('hidden', !message.show);
          document.getElementById('send-btn').disabled = message.show;
          break;
          
        case 'error':
          addError(message.message);
          break;
          
        case 'cleared':
          document.getElementById('messages').innerHTML = '';
          break;
          
        case 'authRequired':
          showAuthPrompt();
          break;
      }
    });
    
    function populateModels() {
      const select = document.getElementById('model-select');
      select.innerHTML = models.map(m => 
        '<option value="' + m.id + '"' + (m.id === currentModel ? ' selected' : '') + '>' +
        m.name + ' (' + m.provider + ')' +
        '</option>'
      ).join('');
    }
    
    function renderChatHistory(history) {
      const container = document.getElementById('messages');
      container.innerHTML = '';
      history.forEach(msg => {
        if (msg.role !== 'system') {
          addMessage(msg.role, msg.content, msg.model, false);
        }
      });
    }
    
    function addMessage(role, content, model, scroll = true) {
      const container = document.getElementById('messages');
      const messageEl = document.createElement('div');
      messageEl.className = 'message ' + role;
      
      // Parse code blocks
      let parsedContent = content;
      const codeBlocks = [];
      parsedContent = parsedContent.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, (match, lang, code) => {
        const id = 'code-' + Date.now() + '-' + codeBlocks.length;
        codeBlocks.push({ id, code: code.trim() });
        return '<pre><code>' + escapeHtml(code.trim()) + '</code></pre>' +
               '<div class="code-actions">' +
               '<button class="code-btn" onclick="copyCode(\\'' + id + '\\')">Copy</button>' +
               '<button class="code-btn" onclick="insertCode(\\'' + id + '\\')">Insert</button>' +
               '</div>' +
               '<script>window.codeBlocks = window.codeBlocks || {}; window.codeBlocks[\\'' + id + '\\'] = ' + JSON.stringify(code.trim()) + ';<\\/script>';
      });
      
      // Parse inline code
      parsedContent = parsedContent.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
      
      // Parse newlines
      parsedContent = parsedContent.replace(/\\n/g, '<br>');
      
      const avatarIcon = role === 'user' ? '👤' : '🤖';
      
      messageEl.innerHTML = 
        '<div class="message-avatar">' + avatarIcon + '</div>' +
        '<div class="message-content">' + parsedContent +
        (role === 'assistant' && model ? 
          '<div class="regenerate-section">' +
          '<select class="model-select" id="regen-model">' +
          models.map(m => '<option value="' + m.id + '"' + (m.id === model ? ' selected' : '') + '>' + m.name + '</option>').join('') +
          '</select>' +
          '<button class="code-btn" onclick="regenerate()">🔄 Regenerate</button>' +
          '</div>' : '') +
        '</div>';
      
      container.appendChild(messageEl);
      
      if (scroll) {
        container.scrollTop = container.scrollHeight;
      }
    }
    
    function addError(message) {
      const container = document.getElementById('messages');
      const errorEl = document.createElement('div');
      errorEl.className = 'error';
      errorEl.textContent = 'Error: ' + message;
      container.appendChild(errorEl);
      container.scrollTop = container.scrollHeight;
    }
    
    function showAuthPrompt() {
      const container = document.getElementById('messages');
      const promptEl = document.createElement('div');
      promptEl.className = 'auth-prompt';
      promptEl.innerHTML = 
        '<p>🔐 This model requires authentication</p>' +
        '<button class="auth-btn" onclick="signIn()">Sign In</button>';
      container.appendChild(promptEl);
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function sendMessage() {
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text) return;
      
      input.value = '';
      input.style.height = 'auto';
      
      vscode.postMessage({ type: 'chat', text: text });
    }
    
    function handleKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
      
      // Auto-resize textarea
      const input = event.target;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }
    
    function clearChat() {
      vscode.postMessage({ type: 'clear' });
    }
    
    function selectModel(modelId) {
      currentModel = modelId;
      vscode.postMessage({ type: 'selectModel' });
    }
    
    function regenerate() {
      const select = document.getElementById('regen-model');
      const model = select ? select.value : null;
      vscode.postMessage({ type: 'regenerate', model: model });
    }
    
    function copyCode(id) {
      const code = window.codeBlocks && window.codeBlocks[id];
      if (code) {
        vscode.postMessage({ type: 'copyCode', code: code });
      }
    }
    
    function insertCode(id) {
      const code = window.codeBlocks && window.codeBlocks[id];
      if (code) {
        vscode.postMessage({ type: 'insertCode', code: code });
      }
    }
    
    function signIn() {
      vscode.postMessage({ type: 'signIn' });
    }
  </script>
</body>
</html>`;
  }
}

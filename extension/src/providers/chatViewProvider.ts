/**
 * AI Agent - Chat View Provider
 * 
 * VS Code sidebar'da sohbet paneli sağlar.
 * Kullanıcı AI ile etkileşime geçebilir.
 */

import * as vscode from 'vscode';
import { AIService } from '../services/aiService';
import { DatabaseService } from '../services/databaseService';
import { ContextService } from '../services/contextService';
import { MCPProvider } from './mcpProvider';

/**
 * Chat view provider
 * Webview tabanlı sohbet arayüzü
 */
export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiAgent.chatView';
    
    private _view?: vscode.WebviewView;
    private readonly _extensionUri: vscode.Uri;
    private aiService: AIService;
    private databaseService: DatabaseService;
    private contextService: ContextService;
    private mcpProvider: MCPProvider;
    private messages: ChatMessage[] = [];

    constructor(
        extensionUri: vscode.Uri,
        aiService: AIService,
        databaseService: DatabaseService,
        contextService: ContextService,
        mcpProvider: MCPProvider
    ) {
        this._extensionUri = extensionUri;
        this.aiService = aiService;
        this.databaseService = databaseService;
        this.contextService = contextService;
        this.mcpProvider = mcpProvider;
        
        // Önceki mesajları yükle
        this.loadMessages();
    }

    /**
     * Webview oluşturulduğunda çağrılır
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        // Webview mesajlarını dinle
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'sendMessage':
                    await this.handleUserMessage(message.text);
                    break;
                case 'clearChat':
                    await this.clearChat();
                    break;
                case 'insertCode':
                    this.insertCodeToEditor(message.code);
                    break;
                case 'copyCode':
                    vscode.env.clipboard.writeText(message.code);
                    vscode.window.showInformationMessage('Kod panoya kopyalandı');
                    break;
            }
        });

        // Mevcut mesajları gönder
        this.updateWebviewMessages();
    }

    /**
     * Harici kaynaklardan mesaj gönderir
     */
    public async sendMessage(text: string): Promise<void> {
        await this.handleUserMessage(text);
    }

    /**
     * Kullanıcı mesajını işler
     */
    private async handleUserMessage(text: string): Promise<void> {
        if (!text.trim()) return;

        // Kullanıcı mesajını ekle
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: Date.now()
        };
        this.messages.push(userMessage);
        this.updateWebviewMessages();

        // AI yanıtı için yükleniyor göster
        this.setLoading(true);

        try {
            // Aktif editör context'ini al
            const editorContext = this.getEditorContext();
            
            // AI'dan yanıt al
            const response = await this.getAIResponse(text, editorContext);

            // AI mesajını ekle
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };
            this.messages.push(assistantMessage);

            // Mesajları kaydet
            await this.saveMessages();
        } catch (error) {
            // Hata mesajı ekle
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `⚠️ Hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
                timestamp: Date.now()
            };
            this.messages.push(errorMessage);
        } finally {
            this.setLoading(false);
            this.updateWebviewMessages();
        }
    }

    /**
     * AI'dan yanıt alır
     */
    private async getAIResponse(userMessage: string, editorContext: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('aiAgent');
        const language = config.get<string>('language', 'tr');
        
        // MCP araçlarını kontrol et
        const mcpTools = this.mcpProvider.getAvailableTools();
        
        // Sistem promptu
        const systemPrompt = `Sen bir uzman yazılım geliştirici asistansın. 
Kullanıcıya kod yazma, hata ayıklama ve programlama konularında yardımcı ol.
${language === 'tr' ? 'Türkçe yanıt ver.' : `Respond in ${language}.`}

${editorContext ? `Aktif editör context:\n${editorContext}\n` : ''}
${mcpTools.length > 0 ? `Kullanılabilir MCP araçları: ${mcpTools.join(', ')}` : ''}

Kod örnekleri verirken:
- Temiz ve okunabilir kod yaz
- Yorum satırları ekle
- En iyi pratikleri kullan`;

        return this.aiService.chat([
            { role: 'system', content: systemPrompt },
            ...this.messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        ]);
    }

    /**
     * Aktif editör context'ini döndürür
     */
    private getEditorContext(): string {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return '';
        }

        const document = editor.document;
        const selection = editor.selection;
        
        let context = `Dosya: ${document.fileName}\nDil: ${document.languageId}\n`;
        
        if (!selection.isEmpty) {
            const selectedText = document.getText(selection);
            context += `\nSeçili kod:\n\`\`\`${document.languageId}\n${selectedText}\n\`\`\``;
        } else {
            // İmleç pozisyonu etrafındaki context
            const position = selection.active;
            const startLine = Math.max(0, position.line - 10);
            const endLine = Math.min(document.lineCount - 1, position.line + 10);
            
            const contextLines: string[] = [];
            for (let i = startLine; i <= endLine; i++) {
                contextLines.push(document.lineAt(i).text);
            }
            
            context += `\nKod context (satır ${startLine + 1}-${endLine + 1}):\n\`\`\`${document.languageId}\n${contextLines.join('\n')}\n\`\`\``;
        }

        return context;
    }

    /**
     * Kodu editöre ekler
     */
    private insertCodeToEditor(code: string): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Açık bir editör yok');
            return;
        }

        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, code);
        });
    }

    /**
     * Sohbeti temizler
     */
    private async clearChat(): Promise<void> {
        this.messages = [];
        await this.databaseService.clearChatHistory();
        this.updateWebviewMessages();
    }

    /**
     * Mesajları yükler
     */
    private async loadMessages(): Promise<void> {
        try {
            this.messages = await this.databaseService.getChatHistory();
        } catch {
            this.messages = [];
        }
    }

    /**
     * Mesajları kaydeder
     */
    private async saveMessages(): Promise<void> {
        try {
            await this.databaseService.saveChatHistory(this.messages);
        } catch (error) {
            console.error('Mesaj kaydetme hatası:', error);
        }
    }

    /**
     * Webview'e mesajları gönderir
     */
    private updateWebviewMessages(): void {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateMessages',
                messages: this.messages
            });
        }
    }

    /**
     * Yükleniyor durumunu ayarlar
     */
    private setLoading(loading: boolean): void {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'setLoading',
                loading
            });
        }
    }

    /**
     * Webview HTML içeriğini oluşturur
     */
    private getHtmlContent(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Agent Chat</title>
    <style>
        :root {
            --bg-primary: var(--vscode-editor-background);
            --bg-secondary: var(--vscode-sideBar-background);
            --text-primary: var(--vscode-editor-foreground);
            --text-secondary: var(--vscode-descriptionForeground);
            --border-color: var(--vscode-panel-border);
            --accent-color: var(--vscode-button-background);
            --accent-hover: var(--vscode-button-hoverBackground);
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            background: var(--bg-primary);
            color: var(--text-primary);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .chat-header {
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chat-header h3 {
            font-size: 13px;
            font-weight: 600;
        }
        
        .clear-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .clear-btn:hover {
            background: var(--vscode-toolbar-hoverBackground);
        }
        
        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
        }
        
        .message {
            margin-bottom: 12px;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .message.user {
            text-align: right;
        }
        
        .message-bubble {
            display: inline-block;
            max-width: 85%;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 13px;
            line-height: 1.5;
            text-align: left;
        }
        
        .message.user .message-bubble {
            background: var(--accent-color);
            color: var(--vscode-button-foreground);
            border-bottom-right-radius: 4px;
        }
        
        .message.assistant .message-bubble {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-bottom-left-radius: 4px;
        }
        
        .message-bubble pre {
            background: var(--vscode-textCodeBlock-background);
            padding: 8px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 8px 0;
            position: relative;
        }
        
        .message-bubble code {
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
        }
        
        .code-actions {
            position: absolute;
            top: 4px;
            right: 4px;
            display: flex;
            gap: 4px;
        }
        
        .code-action-btn {
            background: var(--vscode-button-secondaryBackground);
            border: none;
            color: var(--vscode-button-secondaryForeground);
            padding: 2px 6px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
        }
        
        .code-action-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        
        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 8px 12px;
        }
        
        .typing-dot {
            width: 6px;
            height: 6px;
            background: var(--text-secondary);
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out both;
        }
        
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        
        .input-container {
            padding: 12px;
            border-top: 1px solid var(--border-color);
        }
        
        .input-wrapper {
            display: flex;
            gap: 8px;
        }
        
        #message-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 13px;
            resize: none;
            font-family: inherit;
        }
        
        #message-input:focus {
            outline: none;
            border-color: var(--accent-color);
        }
        
        .send-btn {
            background: var(--accent-color);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
        }
        
        .send-btn:hover {
            background: var(--accent-hover);
        }
        
        .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-secondary);
        }
        
        .empty-state-icon {
            font-size: 32px;
            margin-bottom: 12px;
        }
    </style>
</head>
<body>
    <div class="chat-header">
        <h3>🤖 AI Agent</h3>
        <button class="clear-btn" onclick="clearChat()">Temizle</button>
    </div>
    
    <div class="messages-container" id="messages">
        <div class="empty-state" id="empty-state">
            <div class="empty-state-icon">💬</div>
            <p>Kod hakkında soru sorun veya<br>yardım isteyin</p>
        </div>
    </div>
    
    <div id="typing-container" style="display: none;">
        <div class="message assistant">
            <div class="message-bubble">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="input-container">
        <div class="input-wrapper">
            <textarea 
                id="message-input" 
                rows="1" 
                placeholder="Mesajınızı yazın..."
                onkeydown="handleKeyDown(event)"
            ></textarea>
            <button class="send-btn" id="send-btn" onclick="sendMessage()">Gönder</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let isLoading = false;
        
        // Mesaj gönder
        function sendMessage() {
            if (isLoading) return;
            
            const input = document.getElementById('message-input');
            const text = input.value.trim();
            
            if (!text) return;
            
            vscode.postMessage({ type: 'sendMessage', text });
            input.value = '';
            input.style.height = 'auto';
        }
        
        // Enter tuşu ile gönder
        function handleKeyDown(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        }
        
        // Sohbeti temizle
        function clearChat() {
            vscode.postMessage({ type: 'clearChat' });
        }
        
        // Kodu ekle
        function insertCode(code) {
            vscode.postMessage({ type: 'insertCode', code });
        }
        
        // Kodu kopyala
        function copyCode(code) {
            vscode.postMessage({ type: 'copyCode', code });
        }
        
        // Mesajları render et
        function renderMessages(messages) {
            const container = document.getElementById('messages');
            const emptyState = document.getElementById('empty-state');
            
            if (messages.length === 0) {
                emptyState.style.display = 'block';
                return;
            }
            
            emptyState.style.display = 'none';
            container.innerHTML = '';
            
            messages.forEach(msg => {
                const div = document.createElement('div');
                div.className = 'message ' + msg.role;
                
                let content = msg.content;
                
                // Kod bloklarını işle
                content = content.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, (match, lang, code) => {
                    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return '<pre><code class="language-' + lang + '">' + escapedCode + '</code><div class="code-actions"><button class="code-action-btn" onclick="copyCode(\\'' + btoa(code) + '\\')">Kopyala</button><button class="code-action-btn" onclick="insertCode(\\'' + btoa(code) + '\\')">Ekle</button></div></pre>';
                });
                
                // Satır içi kodu işle
                content = content.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
                
                // Yeni satırları işle
                content = content.replace(/\\n/g, '<br>');
                
                div.innerHTML = '<div class="message-bubble">' + content + '</div>';
                container.appendChild(div);
            });
            
            // Aşağı kaydır
            container.scrollTop = container.scrollHeight;
        }
        
        // VS Code'dan mesaj dinle
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'updateMessages':
                    renderMessages(message.messages);
                    break;
                case 'setLoading':
                    isLoading = message.loading;
                    document.getElementById('typing-container').style.display = message.loading ? 'block' : 'none';
                    document.getElementById('send-btn').disabled = message.loading;
                    break;
            }
        });
        
        // Base64 decode helper
        function decodeCode(encoded) {
            return atob(encoded);
        }
        
        // Kopyala/Ekle için global fonksiyonları güncelle
        window.copyCode = function(encoded) {
            vscode.postMessage({ type: 'copyCode', code: decodeCode(encoded) });
        };
        
        window.insertCode = function(encoded) {
            vscode.postMessage({ type: 'insertCode', code: decodeCode(encoded) });
        };
    </script>
</body>
</html>`;
    }
}

/**
 * Sohbet mesajı tipi
 */
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

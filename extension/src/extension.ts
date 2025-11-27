/**
 * AI Agent VS Code Extension
 * Ana Giriş Noktası
 * 
 * Bu dosya extension'ın aktivasyonunu ve komutların kaydını yönetir.
 * GitHub Copilot alternatifi olarak tasarlanmıştır.
 */

import * as vscode from 'vscode';
import { InlineCompletionProvider } from './providers/inlineCompletionProvider';
import { ChatViewProvider } from './providers/chatViewProvider';
import { MCPProvider } from './providers/mcpProvider';
import { AIService } from './services/aiService';
import { DatabaseService } from './services/databaseService';
import { ContextService } from './services/contextService';

// Global servis örnekleri
let aiService: AIService;
let databaseService: DatabaseService;
let contextService: ContextService;
let mcpProvider: MCPProvider;
let inlineCompletionProvider: InlineCompletionProvider;
let chatViewProvider: ChatViewProvider;

/**
 * Extension aktive olduğunda çağrılır
 * @param context Extension bağlamı
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    console.log('🚀 AI Agent extension aktivasyon başladı...');

    try {
        // Servisleri başlat
        await initializeServices(context);
        
        // Provider'ları kaydet
        registerProviders(context);
        
        // Komutları kaydet
        registerCommands(context);
        
        // Yapılandırma değişikliklerini dinle
        setupConfigurationWatcher(context);

        console.log('✅ AI Agent extension başarıyla aktive edildi!');
        
        // Hoş geldin mesajı göster (ilk kurulumda)
        const isFirstRun = context.globalState.get('aiAgent.firstRun', true);
        if (isFirstRun) {
            vscode.window.showInformationMessage(
                '🤖 AI Agent aktif! Ctrl+Shift+A ile sohbet panelini açabilirsiniz.',
                'Ayarları Aç'
            ).then(selection => {
                if (selection === 'Ayarları Aç') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'aiAgent');
                }
            });
            context.globalState.update('aiAgent.firstRun', false);
        }
    } catch (error) {
        console.error('❌ AI Agent aktivasyon hatası:', error);
        vscode.window.showErrorMessage(`AI Agent başlatılamadı: ${error}`);
    }
}

/**
 * Servisleri başlatır
 */
async function initializeServices(context: vscode.ExtensionContext): Promise<void> {
    // Database servisi
    databaseService = new DatabaseService(context);
    await databaseService.initialize();
    
    // AI servisi
    aiService = new AIService();
    
    // Context servisi
    contextService = new ContextService();
    
    // MCP provider
    mcpProvider = new MCPProvider();
    await mcpProvider.initialize();
}

/**
 * Provider'ları kaydeder
 */
function registerProviders(context: vscode.ExtensionContext): void {
    // Inline completion provider (Tab ile otomatik tamamlama)
    const config = vscode.workspace.getConfiguration('aiAgent');
    const inlineEnabled = config.get<boolean>('inlineCompletionEnabled', true);
    
    if (inlineEnabled) {
        inlineCompletionProvider = new InlineCompletionProvider(aiService, contextService);
        
        const inlineDisposable = vscode.languages.registerInlineCompletionItemProvider(
            { pattern: '**' }, // Tüm dosya türleri
            inlineCompletionProvider
        );
        
        context.subscriptions.push(inlineDisposable);
        console.log('📝 Inline completion provider kayıt edildi');
    }
    
    // Chat view provider (Sidebar sohbet paneli)
    chatViewProvider = new ChatViewProvider(
        context.extensionUri,
        aiService,
        databaseService,
        contextService,
        mcpProvider
    );
    
    const chatViewDisposable = vscode.window.registerWebviewViewProvider(
        'aiAgent.chatView',
        chatViewProvider,
        {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        }
    );
    
    context.subscriptions.push(chatViewDisposable);
    console.log('💬 Chat view provider kayıt edildi');
}

/**
 * Komutları kaydeder
 */
function registerCommands(context: vscode.ExtensionContext): void {
    // Sohbet panelini aç
    const openChatCmd = vscode.commands.registerCommand('aiAgent.openChat', () => {
        vscode.commands.executeCommand('aiAgent.chatView.focus');
    });
    
    // Seçili kodu açıkla
    const explainCodeCmd = vscode.commands.registerCommand('aiAgent.explainCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Açık bir editör yok');
            return;
        }
        
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (!selectedText) {
            vscode.window.showWarningMessage('Lütfen açıklanacak kodu seçin');
            return;
        }
        
        await chatViewProvider.sendMessage(`Bu kodu açıkla:\n\`\`\`\n${selectedText}\n\`\`\``);
        vscode.commands.executeCommand('aiAgent.chatView.focus');
    });
    
    // Seçili kodu refactor et
    const refactorCodeCmd = vscode.commands.registerCommand('aiAgent.refactorCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Açık bir editör yok');
            return;
        }
        
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (!selectedText) {
            vscode.window.showWarningMessage('Lütfen refactor edilecek kodu seçin');
            return;
        }
        
        await chatViewProvider.sendMessage(`Bu kodu refactor et ve daha iyi hale getir:\n\`\`\`\n${selectedText}\n\`\`\``);
        vscode.commands.executeCommand('aiAgent.chatView.focus');
    });
    
    // Seçili koddaki hataları düzelt
    const fixCodeCmd = vscode.commands.registerCommand('aiAgent.fixCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Açık bir editör yok');
            return;
        }
        
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (!selectedText) {
            vscode.window.showWarningMessage('Lütfen düzeltilecek kodu seçin');
            return;
        }
        
        await chatViewProvider.sendMessage(`Bu koddaki hataları bul ve düzelt:\n\`\`\`\n${selectedText}\n\`\`\``);
        vscode.commands.executeCommand('aiAgent.chatView.focus');
    });
    
    // Test oluştur
    const generateTestsCmd = vscode.commands.registerCommand('aiAgent.generateTests', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Açık bir editör yok');
            return;
        }
        
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (!selectedText) {
            vscode.window.showWarningMessage('Lütfen test yazılacak kodu seçin');
            return;
        }
        
        const language = editor.document.languageId;
        await chatViewProvider.sendMessage(`Bu ${language} kodu için unit testler yaz:\n\`\`\`${language}\n${selectedText}\n\`\`\``);
        vscode.commands.executeCommand('aiAgent.chatView.focus');
    });
    
    // Dokümantasyon ekle
    const addDocumentationCmd = vscode.commands.registerCommand('aiAgent.addDocumentation', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Açık bir editör yok');
            return;
        }
        
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (!selectedText) {
            vscode.window.showWarningMessage('Lütfen dokümante edilecek kodu seçin');
            return;
        }
        
        const language = editor.document.languageId;
        await chatViewProvider.sendMessage(`Bu ${language} kodu için detaylı dokümantasyon/yorum ekle:\n\`\`\`${language}\n${selectedText}\n\`\`\``);
        vscode.commands.executeCommand('aiAgent.chatView.focus');
    });
    
    // Inline tamamlamayı aç/kapat
    const toggleInlineCmd = vscode.commands.registerCommand('aiAgent.toggleInlineCompletion', async () => {
        const config = vscode.workspace.getConfiguration('aiAgent');
        const currentValue = config.get<boolean>('inlineCompletionEnabled', true);
        
        await config.update('inlineCompletionEnabled', !currentValue, vscode.ConfigurationTarget.Global);
        
        const newState = !currentValue ? 'açıldı' : 'kapatıldı';
        vscode.window.showInformationMessage(`Inline kod tamamlama ${newState}`);
    });
    
    // Tüm komutları subscription'a ekle
    context.subscriptions.push(
        openChatCmd,
        explainCodeCmd,
        refactorCodeCmd,
        fixCodeCmd,
        generateTestsCmd,
        addDocumentationCmd,
        toggleInlineCmd
    );
    
    console.log('⌨️ Komutlar kayıt edildi');
}

/**
 * Yapılandırma değişikliklerini dinler
 */
function setupConfigurationWatcher(context: vscode.ExtensionContext): void {
    const configWatcher = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('aiAgent')) {
            console.log('⚙️ AI Agent yapılandırması değişti');
            
            // Model değişikliğini AI servisine bildir
            if (event.affectsConfiguration('aiAgent.model')) {
                const config = vscode.workspace.getConfiguration('aiAgent');
                const model = config.get<string>('model', 'claude-sonnet-4');
                aiService.setModel(model);
            }
            
            // Dil değişikliğini AI servisine bildir
            if (event.affectsConfiguration('aiAgent.language')) {
                const config = vscode.workspace.getConfiguration('aiAgent');
                const language = config.get<string>('language', 'tr');
                aiService.setLanguage(language);
            }
        }
    });
    
    context.subscriptions.push(configWatcher);
}

/**
 * Extension deaktive olduğunda çağrılır
 */
export function deactivate(): void {
    console.log('👋 AI Agent extension deaktive ediliyor...');
    
    // MCP sunucularını kapat
    if (mcpProvider) {
        mcpProvider.dispose();
    }
    
    // Database bağlantısını kapat
    if (databaseService) {
        databaseService.close();
    }
    
    console.log('✅ AI Agent extension deaktive edildi');
}

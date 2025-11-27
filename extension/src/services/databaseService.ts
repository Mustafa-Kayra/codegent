/**
 * AI Agent - Database Service
 * 
 * Sohbet geçmişi ve kullanıcı tercihlerini yönetir.
 * VS Code globalState kullanarak kalıcı depolama sağlar.
 */

import * as vscode from 'vscode';

/**
 * Sohbet mesajı tipi
 */
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

/**
 * Kullanıcı tercihleri tipi
 */
interface UserPreferences {
    model: string;
    language: string;
    inlineCompletionEnabled: boolean;
    theme: string;
    fontSize: number;
}

/**
 * Kod snippet tipi
 */
interface CodeSnippet {
    id: string;
    name: string;
    language: string;
    code: string;
    description: string;
    createdAt: number;
    updatedAt: number;
}

/**
 * Database servisi
 * VS Code globalState ile kalıcı veri depolama
 */
export class DatabaseService {
    private context: vscode.ExtensionContext;
    private readonly CHAT_HISTORY_KEY = 'aiAgent.chatHistory';
    private readonly USER_PREFS_KEY = 'aiAgent.userPreferences';
    private readonly SNIPPETS_KEY = 'aiAgent.codeSnippets';
    private readonly MAX_CHAT_HISTORY = 100;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Database'i başlatır
     */
    async initialize(): Promise<void> {
        // Varsayılan tercihleri ayarla (yoksa)
        const prefs = this.context.globalState.get<UserPreferences>(this.USER_PREFS_KEY);
        if (!prefs) {
            await this.saveUserPreferences({
                model: 'claude-sonnet-4',
                language: 'tr',
                inlineCompletionEnabled: true,
                theme: 'dark',
                fontSize: 14
            });
        }

        console.log('✅ Database servisi başlatıldı');
    }

    // ==================
    // SOHBET GEÇMİŞİ
    // ==================

    /**
     * Sohbet geçmişini döndürür
     */
    async getChatHistory(): Promise<ChatMessage[]> {
        const history = this.context.globalState.get<ChatMessage[]>(this.CHAT_HISTORY_KEY);
        return history || [];
    }

    /**
     * Sohbet geçmişini kaydeder
     */
    async saveChatHistory(messages: ChatMessage[]): Promise<void> {
        // Maksimum geçmiş sayısını kontrol et
        const trimmedMessages = messages.slice(-this.MAX_CHAT_HISTORY);
        await this.context.globalState.update(this.CHAT_HISTORY_KEY, trimmedMessages);
    }

    /**
     * Yeni mesaj ekler
     */
    async addMessage(message: ChatMessage): Promise<void> {
        const history = await this.getChatHistory();
        history.push(message);
        await this.saveChatHistory(history);
    }

    /**
     * Sohbet geçmişini temizler
     */
    async clearChatHistory(): Promise<void> {
        await this.context.globalState.update(this.CHAT_HISTORY_KEY, []);
    }

    /**
     * Son N mesajı döndürür
     */
    async getLastMessages(count: number): Promise<ChatMessage[]> {
        const history = await this.getChatHistory();
        return history.slice(-count);
    }

    // ==================
    // KULLANICI TERCİHLERİ
    // ==================

    /**
     * Kullanıcı tercihlerini döndürür
     */
    async getUserPreferences(): Promise<UserPreferences> {
        const prefs = this.context.globalState.get<UserPreferences>(this.USER_PREFS_KEY);
        return prefs || {
            model: 'claude-sonnet-4',
            language: 'tr',
            inlineCompletionEnabled: true,
            theme: 'dark',
            fontSize: 14
        };
    }

    /**
     * Kullanıcı tercihlerini kaydeder
     */
    async saveUserPreferences(preferences: UserPreferences): Promise<void> {
        await this.context.globalState.update(this.USER_PREFS_KEY, preferences);
    }

    /**
     * Tek bir tercihi günceller
     */
    async updatePreference<K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ): Promise<void> {
        const prefs = await this.getUserPreferences();
        prefs[key] = value;
        await this.saveUserPreferences(prefs);
    }

    // ==================
    // KOD SNİPPET'LERİ
    // ==================

    /**
     * Tüm snippet'leri döndürür
     */
    async getSnippets(): Promise<CodeSnippet[]> {
        const snippets = this.context.globalState.get<CodeSnippet[]>(this.SNIPPETS_KEY);
        return snippets || [];
    }

    /**
     * Yeni snippet ekler
     */
    async addSnippet(snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<CodeSnippet> {
        const snippets = await this.getSnippets();
        
        const newSnippet: CodeSnippet = {
            ...snippet,
            id: Date.now().toString(),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        snippets.push(newSnippet);
        await this.context.globalState.update(this.SNIPPETS_KEY, snippets);
        
        return newSnippet;
    }

    /**
     * Snippet'i günceller
     */
    async updateSnippet(id: string, updates: Partial<CodeSnippet>): Promise<void> {
        const snippets = await this.getSnippets();
        const index = snippets.findIndex(s => s.id === id);
        
        if (index !== -1) {
            snippets[index] = {
                ...snippets[index],
                ...updates,
                updatedAt: Date.now()
            };
            await this.context.globalState.update(this.SNIPPETS_KEY, snippets);
        }
    }

    /**
     * Snippet'i siler
     */
    async deleteSnippet(id: string): Promise<void> {
        const snippets = await this.getSnippets();
        const filtered = snippets.filter(s => s.id !== id);
        await this.context.globalState.update(this.SNIPPETS_KEY, filtered);
    }

    /**
     * Snippet'i ID ile bulur
     */
    async getSnippetById(id: string): Promise<CodeSnippet | undefined> {
        const snippets = await this.getSnippets();
        return snippets.find(s => s.id === id);
    }

    /**
     * Dile göre snippet'leri filtreler
     */
    async getSnippetsByLanguage(language: string): Promise<CodeSnippet[]> {
        const snippets = await this.getSnippets();
        return snippets.filter(s => s.language === language);
    }

    // ==================
    // YARDIMCI METODLAR
    // ==================

    /**
     * Tüm verileri dışa aktarır
     */
    async exportData(): Promise<object> {
        return {
            chatHistory: await this.getChatHistory(),
            userPreferences: await this.getUserPreferences(),
            snippets: await this.getSnippets(),
            exportedAt: Date.now()
        };
    }

    /**
     * Verileri içe aktarır
     */
    async importData(data: {
        chatHistory?: ChatMessage[];
        userPreferences?: UserPreferences;
        snippets?: CodeSnippet[];
    }): Promise<void> {
        if (data.chatHistory) {
            await this.saveChatHistory(data.chatHistory);
        }
        
        if (data.userPreferences) {
            await this.saveUserPreferences(data.userPreferences);
        }
        
        if (data.snippets) {
            await this.context.globalState.update(this.SNIPPETS_KEY, data.snippets);
        }
    }

    /**
     * Depolama boyutunu döndürür (yaklaşık)
     */
    async getStorageSize(): Promise<number> {
        const data = await this.exportData();
        return JSON.stringify(data).length;
    }

    /**
     * Tüm verileri temizler
     */
    async clearAll(): Promise<void> {
        await this.clearChatHistory();
        await this.context.globalState.update(this.USER_PREFS_KEY, undefined);
        await this.context.globalState.update(this.SNIPPETS_KEY, undefined);
    }

    /**
     * Database bağlantısını kapatır
     */
    close(): void {
        // VS Code globalState için özel bir kapatma işlemi gerekmez
        console.log('Database servisi kapatıldı');
    }
}

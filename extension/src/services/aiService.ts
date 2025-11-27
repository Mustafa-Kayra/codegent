/**
 * AI Agent - AI Service
 * 
 * AI API çağrılarını yönetir.
 * Birden fazla AI sağlayıcısını destekler.
 */

import * as vscode from 'vscode';

/**
 * Sohbet mesajı tipi
 */
interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Tamamlama seçenekleri
 */
interface CompletionOptions {
    maxTokens?: number;
    temperature?: number;
    stopSequences?: string[];
}

/**
 * AI yanıt tipi
 */
interface AIResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/**
 * AI servisi
 * Farklı AI sağlayıcılarıyla iletişimi yönetir
 */
export class AIService {
    private currentModel: string = 'claude-sonnet-4';
    private currentLanguage: string = 'tr';
    private apiKey: string | undefined;

    constructor() {
        this.loadConfiguration();
    }

    /**
     * Yapılandırmayı yükler
     */
    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('aiAgent');
        this.currentModel = config.get<string>('model', 'claude-sonnet-4');
        this.currentLanguage = config.get<string>('language', 'tr');
    }

    /**
     * Model ayarlar
     */
    setModel(model: string): void {
        this.currentModel = model;
    }

    /**
     * Dil ayarlar
     */
    setLanguage(language: string): void {
        this.currentLanguage = language;
    }

    /**
     * Sohbet API'sini çağırır
     */
    async chat(messages: ChatMessage[]): Promise<string> {
        try {
            // Model tipine göre yönlendir
            if (this.currentModel.startsWith('openrouter:')) {
                return await this.callOpenRouter(messages);
            } else if (this.currentModel.startsWith('claude')) {
                return await this.callAnthropic(messages);
            } else if (this.currentModel.startsWith('gpt')) {
                return await this.callOpenAI(messages);
            } else if (this.currentModel.startsWith('gemini')) {
                return await this.callGoogle(messages);
            } else {
                // Varsayılan olarak demo yanıt
                return this.getDemoResponse(messages);
            }
        } catch (error) {
            console.error('AI chat hatası:', error);
            throw error;
        }
    }

    /**
     * Kod tamamlama için API çağırır
     */
    async getCompletion(prompt: string, options: CompletionOptions = {}): Promise<string> {
        const messages: ChatMessage[] = [
            { role: 'user', content: prompt }
        ];

        try {
            return await this.chat(messages);
        } catch {
            return '';
        }
    }

    /**
     * OpenRouter API'sini çağırır
     */
    private async callOpenRouter(messages: ChatMessage[]): Promise<string> {
        const modelId = this.currentModel.replace('openrouter:', '');
        
        // API anahtarını al
        const apiKey = await this.getApiKey('openrouter');
        if (!apiKey) {
            throw new Error('OpenRouter API anahtarı bulunamadı. Ayarlardan ekleyin.');
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://github.com/Mustafa-Kayra/codegent',
                'X-Title': 'AI Agent'
            },
            body: JSON.stringify({
                model: modelId,
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API hatası: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as {
            choices?: Array<{
                message?: {
                    content?: string;
                };
            }>;
        };
        return data.choices?.[0]?.message?.content || '';
    }

    /**
     * Anthropic API'sini çağırır
     */
    private async callAnthropic(messages: ChatMessage[]): Promise<string> {
        const apiKey = await this.getApiKey('anthropic');
        if (!apiKey) {
            // Demo mod
            return this.getDemoResponse(messages);
        }

        // Sistem mesajını ayır
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';
        const chatMessages = messages.filter(m => m.role !== 'system');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.currentModel,
                max_tokens: 4096,
                system: systemMessage,
                messages: chatMessages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Anthropic API hatası: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as {
            content?: Array<{
                type?: string;
                text?: string;
            }>;
        };
        return data.content?.[0]?.text || '';
    }

    /**
     * OpenAI API'sini çağırır
     */
    private async callOpenAI(messages: ChatMessage[]): Promise<string> {
        const apiKey = await this.getApiKey('openai');
        if (!apiKey) {
            return this.getDemoResponse(messages);
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: this.currentModel,
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API hatası: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as {
            choices?: Array<{
                message?: {
                    content?: string;
                };
            }>;
        };
        return data.choices?.[0]?.message?.content || '';
    }

    /**
     * Google Gemini API'sini çağırır
     */
    private async callGoogle(messages: ChatMessage[]): Promise<string> {
        const apiKey = await this.getApiKey('google');
        if (!apiKey) {
            return this.getDemoResponse(messages);
        }

        // Gemini formatına dönüştür
        const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${this.currentModel}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contents })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google API hatası: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as {
            candidates?: Array<{
                content?: {
                    parts?: Array<{
                        text?: string;
                    }>;
                };
            }>;
        };
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    /**
     * API anahtarını alır
     */
    private async getApiKey(provider: string): Promise<string | undefined> {
        // Önce secret storage'dan dene
        const secretKey = `aiAgent.${provider}ApiKey`;
        
        // VS Code ayarlarından API anahtarı kontrolü
        const config = vscode.workspace.getConfiguration('aiAgent');
        const configKey = config.get<string>(`${provider}ApiKey`);
        
        if (configKey) {
            return configKey;
        }

        // Ortam değişkenlerinden dene
        const envKeyMap: Record<string, string> = {
            'openrouter': 'OPENROUTER_API_KEY',
            'anthropic': 'ANTHROPIC_API_KEY',
            'openai': 'OPENAI_API_KEY',
            'google': 'GOOGLE_API_KEY'
        };

        const envKey = process.env[envKeyMap[provider]];
        if (envKey) {
            return envKey;
        }

        return undefined;
    }

    /**
     * Demo yanıt döndürür (API anahtarı yokken)
     */
    private getDemoResponse(messages: ChatMessage[]): string {
        const lastMessage = messages[messages.length - 1]?.content || '';
        
        // Basit anahtar kelime analizi
        const lowerMessage = lastMessage.toLowerCase();
        
        if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam')) {
            return 'Merhaba! 👋 Ben AI Agent, size kod yazımında yardımcı olabilirim. Nasıl yardımcı olabilirim?';
        }
        
        if (lowerMessage.includes('açıkla') || lowerMessage.includes('explain')) {
            return `Bu kodu analiz edeyim:

1. **Genel Yapı**: Kod, belirli bir işlevi yerine getirmek için yazılmış.
2. **Değişkenler**: Tanımlanan değişkenler veriyi tutar.
3. **Fonksiyonlar**: İşlevselliği sağlayan fonksiyonlar.

Daha detaylı açıklama ister misiniz?`;
        }
        
        if (lowerMessage.includes('refactor') || lowerMessage.includes('düzenle')) {
            return `İşte refactor önerileri:

\`\`\`javascript
// Daha iyi değişken isimleri kullanın
// Tekrarlayan kodu fonksiyona çıkarın
// Error handling ekleyin
// Yorum satırları ekleyin
\`\`\`

Bu değişiklikler kodu daha okunabilir ve sürdürülebilir yapacaktır.`;
        }
        
        if (lowerMessage.includes('test') || lowerMessage.includes('unit')) {
            return `İşte örnek test kodu:

\`\`\`javascript
describe('MyFunction', () => {
    it('should return expected value', () => {
        const result = myFunction(input);
        expect(result).toBe(expectedOutput);
    });

    it('should handle edge cases', () => {
        expect(() => myFunction(null)).toThrow();
    });
});
\`\`\`

Bu testler temel senaryoları kapsar.`;
        }
        
        if (lowerMessage.includes('hata') || lowerMessage.includes('fix') || lowerMessage.includes('düzelt')) {
            return `Kodu inceledim, işte olası düzeltmeler:

1. Sözdizimi hatası kontrolü
2. Null/undefined kontrolü eklenmeli
3. Try-catch blokları ile hata yakalama

Spesifik bir hata mesajı var mı?`;
        }

        // Varsayılan yanıt
        return `Anladım! İşte size yardımcı olabileceğim bazı konular:

- 📝 Kod yazımı ve tamamlama
- 🔍 Kod açıklama ve analiz
- 🔧 Refactoring önerileri
- 🧪 Test oluşturma
- 🐛 Hata ayıklama
- 📚 Dokümantasyon

Ne hakkında yardım istiyorsunuz?`;
    }

    /**
     * Kullanılabilir modelleri döndürür
     */
    getAvailableModels(): string[] {
        return [
            // Anthropic
            'claude-sonnet-4',
            'openrouter:anthropic/claude-3.7-sonnet',
            'openrouter:anthropic/claude-3.5-sonnet',
            'openrouter:anthropic/claude-opus-4.5',
            
            // OpenAI
            'gpt-4o',
            'openrouter:openai/gpt-5',
            'openrouter:openai/o3',
            
            // Google
            'gemini-3-pro-preview',
            'openrouter:google/gemini-2.5-pro',
            
            // DeepSeek
            'openrouter:deepseek/deepseek-r1',
            'openrouter:deepseek/deepseek-chat-v3.1',
            
            // Diğer
            'openrouter:meta-llama/llama-4-maverick',
            'openrouter:x-ai/grok-3'
        ];
    }
}

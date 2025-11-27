/**
 * AI Agent - Inline Completion Provider
 * 
 * VS Code'da Tab tuşu ile otomatik kod tamamlama sağlar.
 * GitHub Copilot benzeri deneyim sunar.
 */

import * as vscode from 'vscode';
import { AIService } from '../services/aiService';
import { ContextService } from '../services/contextService';

/**
 * Inline kod tamamlama provider'ı
 * Kullanıcı kod yazarken AI önerileri sunar
 */
export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    private aiService: AIService;
    private contextService: ContextService;
    private debounceTimer: NodeJS.Timeout | null = null;
    private lastRequestTime: number = 0;
    private cache: Map<string, vscode.InlineCompletionItem[]> = new Map();

    constructor(aiService: AIService, contextService: ContextService) {
        this.aiService = aiService;
        this.contextService = contextService;
    }

    /**
     * Inline completion öğelerini sağlar
     */
    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null> {
        // Extension aktif mi kontrol et
        const config = vscode.workspace.getConfiguration('aiAgent');
        const enabled = config.get<boolean>('enabled', true);
        const inlineEnabled = config.get<boolean>('inlineCompletionEnabled', true);
        
        if (!enabled || !inlineEnabled) {
            return null;
        }

        // Debounce kontrolü - çok sık istek yapmayı önle
        const delay = config.get<number>('completionDelay', 500);
        const now = Date.now();
        
        if (now - this.lastRequestTime < delay) {
            return null;
        }
        
        this.lastRequestTime = now;

        // İptal kontrolü
        if (token.isCancellationRequested) {
            return null;
        }

        try {
            // Context bilgisini al
            const codeContext = this.contextService.getCodeContext(document, position);
            
            // Cache kontrolü
            const cacheKey = this.getCacheKey(document, position);
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey) || null;
            }

            // AI'dan tamamlama al
            const completion = await this.getAICompletion(
                codeContext,
                document.languageId,
                token
            );

            if (!completion || token.isCancellationRequested) {
                return null;
            }

            // InlineCompletionItem oluştur
            const item = new vscode.InlineCompletionItem(
                completion,
                new vscode.Range(position, position)
            );

            const items = [item];
            
            // Cache'e ekle (5 saniye geçerli)
            this.cache.set(cacheKey, items);
            setTimeout(() => this.cache.delete(cacheKey), 5000);

            return items;
        } catch (error) {
            console.error('Inline completion hatası:', error);
            return null;
        }
    }

    /**
     * AI'dan kod tamamlama alır
     */
    private async getAICompletion(
        codeContext: CodeContext,
        languageId: string,
        token: vscode.CancellationToken
    ): Promise<string | null> {
        // Minimum context kontrolü
        if (codeContext.linePrefix.trim().length < 2) {
            return null;
        }

        // Prompt oluştur
        const prompt = this.buildCompletionPrompt(codeContext, languageId);

        try {
            // AI servisinden tamamlama al
            const response = await this.aiService.getCompletion(prompt, {
                maxTokens: 150,
                temperature: 0.2, // Düşük sıcaklık = daha tutarlı
                stopSequences: ['\n\n', '```', '// '] // Tamamlamayı kes
            });

            if (token.isCancellationRequested) {
                return null;
            }

            // Yanıtı temizle ve döndür
            return this.cleanCompletion(response, codeContext);
        } catch {
            return null;
        }
    }

    /**
     * Tamamlama için prompt oluşturur
     */
    private buildCompletionPrompt(context: CodeContext, languageId: string): string {
        const languageName = this.getLanguageName(languageId);
        
        return `You are a code completion AI. Complete the following ${languageName} code.
Only output the completion, nothing else. Do not include any explanation.
Do not repeat the existing code. Just provide what comes next.

Context (previous lines):
${context.previousLines.join('\n')}

Current line to complete:
${context.linePrefix}

Complete the code naturally. Output only the completion:`;
    }

    /**
     * AI yanıtını temizler
     */
    private cleanCompletion(response: string, context: CodeContext): string | null {
        if (!response) {
            return null;
        }

        // Gereksiz boşlukları temizle
        let cleaned = response.trim();

        // Eğer mevcut satır içeriğini tekrar ediyorsa, kaldır
        if (cleaned.startsWith(context.linePrefix.trim())) {
            cleaned = cleaned.substring(context.linePrefix.trim().length);
        }

        // Kod bloğu işaretlerini kaldır
        cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');

        // Çok uzun tamamlamaları kes
        const lines = cleaned.split('\n');
        if (lines.length > 5) {
            cleaned = lines.slice(0, 5).join('\n');
        }

        // Boş veya çok kısa tamamlamaları reddet
        if (cleaned.length < 2) {
            return null;
        }

        return cleaned;
    }

    /**
     * Cache anahtarı oluşturur
     */
    private getCacheKey(document: vscode.TextDocument, position: vscode.Position): string {
        const line = document.lineAt(position.line).text;
        return `${document.uri.toString()}:${position.line}:${line.substring(0, position.character)}`;
    }

    /**
     * Dil ID'sinden dil adı döndürür
     */
    private getLanguageName(languageId: string): string {
        const languageMap: Record<string, string> = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'python': 'Python',
            'java': 'Java',
            'csharp': 'C#',
            'cpp': 'C++',
            'c': 'C',
            'go': 'Go',
            'rust': 'Rust',
            'ruby': 'Ruby',
            'php': 'PHP',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'scala': 'Scala',
            'r': 'R',
            'sql': 'SQL',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS',
            'json': 'JSON',
            'yaml': 'YAML',
            'markdown': 'Markdown',
            'shell': 'Shell/Bash',
            'powershell': 'PowerShell',
            'dockerfile': 'Dockerfile'
        };

        return languageMap[languageId] || languageId;
    }
}

/**
 * Kod context'i için tip tanımı
 */
interface CodeContext {
    linePrefix: string;          // İmleçten önceki satır içeriği
    lineSuffix: string;          // İmleçten sonraki satır içeriği
    previousLines: string[];     // Önceki satırlar (context için)
    nextLines: string[];         // Sonraki satırlar (context için)
    currentLine: string;         // Tam mevcut satır
    lineNumber: number;          // Satır numarası
    cursorColumn: number;        // İmleç kolonu
    fileName: string;            // Dosya adı
    languageId: string;          // Dil ID'si
}

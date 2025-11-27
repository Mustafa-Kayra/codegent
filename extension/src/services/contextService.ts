/**
 * AI Agent - Context Service
 * 
 * Kod context'i toplama ve yönetme işlemlerini sağlar.
 * Editor'daki mevcut durumu analiz eder.
 */

import * as vscode from 'vscode';

/**
 * Kod context'i tipi
 */
interface CodeContext {
    linePrefix: string;          // İmleçten önceki satır içeriği
    lineSuffix: string;          // İmleçten sonraki satır içeriği
    previousLines: string[];     // Önceki satırlar
    nextLines: string[];         // Sonraki satırlar
    currentLine: string;         // Mevcut satır
    lineNumber: number;          // Satır numarası
    cursorColumn: number;        // İmleç kolonu
    fileName: string;            // Dosya adı
    languageId: string;          // Dil ID'si
    selection: string;           // Seçili metin
    symbolContext: SymbolContext | null; // Sembol context'i
}

/**
 * Sembol context'i
 */
interface SymbolContext {
    currentSymbol: string | null;     // Mevcut sembol
    parentSymbol: string | null;      // Üst sembol
    symbolType: string | null;        // Sembol tipi (function, class, vb.)
    imports: string[];                // İçe aktarmalar
    exports: string[];                // Dışa aktarmalar
}

/**
 * Dosya context'i
 */
interface FileContext {
    fileName: string;
    languageId: string;
    totalLines: number;
    relativePath: string;
    workspaceFolder: string | null;
}

/**
 * Context servisi
 * Editor ve dosya context'i toplama
 */
export class ContextService {
    private contextCache: Map<string, { context: CodeContext; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 5000; // 5 saniye

    constructor() {}

    /**
     * Belirli bir pozisyon için kod context'i döndürür
     */
    getCodeContext(document: vscode.TextDocument, position: vscode.Position): CodeContext {
        // Cache kontrolü
        const cacheKey = `${document.uri.toString()}:${position.line}:${position.character}`;
        const cached = this.contextCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.context;
        }

        // Mevcut satır bilgileri
        const currentLine = document.lineAt(position.line);
        const linePrefix = currentLine.text.substring(0, position.character);
        const lineSuffix = currentLine.text.substring(position.character);

        // Önceki satırları al (maksimum 20)
        const previousLinesCount = Math.min(position.line, 20);
        const previousLines: string[] = [];
        for (let i = position.line - previousLinesCount; i < position.line; i++) {
            previousLines.push(document.lineAt(i).text);
        }

        // Sonraki satırları al (maksimum 10)
        const nextLinesCount = Math.min(document.lineCount - position.line - 1, 10);
        const nextLines: string[] = [];
        for (let i = position.line + 1; i <= position.line + nextLinesCount; i++) {
            nextLines.push(document.lineAt(i).text);
        }

        // Seçili metin
        const editor = vscode.window.activeTextEditor;
        const selection = editor?.selection.isEmpty ? '' : 
            document.getText(editor?.selection);

        // Sembol context'i
        const symbolContext = this.getSymbolContext(document, position);

        const context: CodeContext = {
            linePrefix,
            lineSuffix,
            previousLines,
            nextLines,
            currentLine: currentLine.text,
            lineNumber: position.line,
            cursorColumn: position.character,
            fileName: this.getFileName(document.uri),
            languageId: document.languageId,
            selection,
            symbolContext
        };

        // Cache'e ekle
        this.contextCache.set(cacheKey, { context, timestamp: Date.now() });

        return context;
    }

    /**
     * Sembol context'i döndürür
     */
    private getSymbolContext(document: vscode.TextDocument, position: vscode.Position): SymbolContext | null {
        const text = document.getText();
        const offset = document.offsetAt(position);

        // Basit sembol analizi
        const imports: string[] = [];
        const exports: string[] = [];
        let currentSymbol: string | null = null;
        let parentSymbol: string | null = null;
        let symbolType: string | null = null;

        // Import'ları bul
        const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(text)) !== null) {
            imports.push(match[1]);
        }

        // Export'ları bul
        const exportRegex = /export\s+(default\s+)?(function|class|const|let|var)\s+(\w+)/g;
        while ((match = exportRegex.exec(text)) !== null) {
            exports.push(match[3]);
        }

        // Mevcut fonksiyon/class'ı bul
        const functionRegex = /(function|class|const|let|var)\s+(\w+)/g;
        let lastMatch: RegExpExecArray | null = null;
        
        while ((match = functionRegex.exec(text)) !== null) {
            if (match.index < offset) {
                lastMatch = match;
            } else {
                break;
            }
        }

        if (lastMatch) {
            symbolType = lastMatch[1];
            currentSymbol = lastMatch[2];
        }

        return {
            currentSymbol,
            parentSymbol,
            symbolType,
            imports,
            exports
        };
    }

    /**
     * Dosya context'i döndürür
     */
    getFileContext(document: vscode.TextDocument): FileContext {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        
        let relativePath = document.uri.fsPath;
        if (workspaceFolder) {
            relativePath = vscode.workspace.asRelativePath(document.uri, false);
        }

        return {
            fileName: this.getFileName(document.uri),
            languageId: document.languageId,
            totalLines: document.lineCount,
            relativePath,
            workspaceFolder: workspaceFolder?.name || null
        };
    }

    /**
     * Aktif editör context'i döndürür
     */
    getActiveEditorContext(): { document: vscode.TextDocument; context: CodeContext } | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }

        return {
            document: editor.document,
            context: this.getCodeContext(editor.document, editor.selection.active)
        };
    }

    /**
     * Workspace context'i döndürür
     */
    getWorkspaceContext(): { folders: string[]; openFiles: string[] } {
        const folders = vscode.workspace.workspaceFolders?.map(f => f.name) || [];
        const openFiles = vscode.window.visibleTextEditors
            .map(e => this.getFileName(e.document.uri));

        return { folders, openFiles };
    }

    /**
     * Belirli bir dil için snippet önerileri döndürür
     */
    getLanguageSnippets(languageId: string): string[] {
        // Dile özgü yaygın snippet'ler
        const snippetMap: Record<string, string[]> = {
            'javascript': [
                'console.log()',
                'function name() {}',
                'const name = () => {}',
                'async function name() {}',
                'try { } catch (error) { }',
                'if (condition) { }',
                'for (let i = 0; i < length; i++) { }',
                'array.map(item => )',
                'array.filter(item => )',
                'array.reduce((acc, item) => )'
            ],
            'typescript': [
                'interface Name { }',
                'type Name = { }',
                'enum Name { }',
                'class Name { }',
                'function name<T>(): T { }',
                'const name: Type = value',
                'async function name(): Promise<Type> { }'
            ],
            'python': [
                'def function_name():',
                'class ClassName:',
                'if condition:',
                'for item in iterable:',
                'try:\n    pass\nexcept Exception as e:',
                'with open(file) as f:',
                'lambda x: expression',
                'list comprehension: [x for x in iterable]'
            ],
            'java': [
                'public class Name { }',
                'public void methodName() { }',
                'public static void main(String[] args) { }',
                'try { } catch (Exception e) { }',
                'for (int i = 0; i < length; i++) { }',
                'if (condition) { }'
            ]
        };

        return snippetMap[languageId] || [];
    }

    /**
     * Dosya adını URI'den çıkarır
     */
    private getFileName(uri: vscode.Uri): string {
        const parts = uri.fsPath.split(/[/\\]/);
        return parts[parts.length - 1];
    }

    /**
     * İlgili dosyaları bulur
     */
    async findRelatedFiles(document: vscode.TextDocument): Promise<string[]> {
        const baseName = this.getFileName(document.uri).replace(/\.[^.]+$/, '');
        const relatedFiles: string[] = [];

        // İlgili dosyaları ara (test, spec, css, vb.)
        const patterns = [
            `**/${baseName}.test.*`,
            `**/${baseName}.spec.*`,
            `**/${baseName}.css`,
            `**/${baseName}.scss`,
            `**/${baseName}.module.css`
        ];

        for (const pattern of patterns) {
            const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 5);
            relatedFiles.push(...files.map(f => this.getFileName(f)));
        }

        return relatedFiles;
    }

    /**
     * Cache'i temizler
     */
    clearCache(): void {
        this.contextCache.clear();
    }
}

export { CodeContext, SymbolContext, FileContext };

/**
 * AI Agent - Language Utils
 * 
 * Programlama dili algılama ve işleme yardımcıları.
 */

/**
 * Dil bilgisi tipi
 */
interface LanguageInfo {
    id: string;
    name: string;
    extensions: string[];
    commentSingle: string;
    commentMultiStart: string;
    commentMultiEnd: string;
}

/**
 * Desteklenen diller ve özellikleri
 */
const LANGUAGE_MAP: Record<string, LanguageInfo> = {
    'javascript': {
        id: 'javascript',
        name: 'JavaScript',
        extensions: ['.js', '.mjs', '.cjs'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'typescript': {
        id: 'typescript',
        name: 'TypeScript',
        extensions: ['.ts', '.mts', '.cts'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'typescriptreact': {
        id: 'typescriptreact',
        name: 'TypeScript React',
        extensions: ['.tsx'],
        commentSingle: '//',
        commentMultiStart: '{/*',
        commentMultiEnd: '*/}'
    },
    'javascriptreact': {
        id: 'javascriptreact',
        name: 'JavaScript React',
        extensions: ['.jsx'],
        commentSingle: '//',
        commentMultiStart: '{/*',
        commentMultiEnd: '*/}'
    },
    'python': {
        id: 'python',
        name: 'Python',
        extensions: ['.py', '.pyw', '.pyi'],
        commentSingle: '#',
        commentMultiStart: '"""',
        commentMultiEnd: '"""'
    },
    'java': {
        id: 'java',
        name: 'Java',
        extensions: ['.java'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'csharp': {
        id: 'csharp',
        name: 'C#',
        extensions: ['.cs'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'cpp': {
        id: 'cpp',
        name: 'C++',
        extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'c': {
        id: 'c',
        name: 'C',
        extensions: ['.c', '.h'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'go': {
        id: 'go',
        name: 'Go',
        extensions: ['.go'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'rust': {
        id: 'rust',
        name: 'Rust',
        extensions: ['.rs'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'ruby': {
        id: 'ruby',
        name: 'Ruby',
        extensions: ['.rb', '.rake', '.gemspec'],
        commentSingle: '#',
        commentMultiStart: '=begin',
        commentMultiEnd: '=end'
    },
    'php': {
        id: 'php',
        name: 'PHP',
        extensions: ['.php', '.phtml'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'swift': {
        id: 'swift',
        name: 'Swift',
        extensions: ['.swift'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'kotlin': {
        id: 'kotlin',
        name: 'Kotlin',
        extensions: ['.kt', '.kts'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'scala': {
        id: 'scala',
        name: 'Scala',
        extensions: ['.scala', '.sc'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'html': {
        id: 'html',
        name: 'HTML',
        extensions: ['.html', '.htm'],
        commentSingle: '',
        commentMultiStart: '<!--',
        commentMultiEnd: '-->'
    },
    'css': {
        id: 'css',
        name: 'CSS',
        extensions: ['.css'],
        commentSingle: '',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'scss': {
        id: 'scss',
        name: 'SCSS',
        extensions: ['.scss'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'less': {
        id: 'less',
        name: 'Less',
        extensions: ['.less'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'json': {
        id: 'json',
        name: 'JSON',
        extensions: ['.json', '.jsonc'],
        commentSingle: '',
        commentMultiStart: '',
        commentMultiEnd: ''
    },
    'yaml': {
        id: 'yaml',
        name: 'YAML',
        extensions: ['.yaml', '.yml'],
        commentSingle: '#',
        commentMultiStart: '',
        commentMultiEnd: ''
    },
    'markdown': {
        id: 'markdown',
        name: 'Markdown',
        extensions: ['.md', '.markdown'],
        commentSingle: '',
        commentMultiStart: '<!--',
        commentMultiEnd: '-->'
    },
    'sql': {
        id: 'sql',
        name: 'SQL',
        extensions: ['.sql'],
        commentSingle: '--',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'shellscript': {
        id: 'shellscript',
        name: 'Shell',
        extensions: ['.sh', '.bash', '.zsh'],
        commentSingle: '#',
        commentMultiStart: '',
        commentMultiEnd: ''
    },
    'powershell': {
        id: 'powershell',
        name: 'PowerShell',
        extensions: ['.ps1', '.psm1', '.psd1'],
        commentSingle: '#',
        commentMultiStart: '<#',
        commentMultiEnd: '#>'
    },
    'dockerfile': {
        id: 'dockerfile',
        name: 'Dockerfile',
        extensions: ['Dockerfile'],
        commentSingle: '#',
        commentMultiStart: '',
        commentMultiEnd: ''
    },
    'lua': {
        id: 'lua',
        name: 'Lua',
        extensions: ['.lua'],
        commentSingle: '--',
        commentMultiStart: '--[[',
        commentMultiEnd: ']]'
    },
    'perl': {
        id: 'perl',
        name: 'Perl',
        extensions: ['.pl', '.pm'],
        commentSingle: '#',
        commentMultiStart: '=pod',
        commentMultiEnd: '=cut'
    },
    'r': {
        id: 'r',
        name: 'R',
        extensions: ['.r', '.R'],
        commentSingle: '#',
        commentMultiStart: '',
        commentMultiEnd: ''
    },
    'dart': {
        id: 'dart',
        name: 'Dart',
        extensions: ['.dart'],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/'
    },
    'vue': {
        id: 'vue',
        name: 'Vue',
        extensions: ['.vue'],
        commentSingle: '//',
        commentMultiStart: '<!--',
        commentMultiEnd: '-->'
    },
    'svelte': {
        id: 'svelte',
        name: 'Svelte',
        extensions: ['.svelte'],
        commentSingle: '//',
        commentMultiStart: '<!--',
        commentMultiEnd: '-->'
    }
};

/**
 * Dosya uzantısından dil bilgisi döndürür
 */
export function getLanguageFromExtension(extension: string): LanguageInfo | undefined {
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    
    for (const [_id, info] of Object.entries(LANGUAGE_MAP)) {
        if (info.extensions.includes(ext)) {
            return info;
        }
    }
    
    return undefined;
}

/**
 * Dil ID'sinden dil bilgisi döndürür
 */
export function getLanguageById(languageId: string): LanguageInfo | undefined {
    return LANGUAGE_MAP[languageId];
}

/**
 * Dil için tek satırlık yorum döndürür
 */
export function getSingleLineComment(languageId: string): string {
    const info = LANGUAGE_MAP[languageId];
    return info?.commentSingle || '//';
}

/**
 * Dil için çok satırlı yorum başlangıcı döndürür
 */
export function getMultiLineCommentStart(languageId: string): string {
    const info = LANGUAGE_MAP[languageId];
    return info?.commentMultiStart || '/*';
}

/**
 * Dil için çok satırlı yorum sonu döndürür
 */
export function getMultiLineCommentEnd(languageId: string): string {
    const info = LANGUAGE_MAP[languageId];
    return info?.commentMultiEnd || '*/';
}

/**
 * Metni yorum olarak formatlar
 */
export function formatAsComment(text: string, languageId: string, multiLine: boolean = false): string {
    const lines = text.split('\n');
    
    if (multiLine) {
        const start = getMultiLineCommentStart(languageId);
        const end = getMultiLineCommentEnd(languageId);
        
        if (start && end) {
            return `${start}\n${lines.map(l => ` * ${l}`).join('\n')}\n ${end}`;
        }
    }
    
    const comment = getSingleLineComment(languageId);
    return lines.map(l => `${comment} ${l}`).join('\n');
}

/**
 * Tüm desteklenen dilleri döndürür
 */
export function getSupportedLanguages(): LanguageInfo[] {
    return Object.values(LANGUAGE_MAP);
}

/**
 * Dil ID'lerini döndürür
 */
export function getSupportedLanguageIds(): string[] {
    return Object.keys(LANGUAGE_MAP);
}

/**
 * Dilin desteklenip desteklenmediğini kontrol eder
 */
export function isLanguageSupported(languageId: string): boolean {
    return languageId in LANGUAGE_MAP;
}

/**
 * Dosya adından dil ID'si çıkarır
 */
export function getLanguageIdFromFileName(fileName: string): string {
    const parts = fileName.split('.');
    if (parts.length < 2) {
        // Dockerfile gibi özel durumlar
        if (fileName === 'Dockerfile') {
            return 'dockerfile';
        }
        return 'plaintext';
    }
    
    const ext = `.${parts[parts.length - 1]}`;
    const info = getLanguageFromExtension(ext);
    return info?.id || 'plaintext';
}

/**
 * Dil için doğru indentasyon karakteri döndürür
 */
export function getIndentation(languageId: string, useSpaces: boolean = true, size: number = 4): string {
    // Python için her zaman space kullan
    if (languageId === 'python') {
        return ' '.repeat(4);
    }
    
    // Go için her zaman tab kullan
    if (languageId === 'go') {
        return '\t';
    }
    
    return useSpaces ? ' '.repeat(size) : '\t';
}

/**
 * Kod bloğunu formatlar
 */
export function formatCodeBlock(code: string, languageId: string): string {
    return `\`\`\`${languageId}\n${code}\n\`\`\``;
}

/**
 * Dil adını insan okunabilir formata çevirir
 */
export function getHumanReadableLanguageName(languageId: string): string {
    const info = LANGUAGE_MAP[languageId];
    return info?.name || languageId;
}

export { LanguageInfo, LANGUAGE_MAP };

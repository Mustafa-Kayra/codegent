/**
 * Language Utilities
 * Helpers for language-specific operations
 */

export interface LanguageConfig {
  id: string;
  name: string;
  extensions: string[];
  commentSingle: string;
  commentMultiStart?: string;
  commentMultiEnd?: string;
  stringDelimiters: string[];
}

export const LANGUAGE_CONFIGS: LanguageConfig[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    extensions: ['.js', '.mjs', '.cjs'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ["'", '"', '`']
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extensions: ['.ts', '.mts', '.cts'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ["'", '"', '`']
  },
  {
    id: 'typescriptreact',
    name: 'TypeScript React',
    extensions: ['.tsx'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ["'", '"', '`']
  },
  {
    id: 'javascriptreact',
    name: 'JavaScript React',
    extensions: ['.jsx'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ["'", '"', '`']
  },
  {
    id: 'python',
    name: 'Python',
    extensions: ['.py', '.pyw'],
    commentSingle: '#',
    commentMultiStart: '"""',
    commentMultiEnd: '"""',
    stringDelimiters: ["'", '"', "'''", '"""']
  },
  {
    id: 'java',
    name: 'Java',
    extensions: ['.java'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ['"']
  },
  {
    id: 'csharp',
    name: 'C#',
    extensions: ['.cs'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ['"', '@"']
  },
  {
    id: 'cpp',
    name: 'C++',
    extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'c',
    name: 'C',
    extensions: ['.c', '.h'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'go',
    name: 'Go',
    extensions: ['.go'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ['"', '`']
  },
  {
    id: 'rust',
    name: 'Rust',
    extensions: ['.rs'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ['"']
  },
  {
    id: 'ruby',
    name: 'Ruby',
    extensions: ['.rb'],
    commentSingle: '#',
    commentMultiStart: '=begin',
    commentMultiEnd: '=end',
    stringDelimiters: ["'", '"']
  },
  {
    id: 'php',
    name: 'PHP',
    extensions: ['.php'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ["'", '"']
  },
  {
    id: 'swift',
    name: 'Swift',
    extensions: ['.swift'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ['"']
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    extensions: ['.kt', '.kts'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ['"', "'''"]
  },
  {
    id: 'html',
    name: 'HTML',
    extensions: ['.html', '.htm'],
    commentSingle: '',
    commentMultiStart: '<!--',
    commentMultiEnd: '-->',
    stringDelimiters: ["'", '"']
  },
  {
    id: 'css',
    name: 'CSS',
    extensions: ['.css'],
    commentSingle: '',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ["'", '"']
  },
  {
    id: 'scss',
    name: 'SCSS',
    extensions: ['.scss'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ["'", '"']
  },
  {
    id: 'sql',
    name: 'SQL',
    extensions: ['.sql'],
    commentSingle: '--',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
    stringDelimiters: ["'"]
  },
  {
    id: 'shellscript',
    name: 'Shell Script',
    extensions: ['.sh', '.bash'],
    commentSingle: '#',
    stringDelimiters: ["'", '"']
  },
  {
    id: 'yaml',
    name: 'YAML',
    extensions: ['.yaml', '.yml'],
    commentSingle: '#',
    stringDelimiters: ["'", '"']
  },
  {
    id: 'json',
    name: 'JSON',
    extensions: ['.json'],
    commentSingle: '',
    stringDelimiters: ['"']
  },
  {
    id: 'markdown',
    name: 'Markdown',
    extensions: ['.md', '.markdown'],
    commentSingle: '',
    commentMultiStart: '<!--',
    commentMultiEnd: '-->',
    stringDelimiters: []
  },
  {
    id: 'vue',
    name: 'Vue',
    extensions: ['.vue'],
    commentSingle: '//',
    commentMultiStart: '<!--',
    commentMultiEnd: '-->',
    stringDelimiters: ["'", '"', '`']
  },
  {
    id: 'svelte',
    name: 'Svelte',
    extensions: ['.svelte'],
    commentSingle: '//',
    commentMultiStart: '<!--',
    commentMultiEnd: '-->',
    stringDelimiters: ["'", '"', '`']
  }
];

/**
 * Get language configuration by language ID
 */
export function getLanguageConfig(languageId: string): LanguageConfig | undefined {
  return LANGUAGE_CONFIGS.find(config => config.id === languageId);
}

/**
 * Get language ID from file extension
 */
export function getLanguageIdFromExtension(extension: string): string | undefined {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  const config = LANGUAGE_CONFIGS.find(c => c.extensions.includes(ext));
  return config?.id;
}

/**
 * Check if a position is inside a comment
 */
export function isInComment(
  line: string,
  position: number,
  languageId: string
): boolean {
  const config = getLanguageConfig(languageId);
  if (!config) return false;

  const beforeCursor = line.substring(0, position);

  // Check single-line comment
  if (config.commentSingle && beforeCursor.includes(config.commentSingle)) {
    return true;
  }

  // Check multi-line comment (simplified - doesn't track across lines)
  if (config.commentMultiStart && config.commentMultiEnd) {
    const multiStart = beforeCursor.lastIndexOf(config.commentMultiStart);
    const multiEnd = beforeCursor.lastIndexOf(config.commentMultiEnd);
    if (multiStart > multiEnd) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a position is inside a string
 */
export function isInString(
  line: string,
  position: number,
  languageId: string
): boolean {
  const config = getLanguageConfig(languageId);
  if (!config) return false;

  const beforeCursor = line.substring(0, position);

  for (const delimiter of config.stringDelimiters) {
    let count = 0;
    let i = 0;
    
    while (i < beforeCursor.length) {
      if (beforeCursor.substring(i, i + delimiter.length) === delimiter) {
        // Check if escaped
        if (i === 0 || beforeCursor[i - 1] !== '\\') {
          count++;
        }
        i += delimiter.length;
      } else {
        i++;
      }
    }

    // If odd count, we're inside a string
    if (count % 2 !== 0) {
      return true;
    }
  }

  return false;
}

/**
 * Get the comment prefix for a language
 */
export function getCommentPrefix(languageId: string): string {
  const config = getLanguageConfig(languageId);
  return config?.commentSingle || '//';
}

/**
 * Wrap code in a documentation comment
 */
export function wrapInDocComment(
  content: string,
  languageId: string
): string {
  const config = getLanguageConfig(languageId);
  
  if (!config) {
    return `// ${content}`;
  }

  if (languageId === 'python') {
    return `"""${content}"""`;
  }

  if (config.commentMultiStart && config.commentMultiEnd) {
    return `${config.commentMultiStart}\n * ${content.split('\n').join('\n * ')}\n ${config.commentMultiEnd}`;
  }

  if (config.commentSingle) {
    return content.split('\n').map(line => `${config.commentSingle} ${line}`).join('\n');
  }

  return content;
}

/**
 * Extract code blocks from markdown
 */
export function extractCodeBlocks(markdown: string): { language: string; code: string }[] {
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  const blocks: { language: string; code: string }[] = [];
  
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || 'plaintext',
      code: match[2].trim()
    });
  }
  
  return blocks;
}

/**
 * Detect the language of a code snippet
 */
export function detectLanguage(code: string): string {
  // Simple heuristics for language detection
  const patterns: [RegExp, string][] = [
    [/^import\s+.*\s+from\s+['"]|^export\s+(default\s+)?(function|class|const|let|var)/m, 'javascript'],
    [/^import\s+.*\s+from\s+['"].*['"];?\s*$/m, 'typescript'],
    [/^def\s+\w+\s*\(|^class\s+\w+\s*:|^import\s+\w+\s*$|^from\s+\w+\s+import/m, 'python'],
    [/^package\s+\w+;|^import\s+\w+\.\w+;|public\s+class\s+\w+/m, 'java'],
    [/^using\s+\w+;|namespace\s+\w+\s*{|public\s+class\s+\w+\s*:/m, 'csharp'],
    [/^#include\s*<|^int\s+main\s*\(|^void\s+\w+\s*\(/m, 'cpp'],
    [/^package\s+main|^func\s+\w+\s*\(|^import\s*\(/m, 'go'],
    [/^fn\s+\w+\s*\(|^let\s+mut\s+|^use\s+\w+::/m, 'rust'],
    [/^require\s+['"]|^class\s+\w+\s*<\s*\w+|^def\s+\w+\s*$/m, 'ruby'],
    [/<\?php|^function\s+\w+\s*\(|^\$\w+\s*=/m, 'php'],
    [/^<!DOCTYPE\s+html>|^<html|^<head>|^<body>/mi, 'html'],
    [/^body\s*{|^\.[\w-]+\s*{|^#[\w-]+\s*{|@media\s*\(/m, 'css'],
    [/^SELECT\s+|^INSERT\s+INTO|^UPDATE\s+|^CREATE\s+TABLE/mi, 'sql'],
    [/^#!/m, 'shellscript'],
  ];

  for (const [pattern, language] of patterns) {
    if (pattern.test(code)) {
      return language;
    }
  }

  return 'plaintext';
}

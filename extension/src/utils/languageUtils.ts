// Language detection utilities for Codegent

export interface LanguageInfo {
  id: string;
  name: string;
  extensions: string[];
  aliases: string[];
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.mjs', '.cjs'], aliases: ['js'] },
  { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.mts', '.cts'], aliases: ['ts'] },
  { id: 'javascriptreact', name: 'JavaScript React', extensions: ['.jsx'], aliases: ['jsx'] },
  { id: 'typescriptreact', name: 'TypeScript React', extensions: ['.tsx'], aliases: ['tsx'] },
  { id: 'python', name: 'Python', extensions: ['.py', '.pyw', '.pyi'], aliases: ['py'] },
  { id: 'java', name: 'Java', extensions: ['.java'], aliases: [] },
  { id: 'c', name: 'C', extensions: ['.c', '.h'], aliases: [] },
  { id: 'cpp', name: 'C++', extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hxx'], aliases: ['c++'] },
  { id: 'csharp', name: 'C#', extensions: ['.cs'], aliases: ['cs', 'c#'] },
  { id: 'go', name: 'Go', extensions: ['.go'], aliases: ['golang'] },
  { id: 'rust', name: 'Rust', extensions: ['.rs'], aliases: [] },
  { id: 'ruby', name: 'Ruby', extensions: ['.rb', '.rake', '.gemspec'], aliases: [] },
  { id: 'php', name: 'PHP', extensions: ['.php', '.phtml'], aliases: [] },
  { id: 'swift', name: 'Swift', extensions: ['.swift'], aliases: [] },
  { id: 'kotlin', name: 'Kotlin', extensions: ['.kt', '.kts'], aliases: [] },
  { id: 'scala', name: 'Scala', extensions: ['.scala', '.sc'], aliases: [] },
  { id: 'r', name: 'R', extensions: ['.r', '.R'], aliases: [] },
  { id: 'perl', name: 'Perl', extensions: ['.pl', '.pm'], aliases: [] },
  { id: 'lua', name: 'Lua', extensions: ['.lua'], aliases: [] },
  { id: 'haskell', name: 'Haskell', extensions: ['.hs', '.lhs'], aliases: [] },
  { id: 'elixir', name: 'Elixir', extensions: ['.ex', '.exs'], aliases: [] },
  { id: 'clojure', name: 'Clojure', extensions: ['.clj', '.cljs', '.cljc'], aliases: [] },
  { id: 'fsharp', name: 'F#', extensions: ['.fs', '.fsi', '.fsx'], aliases: ['f#'] },
  { id: 'dart', name: 'Dart', extensions: ['.dart'], aliases: [] },
  { id: 'julia', name: 'Julia', extensions: ['.jl'], aliases: [] },
  { id: 'sql', name: 'SQL', extensions: ['.sql'], aliases: [] },
  { id: 'html', name: 'HTML', extensions: ['.html', '.htm'], aliases: [] },
  { id: 'css', name: 'CSS', extensions: ['.css'], aliases: [] },
  { id: 'scss', name: 'SCSS', extensions: ['.scss'], aliases: ['sass'] },
  { id: 'less', name: 'Less', extensions: ['.less'], aliases: [] },
  { id: 'json', name: 'JSON', extensions: ['.json'], aliases: [] },
  { id: 'xml', name: 'XML', extensions: ['.xml', '.xsl', '.xsd'], aliases: [] },
  { id: 'yaml', name: 'YAML', extensions: ['.yaml', '.yml'], aliases: [] },
  { id: 'markdown', name: 'Markdown', extensions: ['.md', '.markdown'], aliases: ['md'] },
  { id: 'latex', name: 'LaTeX', extensions: ['.tex', '.latex'], aliases: ['tex'] },
  { id: 'shellscript', name: 'Shell Script', extensions: ['.sh', '.bash', '.zsh'], aliases: ['bash', 'shell'] },
  { id: 'powershell', name: 'PowerShell', extensions: ['.ps1', '.psm1', '.psd1'], aliases: ['ps'] },
  { id: 'dockerfile', name: 'Dockerfile', extensions: ['Dockerfile', '.dockerfile'], aliases: ['docker'] },
  { id: 'graphql', name: 'GraphQL', extensions: ['.graphql', '.gql'], aliases: [] },
  { id: 'solidity', name: 'Solidity', extensions: ['.sol'], aliases: [] },
  { id: 'asm', name: 'Assembly', extensions: ['.asm', '.s'], aliases: ['assembly'] }
];

export function getLanguageById(id: string): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => 
    lang.id === id || lang.aliases.includes(id.toLowerCase())
  );
}

export function getLanguageByExtension(extension: string): LanguageInfo | undefined {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return SUPPORTED_LANGUAGES.find(lang => 
    lang.extensions.includes(ext.toLowerCase())
  );
}

export function getLanguageByFileName(fileName: string): LanguageInfo | undefined {
  const parts = fileName.split('.');
  if (parts.length < 2) {
    // Check for special files like Dockerfile
    return SUPPORTED_LANGUAGES.find(lang => 
      lang.extensions.includes(fileName)
    );
  }
  
  const extension = `.${parts.pop()?.toLowerCase()}`;
  return getLanguageByExtension(extension);
}

export function getAllLanguageIds(): string[] {
  return SUPPORTED_LANGUAGES.map(lang => lang.id);
}

export function getLanguageCompletionHint(languageId: string): string {
  const hints: Record<string, string> = {
    javascript: 'Use modern ES6+ syntax, prefer const/let over var, use async/await',
    typescript: 'Include type annotations, use interfaces for objects, prefer unknown over any',
    python: 'Follow PEP 8 style guide, use type hints, prefer f-strings',
    java: 'Follow Java naming conventions, use Optional for nullable returns',
    go: 'Follow Go idioms, handle errors explicitly, use short variable names',
    rust: 'Follow Rust ownership rules, use Result for errors, prefer &str over String',
    cpp: 'Use modern C++ features, prefer smart pointers, use RAII',
    csharp: 'Use async/await, prefer var when type is obvious, use LINQ'
  };

  return hints[languageId] || '';
}

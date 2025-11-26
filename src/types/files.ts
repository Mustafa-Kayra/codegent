/**
 * Represents a file in the virtual file system
 */
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  path: string;
}

/**
 * Supported programming languages
 */
export type SupportedLanguage = 
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'python'
  | 'java'
  | 'dart'  // Flutter
  | 'go'
  | 'rust'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'json'
  | 'yaml'
  | 'markdown'
  | 'plaintext';

/**
 * Mapping of file extensions to languages
 */
export const extensionToLanguage: Record<string, SupportedLanguage> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.py': 'python',
  '.java': 'java',
  '.dart': 'dart',
  '.go': 'go',
  '.rs': 'rust',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.txt': 'plaintext',
};

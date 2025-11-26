import { extensionToLanguage, SupportedLanguage } from '../types';

/**
 * Get the language for a file based on its extension
 */
export function getLanguageFromFilename(filename: string): SupportedLanguage {
  const ext = filename.substring(filename.lastIndexOf('.'));
  return extensionToLanguage[ext.toLowerCase()] || 'plaintext';
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Format diff statistics for display
 */
export function formatDiffStats(linesAdded: number, linesRemoved: number): string {
  const addedStr = linesAdded > 0 ? `+${linesAdded}` : '+0';
  const removedStr = linesRemoved > 0 ? `-${linesRemoved}` : '-0';
  return `${addedStr} ${removedStr} lines`;
}

/**
 * Count lines in a string
 */
export function countLines(content: string): number {
  if (!content) return 0;
  return content.split('\n').length;
}

/**
 * Calculate diff between old and new content
 */
export function calculateDiff(oldContent: string, newContent: string): { added: number; removed: number } {
  const oldLines = oldContent ? oldContent.split('\n').length : 0;
  const newLines = newContent ? newContent.split('\n').length : 0;
  
  if (oldLines === 0) {
    return { added: newLines, removed: 0 };
  }
  
  if (newLines === 0) {
    return { added: 0, removed: oldLines };
  }
  
  // Simplified diff calculation
  const diff = newLines - oldLines;
  if (diff >= 0) {
    return { added: diff, removed: 0 };
  } else {
    return { added: 0, removed: Math.abs(diff) };
  }
}

/**
 * Extract file path from a full path
 */
export function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

/**
 * Get parent directory path
 */
export function getParentPath(path: string): string {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '/';
}

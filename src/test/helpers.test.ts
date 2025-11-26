import { describe, it, expect } from 'vitest';
import {
  getLanguageFromFilename,
  generateId,
  formatDiffStats,
  countLines,
  calculateDiff,
  getFileName,
  getParentPath,
} from '../utils/helpers';

describe('helpers', () => {
  describe('getLanguageFromFilename', () => {
    it('should return correct language for known extensions', () => {
      expect(getLanguageFromFilename('index.html')).toBe('html');
      expect(getLanguageFromFilename('styles.css')).toBe('css');
      expect(getLanguageFromFilename('app.js')).toBe('javascript');
      expect(getLanguageFromFilename('main.ts')).toBe('typescript');
      expect(getLanguageFromFilename('app.tsx')).toBe('typescript');
      expect(getLanguageFromFilename('main.py')).toBe('python');
      expect(getLanguageFromFilename('main.dart')).toBe('dart');
      expect(getLanguageFromFilename('main.go')).toBe('go');
    });

    it('should return plaintext for unknown extensions', () => {
      expect(getLanguageFromFilename('file.unknown')).toBe('plaintext');
      expect(getLanguageFromFilename('noextension')).toBe('plaintext');
    });

    it('should be case-insensitive', () => {
      expect(getLanguageFromFilename('INDEX.HTML')).toBe('html');
      expect(getLanguageFromFilename('App.CSS')).toBe('css');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should return a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('formatDiffStats', () => {
    it('should format positive changes correctly', () => {
      expect(formatDiffStats(10, 5)).toBe('+10 -5 lines');
    });

    it('should handle zero values', () => {
      expect(formatDiffStats(0, 0)).toBe('+0 -0 lines');
      expect(formatDiffStats(10, 0)).toBe('+10 -0 lines');
      expect(formatDiffStats(0, 10)).toBe('+0 -10 lines');
    });

    it('should handle large numbers', () => {
      expect(formatDiffStats(1000, 500)).toBe('+1000 -500 lines');
    });
  });

  describe('countLines', () => {
    it('should count lines correctly', () => {
      expect(countLines('line1\nline2\nline3')).toBe(3);
      expect(countLines('single line')).toBe(1);
      expect(countLines('')).toBe(0);
    });

    it('should handle empty content', () => {
      expect(countLines('')).toBe(0);
    });

    it('should handle content with trailing newline', () => {
      expect(countLines('line1\nline2\n')).toBe(3);
    });
  });

  describe('calculateDiff', () => {
    it('should calculate lines added for new content', () => {
      const result = calculateDiff('', 'line1\nline2\nline3');
      expect(result.added).toBe(3);
      expect(result.removed).toBe(0);
    });

    it('should calculate lines removed for deleted content', () => {
      const result = calculateDiff('line1\nline2\nline3', '');
      expect(result.added).toBe(0);
      expect(result.removed).toBe(3);
    });

    it('should calculate positive diff when lines increase', () => {
      const result = calculateDiff('line1', 'line1\nline2\nline3');
      expect(result.added).toBe(2);
      expect(result.removed).toBe(0);
    });

    it('should calculate negative diff when lines decrease', () => {
      const result = calculateDiff('line1\nline2\nline3', 'line1');
      expect(result.added).toBe(0);
      expect(result.removed).toBe(2);
    });
  });

  describe('getFileName', () => {
    it('should extract filename from path', () => {
      expect(getFileName('/path/to/file.txt')).toBe('file.txt');
      expect(getFileName('file.txt')).toBe('file.txt');
      expect(getFileName('/file.txt')).toBe('file.txt');
    });
  });

  describe('getParentPath', () => {
    it('should return parent directory', () => {
      expect(getParentPath('/path/to/file.txt')).toBe('/path/to');
      expect(getParentPath('/file.txt')).toBe('/');
    });

    it('should return root for top-level files', () => {
      expect(getParentPath('file.txt')).toBe('/');
    });
  });
});

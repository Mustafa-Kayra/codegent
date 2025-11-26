import Editor from '@monaco-editor/react';
import { FileNode } from '../types';
import { getLanguageFromFilename } from '../utils';

interface CodeEditorProps {
  file: FileNode | null;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

/**
 * Monaco-based code editor component
 * This is the core editor based on VS Code's editor
 */
export function CodeEditor({ file, onChange, readOnly = false }: CodeEditorProps) {
  const handleChange = (value: string | undefined) => {
    if (onChange && value !== undefined) {
      onChange(value);
    }
  };

  if (!file) {
    return (
      <div className="editor-placeholder">
        <div className="placeholder-content">
          <h2>Codegent</h2>
          <p>Select a file to edit or use the AI Agent to generate code.</p>
          <div className="shortcut-hints">
            <span><kbd>Ctrl</kbd> + <kbd>K</kbd> - Open AI Command</span>
            <span><kbd>Ctrl</kbd> + <kbd>S</kbd> - Save File</span>
          </div>
        </div>
      </div>
    );
  }

  const language = getLanguageFromFilename(file.name);

  return (
    <div className="code-editor">
      <div className="editor-header">
        <span className="file-name">{file.name}</span>
        <span className="file-path">{file.path}</span>
      </div>
      <Editor
        height="calc(100% - 35px)"
        language={language}
        value={file.content || ''}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 10 },
          bracketPairColorization: { enabled: true },
          cursorBlinking: 'smooth',
          smoothScrolling: true,
        }}
      />
    </div>
  );
}

export default CodeEditor;

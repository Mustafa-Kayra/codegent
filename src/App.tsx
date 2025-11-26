import { useState, useCallback, useMemo } from 'react';
import { CodeEditor, ChatPanel, FileExplorer, DiffStats } from './components';
import { AIAgent } from './agent';
import { FileNode, CodeChange } from './types';
import { generateId } from './utils';
import './styles/App.css';

/**
 * Main Codegent Application
 * A simplified VS Code clone with integrated AI coding agent
 */
function App() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [recentChanges, setRecentChanges] = useState<CodeChange[]>([]);
  const [showChat, setShowChat] = useState(true);

  // Create AI Agent instance
  const agent = useMemo(() => new AIAgent(), []);

  // Handle file selection
  const handleFileSelect = useCallback((file: FileNode) => {
    setSelectedFile(file);
  }, []);

  // Handle file content change in editor
  const handleFileChange = useCallback((content: string) => {
    if (!selectedFile) return;

    setFiles((prevFiles) => {
      const updateNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => {
          if (node.id === selectedFile.id) {
            return { ...node, content };
          }
          if (node.children) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      return updateNode(prevFiles);
    });

    setSelectedFile((prev) => (prev ? { ...prev, content } : null));
  }, [selectedFile]);

  // Handle code generation from AI agent
  const handleCodeGenerated = useCallback((changes: CodeChange[]) => {
    setRecentChanges(changes);

    // Add generated files to the file system
    const newFiles: FileNode[] = changes
      .filter((change) => change.action === 'create')
      .map((change) => ({
        id: generateId(),
        name: change.fileName,
        type: 'file' as const,
        path: change.filePath,
        content: change.preview ? getFullContent(change) : '',
        language: change.language,
      }));

    setFiles((prev) => {
      // Merge new files, avoiding duplicates
      const existingPaths = new Set(prev.map((f) => f.path));
      const filesToAdd = newFiles.filter((f) => !existingPaths.has(f.path));
      return [...prev, ...filesToAdd];
    });

    // Select the first generated file
    if (newFiles.length > 0) {
      setSelectedFile(newFiles[0]);
    }
  }, []);

  // Toggle chat panel visibility
  const toggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">Codegent</span>
        </div>
        <div className="header-actions">
          <button
            className={`toggle-chat-btn ${showChat ? 'active' : ''}`}
            onClick={toggleChat}
            title="Toggle AI Chat"
          >
            🤖 AI Agent
          </button>
        </div>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
          {recentChanges.length > 0 && <DiffStats changes={recentChanges} />}
        </aside>

        <main className="main-content">
          <CodeEditor
            file={selectedFile}
            onChange={handleFileChange}
          />
        </main>

        {showChat && (
          <aside className="chat-sidebar">
            <ChatPanel
              agent={agent}
              onCodeGenerated={handleCodeGenerated}
            />
          </aside>
        )}
      </div>

      <footer className="app-footer">
        <span>Codegent v1.0.0</span>
        <span>•</span>
        <span>AI-Powered Code Editor</span>
        {selectedFile && (
          <>
            <span>•</span>
            <span>{selectedFile.name}</span>
          </>
        )}
      </footer>
    </div>
  );
}

/**
 * Helper to get full content from a code change
 * In a real implementation, this would fetch the complete content
 */
function getFullContent(change: CodeChange): string {
  // For now, return the preview or empty string
  // The actual content is stored in the agent and would be passed separately
  return change.preview || '';
}

export default App;

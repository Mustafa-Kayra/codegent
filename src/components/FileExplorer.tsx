import { useState } from 'react';
import { FileNode } from '../types';

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  onFileCreate?: (file: FileNode) => void;
  selectedFile?: FileNode | null;
}

/**
 * File explorer component for navigating project files
 */
export function FileExplorer({
  files,
  onFileSelect,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFileCreate: _onFileCreate,
  selectedFile,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFile?.id === node.id;

    if (node.type === 'folder') {
      return (
        <div key={node.id} className="file-node folder">
          <div
            className={`file-node-header ${isExpanded ? 'expanded' : ''}`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => toggleFolder(node.id)}
          >
            <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
            <span className="folder-name">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div className="folder-children">
              {node.children.map((child) => renderNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.id}
        className={`file-node file ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onFileSelect(node)}
      >
        <span className="file-icon">{getFileIcon(node.name)}</span>
        <span className="file-name">{node.name}</span>
      </div>
    );
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <h3>📁 Explorer</h3>
      </div>
      <div className="explorer-content">
        {files.length === 0 ? (
          <div className="empty-state">
            <p>No files yet.</p>
            <p>Use the AI Agent to generate code!</p>
          </div>
        ) : (
          files.map((file) => renderNode(file))
        )}
      </div>
    </div>
  );
}

/**
 * Get an emoji icon for a file based on its extension
 */
function getFileIcon(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  
  const iconMap: Record<string, string> = {
    '.html': '🌐',
    '.htm': '🌐',
    '.css': '🎨',
    '.scss': '🎨',
    '.js': '📜',
    '.jsx': '⚛️',
    '.ts': '💎',
    '.tsx': '⚛️',
    '.json': '📋',
    '.py': '🐍',
    '.java': '☕',
    '.dart': '🎯',
    '.go': '🐹',
    '.rs': '🦀',
    '.md': '📝',
    '.txt': '📄',
    '.yaml': '⚙️',
    '.yml': '⚙️',
    '.xml': '📰',
    '.svg': '🖼️',
    '.png': '🖼️',
    '.jpg': '🖼️',
    '.gif': '🖼️',
  };

  return iconMap[ext] || '📄';
}

export default FileExplorer;

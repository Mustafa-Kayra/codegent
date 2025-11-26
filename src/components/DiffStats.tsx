import { CodeChange } from '../types';

interface DiffStatsProps {
  changes: CodeChange[];
}

/**
 * Component to display code change statistics
 * Shows line additions and removals for each file
 */
export function DiffStats({ changes }: DiffStatsProps) {
  if (changes.length === 0) {
    return null;
  }

  const totalAdded = changes.reduce((sum, c) => sum + c.linesAdded, 0);
  const totalRemoved = changes.reduce((sum, c) => sum + c.linesRemoved, 0);

  return (
    <div className="diff-stats">
      <div className="diff-stats-header">
        <h4>📊 Code Changes</h4>
        <div className="total-stats">
          <span className="total-added">+{totalAdded}</span>
          <span className="total-removed">-{totalRemoved}</span>
          <span className="total-label">total lines</span>
        </div>
      </div>
      <div className="diff-stats-list">
        {changes.map((change, index) => (
          <div key={index} className="diff-stat-item">
            <div className="stat-file-info">
              <span className="stat-action-icon">
                {change.action === 'create' ? '✨' : change.action === 'modify' ? '📝' : '🗑️'}
              </span>
              <span className="stat-filename">{change.fileName}</span>
              <span className="stat-language">{change.language}</span>
            </div>
            <div className="stat-numbers">
              <span className="stat-added">+{change.linesAdded}</span>
              <span className="stat-removed">-{change.linesRemoved}</span>
            </div>
            <div className="stat-bar">
              <div
                className="stat-bar-added"
                style={{ width: `${(change.linesAdded / (totalAdded + totalRemoved)) * 100}%` }}
              />
              <div
                className="stat-bar-removed"
                style={{ width: `${(change.linesRemoved / (totalAdded + totalRemoved)) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DiffStats;

/**
 * Represents a message in the AI chat
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  codeChanges?: CodeChange[];
}

/**
 * Represents a code change made by the AI
 */
export interface CodeChange {
  filePath: string;
  fileName: string;
  language: string;
  linesAdded: number;
  linesRemoved: number;
  action: 'create' | 'modify' | 'delete';
  preview?: string;
}

/**
 * Agent state during code generation
 */
export interface AgentState {
  isProcessing: boolean;
  currentTask?: string;
  progress?: number;
  error?: string;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

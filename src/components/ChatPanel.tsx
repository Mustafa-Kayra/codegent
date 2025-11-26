import { useState, useRef, useEffect } from 'react';
import { ChatMessage, CodeChange, AgentState } from '../types';
import { AIAgent } from '../agent';
import { generateId } from '../utils';

interface ChatPanelProps {
  agent: AIAgent;
  onCodeGenerated?: (changes: CodeChange[]) => void;
}

/**
 * Chat panel component for AI Agent interaction
 * Handles natural language commands and displays responses
 */
export function ChatPanel({ agent, onCodeGenerated }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Welcome to Codegent! I'm your AI coding assistant.

I can help you:
- Create applications with natural language (e.g., "Create an app with HTML, CSS, and JS")
- Generate code in multiple languages (Web, Flutter, Python, etc.)
- Explain and modify existing code

Just type your request below!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [agentState, setAgentState] = useState<AgentState>({ isProcessing: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    agent.onStateUpdate(setAgentState);
    agent.onMessageReceived((message) => {
      setMessages((prev) => [...prev, message]);
      if (message.codeChanges && onCodeGenerated) {
        onCodeGenerated(message.codeChanges);
      }
    });
  }, [agent, onCodeGenerated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || agentState.isProcessing) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    await agent.processCommand(userMessage.content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>🤖 AI Agent</h3>
        {agentState.isProcessing && (
          <div className="processing-indicator">
            <span className="spinner"></span>
            <span>{agentState.currentTask || 'Processing...'}</span>
            {agentState.progress !== undefined && (
              <span className="progress-percent">{agentState.progress}%</span>
            )}
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me to create code... (e.g., 'Create an app with HTML, CSS, and JS')"
          disabled={agentState.isProcessing}
          rows={2}
        />
        <button
          type="submit"
          disabled={!input.trim() || agentState.isProcessing}
          title="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-header">
        <span className="message-role">{isUser ? 'You' : 'Codegent'}</span>
        <span className="message-time">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
      <div className="message-content">
        {message.content.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      {message.codeChanges && message.codeChanges.length > 0 && (
        <div className="code-changes">
          <h4>📁 Generated Files:</h4>
          {message.codeChanges.map((change, index) => (
            <CodeChangeItem key={index} change={change} />
          ))}
        </div>
      )}
    </div>
  );
}

interface CodeChangeItemProps {
  change: CodeChange;
}

function CodeChangeItem({ change }: CodeChangeItemProps) {
  return (
    <div className="code-change-item">
      <div className="change-header">
        <span className="change-icon">
          {change.action === 'create' ? '✨' : change.action === 'modify' ? '📝' : '🗑️'}
        </span>
        <span className="change-filename">{change.fileName}</span>
        <span className="change-language">({change.language})</span>
      </div>
      <div className="change-stats">
        <span className="lines-added">+{change.linesAdded}</span>
        <span className="lines-removed">-{change.linesRemoved}</span>
        <span className="lines-label">lines</span>
      </div>
    </div>
  );
}

export default ChatPanel;

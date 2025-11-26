import { describe, it, expect, beforeEach } from 'vitest';
import { AIAgent } from '../agent/AIAgent';

describe('AIAgent', () => {
  let agent: AIAgent;

  beforeEach(() => {
    agent = new AIAgent();
  });

  describe('initialization', () => {
    it('should create an agent with default config', () => {
      expect(agent).toBeDefined();
      expect(agent.getState().isProcessing).toBe(false);
    });

    it('should accept custom configuration', () => {
      const customAgent = new AIAgent({
        model: 'custom-model',
        temperature: 0.5,
      });
      expect(customAgent).toBeDefined();
    });
  });

  describe('state management', () => {
    it('should update state when processing starts', async () => {
      const stateUpdates: any[] = [];
      agent.onStateUpdate((state) => {
        stateUpdates.push({ ...state });
      });

      // Start processing (don't await to check intermediate states)
      const promise = agent.processCommand('Create a simple HTML page');
      
      // Wait for processing to complete
      await promise;

      // Should have received state updates
      expect(stateUpdates.length).toBeGreaterThan(0);
      
      // Final state should not be processing
      const finalState = agent.getState();
      expect(finalState.isProcessing).toBe(false);
    });
  });

  describe('command processing', () => {
    it('should process a web development command', async () => {
      const messages: any[] = [];
      agent.onMessageReceived((msg) => messages.push(msg));

      await agent.processCommand('Create an app with HTML, CSS, and JS');

      expect(messages.length).toBeGreaterThan(0);
      const lastMessage = messages[messages.length - 1];
      expect(lastMessage.role).toBe('assistant');
      expect(lastMessage.codeChanges).toBeDefined();
      expect(lastMessage.codeChanges.length).toBeGreaterThan(0);
    });

    it('should generate HTML file for web commands', async () => {
      const codeChanges: any[] = [];
      agent.onCodeUpdate((change) => codeChanges.push(change));

      await agent.processCommand('Create a simple HTML page');

      const htmlFile = codeChanges.find((c) => c.fileName.endsWith('.html'));
      expect(htmlFile).toBeDefined();
      expect(htmlFile.language).toBe('html');
      expect(htmlFile.linesAdded).toBeGreaterThan(0);
    });

    it('should generate CSS when requested', async () => {
      const codeChanges: any[] = [];
      agent.onCodeUpdate((change) => codeChanges.push(change));

      await agent.processCommand('Create CSS styles');

      const cssFile = codeChanges.find((c) => c.fileName.endsWith('.css'));
      expect(cssFile).toBeDefined();
      expect(cssFile.language).toBe('css');
    });

    it('should generate JavaScript when requested', async () => {
      const codeChanges: any[] = [];
      agent.onCodeUpdate((change) => codeChanges.push(change));

      await agent.processCommand('Create JavaScript code');

      const jsFile = codeChanges.find((c) => c.fileName.endsWith('.js'));
      expect(jsFile).toBeDefined();
      expect(jsFile.language).toBe('javascript');
    });

    it('should generate Flutter code when requested', async () => {
      const codeChanges: any[] = [];
      agent.onCodeUpdate((change) => codeChanges.push(change));

      await agent.processCommand('Create a Flutter app');

      const dartFile = codeChanges.find((c) => c.fileName.endsWith('.dart'));
      expect(dartFile).toBeDefined();
      expect(dartFile.language).toBe('dart');
    });

    it('should generate Python code when requested', async () => {
      const codeChanges: any[] = [];
      agent.onCodeUpdate((change) => codeChanges.push(change));

      await agent.processCommand('Create a Python script');

      const pyFile = codeChanges.find((c) => c.fileName.endsWith('.py'));
      expect(pyFile).toBeDefined();
      expect(pyFile.language).toBe('python');
    });
  });

  describe('diff statistics', () => {
    it('should include line count statistics in code changes', async () => {
      const codeChanges: any[] = [];
      agent.onCodeUpdate((change) => codeChanges.push(change));

      await agent.processCommand('Create an HTML page');

      for (const change of codeChanges) {
        expect(typeof change.linesAdded).toBe('number');
        expect(typeof change.linesRemoved).toBe('number');
        expect(change.linesAdded).toBeGreaterThanOrEqual(0);
        expect(change.linesRemoved).toBeGreaterThanOrEqual(0);
      }
    });

    it('should report lines added for new files', async () => {
      const codeChanges: any[] = [];
      agent.onCodeUpdate((change) => codeChanges.push(change));

      await agent.processCommand('Create an HTML page with CSS');

      for (const change of codeChanges) {
        if (change.action === 'create') {
          expect(change.linesAdded).toBeGreaterThan(0);
          expect(change.linesRemoved).toBe(0);
        }
      }
    });
  });

  describe('multi-language support', () => {
    it('should detect multiple languages in a command', async () => {
      const codeChanges: any[] = [];
      agent.onCodeUpdate((change) => codeChanges.push(change));

      await agent.processCommand('Create an app with HTML, CSS, and JavaScript');

      const languages = codeChanges.map((c) => c.language);
      expect(languages).toContain('html');
      expect(languages).toContain('css');
      expect(languages).toContain('javascript');
    });

    it('should handle React/TypeScript projects', async () => {
      const codeChanges: any[] = [];
      agent.onCodeUpdate((change) => codeChanges.push(change));

      await agent.processCommand('Create a React component');

      const tsxFile = codeChanges.find((c) => c.fileName.endsWith('.tsx'));
      expect(tsxFile).toBeDefined();
    });
  });
});

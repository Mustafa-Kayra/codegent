import { AgentConfig, AgentState, ChatMessage, CodeChange } from '../types';
import { generateId, getLanguageFromFilename, countLines } from '../utils';

/**
 * AI Agent for code generation and assistance
 * Based on the Mustafa-Kayra/ai-agent project concept
 * 
 * This agent handles:
 * - Natural language command processing
 * - Code generation in multiple languages
 * - Progress tracking with diff statistics
 * - Chat-based interactions
 */
export class AIAgent {
  private _config: AgentConfig;
  private state: AgentState = { isProcessing: false };
  private onStateChange?: (state: AgentState) => void;
  private onCodeChange?: (change: CodeChange) => void;
  private onMessage?: (message: ChatMessage) => void;

  constructor(config: AgentConfig = {}) {
    this._config = {
      model: 'codegent-v1',
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: `You are Codegent, an AI coding assistant. You help developers by:
- Understanding natural language requests
- Generating code in multiple programming languages
- Explaining code and providing suggestions
- Creating complete applications from descriptions
Always provide clear, well-documented code.`,
      ...config,
    };
  }

  /**
   * Subscribe to state changes
   */
  onStateUpdate(callback: (state: AgentState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Subscribe to code changes
   */
  onCodeUpdate(callback: (change: CodeChange) => void): void {
    this.onCodeChange = callback;
  }

  /**
   * Subscribe to messages
   */
  onMessageReceived(callback: (message: ChatMessage) => void): void {
    this.onMessage = callback;
  }

  /**
   * Update agent state
   */
  private updateState(updates: Partial<AgentState>): void {
    this.state = { ...this.state, ...updates };
    this.onStateChange?.(this.state);
  }

  /**
   * Get current state
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this._config };
  }

  /**
   * Process a natural language command and generate code
   */
  async processCommand(command: string): Promise<ChatMessage> {
    this.updateState({ 
      isProcessing: true, 
      currentTask: `Processing: ${command.substring(0, 50)}...`,
      progress: 0 
    });

    try {
      // Analyze the command to determine what needs to be generated
      const analysis = this.analyzeCommand(command);
      const codeChanges: CodeChange[] = [];

      // Generate code based on the command
      const generatedFiles = await this.generateCode(analysis);

      for (const file of generatedFiles) {
        const change: CodeChange = {
          filePath: file.path,
          fileName: file.name,
          language: getLanguageFromFilename(file.name),
          linesAdded: countLines(file.content),
          linesRemoved: 0,
          action: 'create',
          preview: file.content.substring(0, 200),
        };
        codeChanges.push(change);
        this.onCodeChange?.(change);
      }

      this.updateState({ isProcessing: false, progress: 100 });

      const message: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: this.formatResponse(analysis, codeChanges),
        timestamp: new Date(),
        codeChanges,
      };

      this.onMessage?.(message);
      return message;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateState({ 
        isProcessing: false, 
        error: errorMessage 
      });

      const message: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };

      this.onMessage?.(message);
      return message;
    }
  }

  /**
   * Analyze the user command to determine intent
   */
  private analyzeCommand(command: string): CommandAnalysis {
    const lowerCommand = command.toLowerCase();
    
    // Detect project types
    const projectTypes: string[] = [];
    const languages: string[] = [];

    if (lowerCommand.includes('html') || lowerCommand.includes('web')) {
      projectTypes.push('web');
      languages.push('html');
    }
    if (lowerCommand.includes('css') || lowerCommand.includes('style')) {
      languages.push('css');
    }
    if (lowerCommand.includes('javascript') || lowerCommand.includes('js')) {
      languages.push('javascript');
    }
    if (lowerCommand.includes('typescript') || lowerCommand.includes('ts')) {
      languages.push('typescript');
    }
    if (lowerCommand.includes('react')) {
      projectTypes.push('react');
      languages.push('typescript', 'css');
    }
    if (lowerCommand.includes('flutter') || lowerCommand.includes('dart')) {
      projectTypes.push('flutter');
      languages.push('dart');
    }
    if (lowerCommand.includes('python')) {
      projectTypes.push('python');
      languages.push('python');
    }
    if (lowerCommand.includes('java') && !lowerCommand.includes('javascript')) {
      projectTypes.push('java');
      languages.push('java');
    }
    if (lowerCommand.includes('go') || lowerCommand.includes('golang')) {
      projectTypes.push('go');
      languages.push('go');
    }

    return {
      command,
      projectTypes: projectTypes.length > 0 ? projectTypes : ['general'],
      languages: languages.length > 0 ? [...new Set(languages)] : ['javascript'],
      intent: this.detectIntent(lowerCommand),
    };
  }

  /**
   * Detect the user's intent
   */
  private detectIntent(command: string): CommandIntent {
    if (command.includes('create') || command.includes('make') || command.includes('build')) {
      return 'create';
    }
    if (command.includes('modify') || command.includes('change') || command.includes('update')) {
      return 'modify';
    }
    if (command.includes('explain') || command.includes('what')) {
      return 'explain';
    }
    if (command.includes('fix') || command.includes('debug')) {
      return 'fix';
    }
    return 'create';
  }

  /**
   * Generate code based on the analysis
   */
  private async generateCode(analysis: CommandAnalysis): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    
    // Simulate progressive generation with state updates
    this.updateState({ progress: 10, currentTask: 'Analyzing requirements...' });
    await this.delay(300);

    if (analysis.projectTypes.includes('web') || 
        analysis.languages.includes('html') || 
        analysis.languages.includes('css') || 
        analysis.languages.includes('javascript')) {
      
      this.updateState({ progress: 30, currentTask: 'Generating HTML...' });
      files.push(this.generateWebHTML(analysis));
      await this.delay(200);

      if (analysis.languages.includes('css')) {
        this.updateState({ progress: 50, currentTask: 'Generating CSS...' });
        files.push(this.generateWebCSS(analysis));
        await this.delay(200);
      }

      if (analysis.languages.includes('javascript')) {
        this.updateState({ progress: 70, currentTask: 'Generating JavaScript...' });
        files.push(this.generateWebJS(analysis));
        await this.delay(200);
      }
    }

    if (analysis.projectTypes.includes('flutter') || analysis.languages.includes('dart')) {
      this.updateState({ progress: 50, currentTask: 'Generating Flutter code...' });
      files.push(this.generateFlutterMain(analysis));
      await this.delay(300);
    }

    if (analysis.projectTypes.includes('python') || analysis.languages.includes('python')) {
      this.updateState({ progress: 50, currentTask: 'Generating Python code...' });
      files.push(this.generatePythonMain(analysis));
      await this.delay(300);
    }

    if (analysis.projectTypes.includes('react')) {
      this.updateState({ progress: 30, currentTask: 'Generating React components...' });
      files.push(this.generateReactApp(analysis));
      await this.delay(300);
    }

    if (files.length === 0) {
      // Default to a simple JavaScript file
      files.push(this.generateDefaultJS(analysis));
    }

    this.updateState({ progress: 90, currentTask: 'Finalizing...' });
    await this.delay(200);

    return files;
  }

  /**
   * Generate web HTML file
   */
  private generateWebHTML(analysis: CommandAnalysis): GeneratedFile {
    const hasCSS = analysis.languages.includes('css');
    const hasJS = analysis.languages.includes('javascript');
    
    return {
      name: 'index.html',
      path: '/index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    ${hasCSS ? '<link rel="stylesheet" href="styles.css">' : ''}
</head>
<body>
    <div id="app">
        <header>
            <h1>Welcome to Your App</h1>
            <nav>
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
            </nav>
        </header>
        
        <main>
            <section id="home">
                <h2>Home</h2>
                <p>This is your generated application. Customize it to fit your needs!</p>
            </section>
            
            <section id="about">
                <h2>About</h2>
                <p>Built with Codegent AI Assistant.</p>
            </section>
            
            <section id="contact">
                <h2>Contact</h2>
                <form id="contact-form">
                    <input type="text" placeholder="Your name" required>
                    <input type="email" placeholder="Your email" required>
                    <textarea placeholder="Your message" required></textarea>
                    <button type="submit">Send</button>
                </form>
            </section>
        </main>
        
        <footer>
            <p>&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
        </footer>
    </div>
    ${hasJS ? '<script src="app.js"></script>' : ''}
</body>
</html>`,
    };
  }

  /**
   * Generate web CSS file
   */
  private generateWebCSS(_analysis: CommandAnalysis): GeneratedFile {
    return {
      name: 'styles.css',
      path: '/styles.css',
      content: `/* Generated CSS Styles */
:root {
    --primary-color: #007acc;
    --secondary-color: #00d4aa;
    --background-color: #1e1e1e;
    --text-color: #ffffff;
    --border-color: #3e3e3e;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.6;
}

#app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--border-color);
}

header h1 {
    color: var(--primary-color);
}

nav a {
    color: var(--text-color);
    text-decoration: none;
    margin-left: 20px;
    transition: color 0.3s ease;
}

nav a:hover {
    color: var(--secondary-color);
}

main {
    padding: 40px 0;
}

section {
    margin-bottom: 40px;
    padding: 30px;
    background-color: #2d2d2d;
    border-radius: 8px;
}

section h2 {
    color: var(--secondary-color);
    margin-bottom: 15px;
}

form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-width: 500px;
}

input, textarea {
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: #3e3e3e;
    color: var(--text-color);
    font-size: 16px;
}

input:focus, textarea:focus {
    outline: none;
    border-color: var(--primary-color);
}

button {
    padding: 12px 24px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: var(--secondary-color);
}

footer {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid var(--border-color);
    color: #888;
}

@media (max-width: 768px) {
    header {
        flex-direction: column;
        gap: 15px;
    }
    
    nav a {
        margin: 0 10px;
    }
}`,
    };
  }

  /**
   * Generate web JavaScript file
   */
  private generateWebJS(_analysis: CommandAnalysis): GeneratedFile {
    return {
      name: 'app.js',
      path: '/app.js',
      content: `// Generated JavaScript Application
'use strict';

/**
 * Main Application Class
 */
class App {
    constructor() {
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('App initialized');
        this.setupEventListeners();
        this.setupNavigation();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Contact form handler
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }
    }

    /**
     * Setup smooth scrolling navigation
     */
    setupNavigation() {
        document.querySelectorAll('nav a').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Handle contact form submission
     */
    handleContactSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Form submitted:', data);
        this.showNotification('Message sent successfully!', 'success');
        
        event.target.reset();
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = \`notification notification-\${type}\`;
        notification.textContent = message;
        notification.style.cssText = \`
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 25px;
            background-color: \${type === 'success' ? '#00d4aa' : '#007acc'};
            color: white;
            border-radius: 4px;
            animation: slideIn 0.3s ease;
            z-index: 1000;
        \`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});`,
    };
  }

  /**
   * Generate Flutter main.dart file
   */
  private generateFlutterMain(_analysis: CommandAnalysis): GeneratedFile {
    return {
      name: 'main.dart',
      path: '/lib/main.dart',
      content: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Generated Flutter App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF007ACC),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    const HomeContent(),
    const AboutContent(),
    const ContactContent(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Welcome to Your App'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.info),
            label: 'About',
          ),
          NavigationDestination(
            icon: Icon(Icons.contact_mail),
            label: 'Contact',
          ),
        ],
      ),
    );
  }
}

class HomeContent extends StatelessWidget {
  const HomeContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.code,
              size: 80,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 20),
            const Text(
              'Home',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'This is your generated Flutter application. Customize it to fit your needs!',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class AboutContent extends StatelessWidget {
  const AboutContent({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'About',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 10),
            Text(
              'Built with Codegent AI Assistant.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class ContactContent extends StatelessWidget {
  const ContactContent({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(20.0),
        child: Text(
          'Contact page coming soon!',
          style: TextStyle(fontSize: 18),
        ),
      ),
    );
  }
}`,
    };
  }

  /**
   * Generate Python main file
   */
  private generatePythonMain(_analysis: CommandAnalysis): GeneratedFile {
    return {
      name: 'main.py',
      path: '/main.py',
      content: `#!/usr/bin/env python3
"""
Generated Python Application
Built with Codegent AI Assistant
"""

from typing import Optional
import json


class Application:
    """Main application class."""
    
    def __init__(self, name: str = "My App"):
        self.name = name
        self.data: dict = {}
        
    def start(self) -> None:
        """Start the application."""
        print(f"Starting {self.name}...")
        self.run()
        
    def run(self) -> None:
        """Main application loop."""
        print("Application is running...")
        self.show_menu()
        
    def show_menu(self) -> None:
        """Display the main menu."""
        while True:
            print("\\n=== Main Menu ===")
            print("1. Home")
            print("2. About")
            print("3. Exit")
            
            choice = input("Select an option: ")
            
            if choice == "1":
                self.show_home()
            elif choice == "2":
                self.show_about()
            elif choice == "3":
                print("Goodbye!")
                break
            else:
                print("Invalid option. Please try again.")
                
    def show_home(self) -> None:
        """Display home content."""
        print("\\n--- Home ---")
        print("Welcome to your generated application!")
        print("Customize it to fit your needs.")
        
    def show_about(self) -> None:
        """Display about information."""
        print("\\n--- About ---")
        print("Built with Codegent AI Assistant.")
        print(f"Application: {self.name}")
        

def main() -> None:
    """Entry point for the application."""
    app = Application("Generated App")
    app.start()
    

if __name__ == "__main__":
    main()`,
    };
  }

  /**
   * Generate React App component
   */
  private generateReactApp(_analysis: CommandAnalysis): GeneratedFile {
    return {
      name: 'App.tsx',
      path: '/src/App.tsx',
      content: `import React, { useState } from 'react';
import './App.css';

interface TabProps {
  id: string;
  label: string;
}

const tabs: TabProps[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Welcome to Your App</h1>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={\`nav-button \${activeTab === tab.id ? 'active' : ''}\`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'home' && (
          <section className="tab-content">
            <h2>Home</h2>
            <p>This is your generated React application. Customize it to fit your needs!</p>
          </section>
        )}

        {activeTab === 'about' && (
          <section className="tab-content">
            <h2>About</h2>
            <p>Built with Codegent AI Assistant.</p>
          </section>
        )}

        {activeTab === 'contact' && (
          <section className="tab-content">
            <h2>Contact</h2>
            <ContactForm />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Your App. All rights reserved.</p>
      </footer>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <input
        type="text"
        placeholder="Your name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Your email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <textarea
        placeholder="Your message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <button type="submit">Send</button>
    </form>
  );
}

export default App;`,
    };
  }

  /**
   * Generate default JavaScript file
   */
  private generateDefaultJS(analysis: CommandAnalysis): GeneratedFile {
    return {
      name: 'index.js',
      path: '/index.js',
      content: `/**
 * Generated JavaScript Application
 * Command: ${analysis.command}
 * Built with Codegent AI Assistant
 */

console.log('Hello from Codegent!');

// Your code here
`,
    };
  }

  /**
   * Format the response with code changes summary
   */
  private formatResponse(_analysis: CommandAnalysis, codeChanges: CodeChange[]): string {
    let response = `I've processed your request and generated the following files:\n\n`;

    for (const change of codeChanges) {
      const stats = `+${change.linesAdded} -${change.linesRemoved} lines`;
      response += `📄 **${change.fileName}** (${change.language}) - ${change.action}d\n`;
      response += `   ${stats}\n\n`;
    }

    const totalAdded = codeChanges.reduce((sum, c) => sum + c.linesAdded, 0);
    const totalRemoved = codeChanges.reduce((sum, c) => sum + c.linesRemoved, 0);

    response += `\n**Total changes:** +${totalAdded} -${totalRemoved} lines across ${codeChanges.length} file(s)`;

    return response;
  }

  /**
   * Simple delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Types for command analysis
 */
interface CommandAnalysis {
  command: string;
  projectTypes: string[];
  languages: string[];
  intent: CommandIntent;
}

type CommandIntent = 'create' | 'modify' | 'explain' | 'fix';

interface GeneratedFile {
  name: string;
  path: string;
  content: string;
}

/**
 * Create and export a default agent instance
 */
export const defaultAgent = new AIAgent();

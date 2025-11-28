# Codegent AI Agent - VS Code Extension

AI-powered code completion and chat for VS Code. A free, open-source alternative to GitHub Copilot with 33+ AI models.

## Features

### 🤖 AI Code Completion
- Inline suggestions as you type
- Tab to accept completions
- Smart context awareness
- Works with 40+ programming languages

### 💬 AI Chat Panel
- Integrated chat in the sidebar
- Ask questions about your code
- Get explanations, refactoring suggestions, and more
- Side-by-side model comparison

### 📝 Code Actions
- **Explain Code**: Get detailed explanations of selected code
- **Refactor Code**: Get AI-powered refactoring suggestions
- **Fix Code**: Automatically fix bugs and issues
- **Generate Tests**: Create unit tests for your code
- **Add Comments**: Add documentation comments

### 🎯 33 AI Models
Access to multiple AI providers:
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **Google**: Gemini 2.0 Flash, Gemini 1.5 Pro
- **Meta**: Llama 3.3 70B, Llama 3.1 405B
- **Mistral**: Mistral Large, Codestral
- **DeepSeek**: DeepSeek Chat, DeepSeek Reasoner
- **Alibaba**: Qwen 2.5 Coder
- And more!

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Codegent AI Agent"
4. Click Install

### From VSIX
1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Click "..." menu → "Install from VSIX..."
5. Select the downloaded file

### Build from Source
```bash
# Clone the repository
git clone https://github.com/Mustafa-Kayra/codegent.git
cd codegent/extension

# Install dependencies
npm install

# Compile
npm run compile

# Package
npm run package
```

## Usage

### Inline Completions
Just start typing! Suggestions will appear automatically. Press `Tab` to accept.

### Chat Panel
1. Open the Explorer sidebar
2. Find "AI Agent Chat" panel
3. Type your question and press Enter

### Code Actions
1. Select some code in the editor
2. Right-click and choose from "Codegent AI" submenu
3. Or use the Command Palette (Ctrl+Shift+P)

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+A` | Open AI Chat |
| `Ctrl+Shift+E` | Explain selected code |

## Configuration

Open Settings and search for "Codegent" to customize:

| Setting | Description | Default |
|---------|-------------|---------|
| `codegent.enableInlineCompletion` | Enable/disable inline suggestions | `true` |
| `codegent.defaultModel` | Default AI model | `gpt-4o` |
| `codegent.completionDebounce` | Delay before showing suggestions (ms) | `300` |
| `codegent.maxTokens` | Maximum response length | `2048` |
| `codegent.contextLines` | Lines of context for completions | `100` |

## Authentication

### Guest Mode (Default)
- Use free AI models without signing in
- Local storage only
- No account required

### Signed In Mode
- Access to premium models
- Cloud sync for chat history
- Enhanced features

To sign in:
1. Open Command Palette (Ctrl+Shift+P)
2. Run "Codegent: Sign In"
3. Enter your Puter API token

## Commands

| Command | Description |
|---------|-------------|
| `Codegent: Open Chat` | Open the AI chat panel |
| `Codegent: Explain Code` | Explain selected code |
| `Codegent: Refactor Code` | Get refactoring suggestions |
| `Codegent: Fix Code` | Fix bugs in selected code |
| `Codegent: Generate Tests` | Generate unit tests |
| `Codegent: Add Comments` | Add documentation comments |
| `Codegent: Select Model` | Change the AI model |
| `Codegent: Sign In` | Sign in to your account |
| `Codegent: Sign Out` | Sign out |

## Supported Languages

JavaScript, TypeScript, Python, Java, C#, C++, C, Go, Rust, Ruby, PHP, Swift, Kotlin, HTML, CSS, SCSS, SQL, Shell, YAML, JSON, Markdown, Vue, Svelte, and more!

## Privacy

- **No telemetry**: We don't collect usage data
- **Local storage**: Chat history stored locally
- **Secure**: API tokens stored in VS Code's secure storage
- **Open source**: Full transparency

## Troubleshooting

### Completions not showing
1. Check if inline completion is enabled in settings
2. Make sure you're in a supported file type
3. Try increasing the debounce delay

### Chat not responding
1. Check your internet connection
2. Try switching to a different AI model
3. Sign out and sign in again

### Extension not activating
1. Check the Output panel for errors
2. Reload VS Code (Ctrl+Shift+P → "Reload Window")
3. Reinstall the extension

## Contributing

Contributions are welcome! Please see our contributing guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/Mustafa-Kayra/codegent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mustafa-Kayra/codegent/discussions)

## Acknowledgments

- Built with [Puter.js](https://puter.com) for AI integration
- Inspired by GitHub Copilot and other AI coding assistants

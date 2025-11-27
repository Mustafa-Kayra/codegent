# Codegent AI Agent - VS Code Extension

AI-powered code completion and chat for VS Code - A GitHub Copilot alternative with 33 AI models.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-green)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 🚀 Inline Code Completion
- **Tab to accept** - Press Tab to accept AI suggestions
- **Context-aware** - Uses file content and language for better completions
- **Configurable delay** - Adjust how quickly suggestions appear
- **All languages supported** - Works with 40+ programming languages

### 💬 AI Chat Panel
- **Integrated chat** - Chat panel in the Explorer sidebar
- **33 AI models** - Choose from GPT-5.1, Claude Opus 4.5, Gemini 3, and more
- **Context-aware** - Automatically includes selected code and current file
- **Model comparison** - Try responses from different models

### 🛠️ Code Actions
Right-click on selected code to:
- **Explain Code** - Get detailed explanations
- **Refactor Code** - Improve code quality
- **Fix Code** - Find and fix bugs
- **Generate Tests** - Create unit tests
- **Add Comments** - Add documentation

### 🔌 MCP (Model Context Protocol) Support
Built-in tools for AI-assisted development:
- `getCurrentFile` - Get current file info
- `getSelectedText` - Get selected text
- `insertText` - Insert text at cursor
- `replaceSelection` - Replace selected text
- `getWorkspaceFiles` - List workspace files
- `readFile` - Read file content
- `getDiagnostics` - Get code diagnostics

## Supported Models

### 2025 Flagships
- GPT 5.1 (Preview)
- Claude Opus 4.5
- Gemini 3 Ultra
- Grok 3
- DeepSeek R1

### OpenAI
- GPT 4.1, GPT-4o, GPT-4o Mini
- O1, O3 Mini

### Anthropic
- Claude Sonnet 4
- Claude 3.5 Sonnet/Haiku

### Google
- Gemini 2.5 Pro/Flash

### Meta
- Llama 4 Maverick/Scout
- Llama 3.3 70B

### Others
- Mistral Large 2, Codestral
- Qwen 2.5 Coder 32B
- DeepSeek Coder

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Codegent AI Agent"
4. Click Install

### From VSIX
1. Download the `.vsix` file from releases
2. In VS Code: Extensions → ... → Install from VSIX

### From Source
```bash
# Clone the repository
git clone https://github.com/Mustafa-Kayra/codegent.git
cd codegent/extension

# Install dependencies
npm install

# Compile
npm run compile

# Package
npx vsce package
```

## Configuration

Open Settings (Ctrl+,) and search for "Codegent":

| Setting | Default | Description |
|---------|---------|-------------|
| `codegent.model` | `openrouter:openai/gpt-4o` | Default AI model |
| `codegent.enableInlineCompletion` | `true` | Enable Tab completion |
| `codegent.inlineCompletionDelay` | `500` | Delay before showing suggestions (ms) |
| `codegent.maxCompletionTokens` | `256` | Max tokens for completions |
| `codegent.language` | `en` | UI language (20 languages) |
| `codegent.customModels` | `[]` | Custom model IDs |

## Keyboard Shortcuts

| Shortcut | Command |
|----------|---------|
| `Ctrl+Shift+C` | Open Chat |
| `Ctrl+Shift+E` | Explain selected code |
| `Tab` | Accept inline completion |
| `Escape` | Dismiss inline completion |

## Supported Languages

- JavaScript/TypeScript (JSX/TSX)
- Python, Java, C, C++, C#
- Go, Rust, Ruby, PHP
- Swift, Kotlin, Scala
- R, Perl, Lua, Haskell
- Elixir, Clojure, F#, Dart
- Julia, SQL, HTML, CSS/SCSS/Less
- JSON, XML, YAML, Markdown
- Shell/Bash, PowerShell
- Dockerfile, GraphQL
- Solidity, Assembly

## 20 UI Languages

- 🇹🇷 Türkçe
- 🇺🇸 English
- 🇨🇳 中文
- 🇪🇸 Español
- 🇸🇦 العربية
- 🇮🇳 हिन्दी
- 🇧🇷 Português
- 🇷🇺 Русский
- 🇯🇵 日本語
- 🇩🇪 Deutsch
- 🇫🇷 Français
- 🇰🇷 한국어
- 🇮🇹 Italiano
- 🇻🇳 Tiếng Việt
- 🇮🇷 فارسی
- 🇵🇱 Polski
- 🇺🇦 Українська
- 🇷🇴 Română
- 🇳🇱 Nederlands
- 🇹🇭 ไทย

## Development

```bash
# Install dependencies
npm install

# Compile in watch mode
npm run watch

# Run linter
npm run lint

# Package extension
npx vsce package
```

## File Structure

```
extension/
├── src/
│   ├── extension.ts                    # Main entry point
│   ├── providers/
│   │   ├── inlineCompletionProvider.ts # Tab completion
│   │   ├── chatViewProvider.ts         # Chat panel
│   │   └── mcpProvider.ts              # MCP tools
│   ├── services/
│   │   ├── aiService.ts                # AI API calls
│   │   ├── databaseService.ts          # Storage
│   │   └── contextService.ts           # Code context
│   └── utils/
│       └── languageUtils.ts            # Language detection
├── package.json                        # Extension manifest
├── tsconfig.json                       # TypeScript config
├── webpack.config.js                   # Build config
├── .vscodeignore                       # Package ignore
└── README.md                           # This file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Links

- [Repository](https://github.com/Mustafa-Kayra/codegent)
- [Issues](https://github.com/Mustafa-Kayra/codegent/issues)
- [Web App](https://codegent.puter.site)

---

Made with ❤️ by [Mustafa Kayra](https://github.com/Mustafa-Kayra)

# Codegent

> **AI-Powered Code Editor** - A simplified VS Code clone with integrated AI coding agent

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-0078D4?style=flat&logo=visual-studio-code&logoColor=white)](https://microsoft.github.io/monaco-editor/)

## Overview

Codegent is a streamlined, AI-first code editor based on VS Code's Monaco Editor. It focuses on an agent-centric workflow where natural language commands drive code generation.

### Key Features

- 🤖 **AI Agent Integration**: Custom AI coding agent (replacing traditional Copilot)
- 💬 **Natural Language Commands**: Generate code by describing what you want
- 📊 **Progress & Diff Stats**: Real-time line change statistics (+322 -65 lines)
- 🌐 **Multi-Language Support**: Web (HTML/CSS/JS), Flutter, Python, and more
- 📝 **Monaco Editor**: VS Code's editor engine for powerful editing

### What's Different from VS Code

| Feature | VS Code | Codegent |
|---------|---------|----------|
| Focus | Full IDE | AI Agent-centric |
| AI Integration | GitHub Copilot | Custom AI Agent |
| Code Generation | Inline suggestions | Natural language commands |
| Complexity | Full-featured | Streamlined for AI workflow |
| Image Generation | N/A | ❌ Removed |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Mustafa-Kayra/codegent.git
cd codegent

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Launch the editor**: Run `npm run dev` and open http://localhost:5173
2. **Use the AI Agent**: Type natural language commands in the chat panel
   - Example: "Create an app with HTML, CSS, and JS"
   - Example: "Create a Flutter mobile app"
   - Example: "Build a Python CLI tool"
3. **View Progress**: Watch as files are generated with line statistics

## Architecture

```
src/
├── agent/           # AI Agent module (core logic)
│   └── AIAgent.ts   # Main agent class with code generation
├── components/      # React UI components
│   ├── CodeEditor   # Monaco-based editor
│   ├── ChatPanel    # AI chat interface
│   ├── FileExplorer # File navigation
│   └── DiffStats    # Change statistics display
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── styles/          # CSS styling
```

## Supported Languages

| Category | Languages |
|----------|-----------|
| Web | HTML, CSS, JavaScript, TypeScript |
| Mobile | Dart (Flutter), Swift, Kotlin |
| Backend | Python, Java, Go, Rust, C#, Ruby, PHP |
| Data | JSON, YAML |
| Documentation | Markdown |

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run lint
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see [LICENSE](LICENSE) for details

---

Built with ❤️ by [Mustafa-Kayra](https://github.com/Mustafa-Kayra)

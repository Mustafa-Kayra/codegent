# Codegent - AI-Powered Code Editor

A Bolt.new/Lovable style web application for AI-assisted coding with Monaco Editor, Puter.js integration, and 33 AI models.

## Features

### 🎨 Modern UI
- Dark theme with Bolt.new-style interface
- Three-panel layout: Files, Editor, Preview
- Responsive design for all screen sizes

### 📝 Monaco Editor
- Full Monaco Editor with syntax highlighting
- Support for 38+ programming languages
- Auto-completion and IntelliSense
- Multiple file tabs

### 🤖 AI Integration
- **33 AI Models** including:
  - GPT-5.1, GPT-4.1, GPT-4o, O1, O3
  - Claude Opus 4.5, Claude Sonnet 4, Claude 3.5
  - Gemini 3 Ultra, Gemini 2.5 Pro
  - Grok 3, DeepSeek R1
  - Llama 4, Mistral, Qwen, and more

### 🔄 Model Comparison
- **"Try with another model"** - Regenerate any AI response with a different model
- **Side by Side Comparison** - Compare responses from two models simultaneously

### 🗄️ Database (Puter.js KV)
- Projects and files storage
- Chat history persistence
- Image gallery for AI-generated images
- Custom models configuration
- User settings

### 🚀 Deploy
- One-click deployment to Puter hosting
- Automatic subdomain generation
- Live preview before deploy

### 🔌 MCP (Model Context Protocol)
Built-in MCP tools:
- `readFile` - Read file content
- `writeFile` - Write content to file
- `listFiles` - List all project files
- `deleteFile` - Delete a file
- `getProjectInfo` - Get project information

### 🌍 Internationalization
20 languages supported:
- 🇹🇷 Türkçe
- 🇺🇸 English
- 🇨🇳 中文
- 🇪🇸 Español
- 🇸🇦 العربية (RTL)
- 🇮🇳 हिन्दी
- 🇧🇷 Português
- 🇷🇺 Русский
- 🇯🇵 日本語
- 🇩🇪 Deutsch
- 🇫🇷 Français
- 🇰🇷 한국어
- 🇮🇹 Italiano
- 🇻🇳 Tiếng Việt
- 🇮🇷 فارسی (RTL)
- 🇵🇱 Polski
- 🇺🇦 Українська
- 🇷🇴 Română
- 🇳🇱 Nederlands
- 🇹🇭 ไทย

## Getting Started

1. Open `index.html` in a browser
2. Click "Login with Puter" to authenticate
3. Start coding!

## Keyboard Shortcuts

- `Ctrl/Cmd + S` - Save file
- `Ctrl/Cmd + B` - Toggle sidebar
- `Escape` - Close modals

## File Structure

```
app/
├── index.html      # Main HTML file
├── styles.css      # Dark theme styles
├── app.js          # Main application logic
├── languages.js    # 20 language translations
└── README.md       # This file
```

## CDN Dependencies

- [Puter.js](https://js.puter.com/v2/) - Auth, AI, Storage, Hosting
- [Monaco Editor](https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/) - Code editor
- [Lucide Icons](https://unpkg.com/lucide@latest) - Icons
- [Marked](https://cdn.jsdelivr.net/npm/marked/) - Markdown parser
- [Inter Font](https://fonts.googleapis.com/css2?family=Inter) - UI font
- [Fira Code](https://fonts.googleapis.com/css2?family=Fira+Code) - Code font

## License

MIT License

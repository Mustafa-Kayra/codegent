# Codegent App - AI-Powered Code Editor

A Bolt.new-style web application with AI integration, Monaco Editor, and Puter.js for cloud storage and deployment.

## Features

### 🤖 AI Integration
- **33 AI Models** from OpenAI, Anthropic, Google, Meta, Mistral, DeepSeek, Alibaba, xAI, Microsoft, and Cohere
- Smart authentication handling - tries anonymously first, prompts for login only when needed
- Side-by-side model comparison
- Regenerate responses with different models

### 📝 Monaco Editor
- Full-featured code editor (same as VS Code)
- Syntax highlighting for 40+ languages
- Auto-completion and IntelliSense
- Dark theme optimized for coding

### 🗂️ File Management
- File tree navigation
- Multiple file types support
- Auto-save to local storage
- Cloud sync when signed in

### 👁️ Live Preview
- Real-time HTML/CSS/JS preview
- Instant updates as you type
- Sandbox security

### 🚀 One-Click Deploy
- Deploy to Puter hosting
- Get a public URL instantly
- Share your projects

### 🌐 20 Languages
English, Turkish, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Polish, Dutch, Swedish, Ukrainian, Vietnamese, Thai

## Getting Started

### Quick Start (No Installation)
1. Open `index.html` in a modern browser
2. Start coding or ask the AI for help
3. Preview your work in real-time

### With Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Usage

### Guest Mode
You can use the app without signing in:
- Local storage for files and chat history
- Free AI models (GPT-4o, Claude 3.5, Gemini, etc.)
- Full editor and preview functionality

### Signed In Mode
Sign in with Puter for additional features:
- Cloud storage sync
- Access to premium AI models
- One-click deployment to puter.site
- Sync across devices

### AI Chat
1. Type your message in the chat input
2. Press Enter or click Send
3. The AI will respond with helpful code and explanations
4. Use "Regenerate" with different models to compare responses

### Model Comparison
1. Click "Compare" in the header
2. Select two models to compare
3. Enter your prompt
4. See both responses side-by-side

### Deployment
1. Make sure you're signed in
2. Click "Deploy"
3. Your project is uploaded to Puter
4. Get a public URL like `https://codegent-xxxxx.puter.site`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save current file |
| `Ctrl/Cmd + Enter` | Send chat message |
| `Escape` | Close modals |

## File Structure

```
app/
├── index.html      # Main HTML page
├── styles.css      # Tailwind + custom styles
├── app.js          # Main JavaScript logic
├── languages.js    # 20 language translations
└── README.md       # This file
```

## Dependencies (CDN)

- [Puter.js](https://js.puter.com/v2/) - Cloud storage, auth, AI, hosting
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Icons
- [Marked.js](https://marked.js.org/) - Markdown rendering

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - Feel free to use, modify, and distribute.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions:
1. Check the browser console for errors
2. Make sure you're using a modern browser
3. Try clearing localStorage and refreshing
4. Open an issue on GitHub

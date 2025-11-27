// app.js - Codegent Main Application

// ============================================
// MODELS - 33 AI Models
// ============================================
const MODELS = [
  // 2025 Flagships
  { id: 'openrouter:openai/gpt-5.1', name: 'GPT 5.1 (Preview)', provider: 'OpenAI' },
  { id: 'openrouter:anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic' },
  { id: 'openrouter:google/gemini-3', name: 'Gemini 3 Ultra', provider: 'Google' },
  { id: 'openrouter:x-ai/grok-3', name: 'Grok 3', provider: 'xAI' },
  { id: 'openrouter:deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek' },
  
  // OpenAI Models
  { id: 'openrouter:openai/gpt-4.1', name: 'GPT 4.1', provider: 'OpenAI' },
  { id: 'openrouter:openai/gpt-4.1-mini', name: 'GPT 4.1 Mini', provider: 'OpenAI' },
  { id: 'openrouter:openai/gpt-4.1-nano', name: 'GPT 4.1 Nano', provider: 'OpenAI' },
  { id: 'openrouter:openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openrouter:openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'openrouter:openai/o1', name: 'O1', provider: 'OpenAI' },
  { id: 'openrouter:openai/o1-mini', name: 'O1 Mini', provider: 'OpenAI' },
  { id: 'openrouter:openai/o3-mini', name: 'O3 Mini', provider: 'OpenAI' },
  
  // Anthropic Models
  { id: 'openrouter:anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic' },
  { id: 'openrouter:anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'openrouter:anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
  { id: 'openrouter:anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  
  // Google Models
  { id: 'openrouter:google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro', provider: 'Google' },
  { id: 'openrouter:google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', provider: 'Google' },
  { id: 'openrouter:google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'openrouter:google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
  
  // Meta Models
  { id: 'openrouter:meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta' },
  { id: 'openrouter:meta-llama/llama-4-scout', name: 'Llama 4 Scout', provider: 'Meta' },
  { id: 'openrouter:meta-llama/llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta' },
  { id: 'openrouter:meta-llama/llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta' },
  
  // Other Models
  { id: 'openrouter:mistralai/mistral-large-2', name: 'Mistral Large 2', provider: 'Mistral' },
  { id: 'openrouter:mistralai/codestral-latest', name: 'Codestral', provider: 'Mistral' },
  { id: 'openrouter:qwen/qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder 32B', provider: 'Qwen' },
  { id: 'openrouter:qwen/qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'Qwen' },
  { id: 'openrouter:deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek' },
  { id: 'openrouter:deepseek/deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek' },
  { id: 'openrouter:perplexity/sonar-pro', name: 'Sonar Pro', provider: 'Perplexity' },
  { id: 'openrouter:cohere/command-r-plus', name: 'Command R+', provider: 'Cohere' }
];

// Supported programming languages for Monaco Editor
const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r',
  'perl', 'lua', 'haskell', 'elixir', 'clojure', 'fsharp', 'dart',
  'julia', 'sql', 'html', 'css', 'scss', 'less', 'json', 'xml',
  'yaml', 'markdown', 'latex', 'bash', 'powershell', 'dockerfile',
  'graphql', 'solidity', 'assembly'
];

// File extension to language mapping
const FILE_EXTENSIONS = {
  'js': 'javascript',
  'jsx': 'javascript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'py': 'python',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'cc': 'cpp',
  'cxx': 'cpp',
  'cs': 'csharp',
  'go': 'go',
  'rs': 'rust',
  'rb': 'ruby',
  'php': 'php',
  'swift': 'swift',
  'kt': 'kotlin',
  'scala': 'scala',
  'r': 'r',
  'pl': 'perl',
  'lua': 'lua',
  'hs': 'haskell',
  'ex': 'elixir',
  'exs': 'elixir',
  'clj': 'clojure',
  'fs': 'fsharp',
  'dart': 'dart',
  'jl': 'julia',
  'sql': 'sql',
  'html': 'html',
  'htm': 'html',
  'css': 'css',
  'scss': 'scss',
  'sass': 'scss',
  'less': 'less',
  'json': 'json',
  'xml': 'xml',
  'yml': 'yaml',
  'yaml': 'yaml',
  'md': 'markdown',
  'tex': 'latex',
  'sh': 'bash',
  'bash': 'bash',
  'ps1': 'powershell',
  'dockerfile': 'dockerfile',
  'graphql': 'graphql',
  'gql': 'graphql',
  'sol': 'solidity',
  'asm': 'assembly'
};

// ============================================
// DATABASE KEYS & STORAGE
// ============================================
const DB_KEYS = {
  PROJECTS: 'projects',
  PROJECT_FILES: 'project:{id}:files',
  CHATS: 'chats',
  CHAT_MESSAGES: 'chat:{id}:messages',
  IMAGES: 'image_gallery',
  SETTINGS: 'settings',
  CUSTOM_MODELS: 'custom_models',
  TEMPLATES: 'templates'
};

const Storage = {
  async save(key, data) {
    if (typeof puter !== 'undefined' && puter.kv) {
      try {
        await puter.kv.set(key, JSON.stringify(data));
        return true;
      } catch (e) {
        console.warn('Puter.kv failed, using localStorage fallback');
      }
    }
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  },

  async load(key) {
    if (typeof puter !== 'undefined' && puter.kv) {
      try {
        const data = await puter.kv.get(key);
        if (data) return JSON.parse(data);
      } catch (e) {}
    }
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  async delete(key) {
    if (typeof puter !== 'undefined' && puter.kv) {
      try { await puter.kv.del(key); } catch (e) {}
    }
    localStorage.removeItem(key);
  }
};

// ============================================
// MCP (Model Context Protocol) SUPPORT
// ============================================
const MCP = {
  tools: [],
  
  registerTool(name, description, handler) {
    this.tools.push({ name, description, handler });
  },
  
  async executeTool(name, params) {
    const tool = this.tools.find(t => t.name === name);
    if (tool) return await tool.handler(params);
    throw new Error(`Tool not found: ${name}`);
  },
  
  getTools() {
    return this.tools.map(t => ({ name: t.name, description: t.description }));
  }
};

// Register default MCP tools
MCP.registerTool('readFile', 'Read file content', async ({ path }) => {
  if (!currentProject) return null;
  const file = currentProject.files.find(f => f.name === path);
  return file ? file.content : null;
});

MCP.registerTool('writeFile', 'Write content to file', async ({ path, content }) => {
  if (!currentProject) return false;
  const file = currentProject.files.find(f => f.name === path);
  if (file) {
    file.content = content;
  } else {
    currentProject.files.push({ name: path, content });
  }
  await saveCurrentProject();
  renderFileTree();
  return true;
});

MCP.registerTool('listFiles', 'List all files in project', async () => {
  if (!currentProject) return [];
  return currentProject.files.map(f => f.name);
});

MCP.registerTool('deleteFile', 'Delete a file', async ({ path }) => {
  if (!currentProject) return false;
  const index = currentProject.files.findIndex(f => f.name === path);
  if (index > -1) {
    currentProject.files.splice(index, 1);
    await saveCurrentProject();
    renderFileTree();
    return true;
  }
  return false;
});

MCP.registerTool('getProjectInfo', 'Get current project info', async () => {
  if (!currentProject) return null;
  return {
    id: currentProject.id,
    name: currentProject.name,
    fileCount: currentProject.files.length
  };
});

// ============================================
// APPLICATION STATE
// ============================================
let currentProject = null;
let currentFile = null;
let openTabs = [];
let monacoEditor = null;
let chatHistory = [];
let currentModel = 'openrouter:openai/gpt-4o';
let customModels = [];
let isAuthenticated = false;
let chatMinimized = false;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Lucide icons
  lucide.createIcons();
  
  // Initialize language
  i18n.init();
  updateLanguageUI();
  
  // Populate selects
  populateModelSelects();
  populateLanguageSelects();
  
  // Check authentication
  await checkAuth();
  
  // Load custom models
  customModels = await Storage.load(DB_KEYS.CUSTOM_MODELS) || [];
  updateModelSelects();
  
  // Initialize Monaco Editor
  initMonacoEditor();
  
  // Load projects
  await loadProjects();
  
  // Set up event listeners
  setupEventListeners();
});

async function checkAuth() {
  if (typeof puter !== 'undefined') {
    try {
      const user = await puter.auth.getUser();
      if (user) {
        isAuthenticated = true;
        showApp();
        updateUserAvatar(user);
        return;
      }
    } catch (e) {}
  }
  showLoginScreen();
}

function showLoginScreen() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

async function login() {
  if (typeof puter !== 'undefined') {
    try {
      await puter.auth.signIn();
      const user = await puter.auth.getUser();
      isAuthenticated = true;
      showApp();
      updateUserAvatar(user);
      await loadProjects();
    } catch (e) {
      showToast('Login failed', 'error');
    }
  } else {
    // Demo mode without Puter
    isAuthenticated = true;
    showApp();
  }
}

async function logout() {
  if (typeof puter !== 'undefined') {
    try {
      await puter.auth.signOut();
    } catch (e) {}
  }
  isAuthenticated = false;
  showLoginScreen();
}

function updateUserAvatar(user) {
  const avatar = document.getElementById('user-avatar');
  if (user && user.username) {
    avatar.textContent = user.username.charAt(0).toUpperCase();
  }
}

// ============================================
// MONACO EDITOR
// ============================================
function initMonacoEditor() {
  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
  
  require(['vs/editor/editor.main'], function() {
    // Define dark theme
    monaco.editor.defineTheme('codegent-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A737D' },
        { token: 'keyword', foreground: 'F97583' },
        { token: 'string', foreground: '9ECBFF' },
        { token: 'number', foreground: '79B8FF' },
        { token: 'type', foreground: 'B392F0' }
      ],
      colors: {
        'editor.background': '#0a0a0f',
        'editor.foreground': '#E1E4E8',
        'editorLineNumber.foreground': '#6A737D',
        'editorCursor.foreground': '#6366f1',
        'editor.selectionBackground': '#3392FF44',
        'editor.lineHighlightBackground': '#1a1a24'
      }
    });
    
    monacoEditor = monaco.editor.create(document.getElementById('monaco-editor'), {
      value: '// Welcome to Codegent!\n// Create a new file or open a project to get started.\n',
      language: 'javascript',
      theme: 'codegent-dark',
      fontSize: 14,
      fontFamily: "'Fira Code', monospace",
      fontLigatures: true,
      minimap: { enabled: true },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      tabSize: 2,
      insertSpaces: true,
      cursorBlinking: 'smooth',
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 }
    });
    
    // Listen for content changes
    monacoEditor.onDidChangeModelContent(() => {
      if (currentFile) {
        currentFile.content = monacoEditor.getValue();
        updatePreview();
      }
    });
  });
}

function getLanguageFromFileName(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  return FILE_EXTENSIONS[ext] || 'plaintext';
}

function setEditorLanguage(language) {
  if (monacoEditor) {
    monaco.editor.setModelLanguage(monacoEditor.getModel(), language);
  }
}

function setEditorContent(content, language) {
  if (monacoEditor) {
    monacoEditor.setValue(content);
    if (language) {
      setEditorLanguage(language);
    }
  }
}

// ============================================
// FILE & PROJECT MANAGEMENT
// ============================================
async function loadProjects() {
  const projects = await Storage.load(DB_KEYS.PROJECTS) || [];
  renderProjectList(projects);
  
  if (projects.length > 0 && !currentProject) {
    await loadProject(projects[0].id);
  } else if (projects.length === 0) {
    // Create default project
    await createDefaultProject();
  }
}

async function createDefaultProject() {
  const project = {
    id: Date.now().toString(),
    name: 'My Project',
    files: [
      { name: 'index.html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script src="app.js"></script>\n</body>\n</html>' },
      { name: 'style.css', content: 'body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #1a1a2e;\n  color: white;\n}\n\nh1 {\n  color: #6366f1;\n}' },
      { name: 'app.js', content: '// Welcome to Codegent!\nconsole.log("Hello from Codegent!");' }
    ],
    createdAt: Date.now()
  };
  
  const projects = await Storage.load(DB_KEYS.PROJECTS) || [];
  projects.push(project);
  await Storage.save(DB_KEYS.PROJECTS, projects);
  
  currentProject = project;
  renderProjectList(projects);
  renderFileTree();
  
  // Open index.html by default
  openFile(project.files[0]);
}

async function loadProject(projectId) {
  const projects = await Storage.load(DB_KEYS.PROJECTS) || [];
  const project = projects.find(p => p.id === projectId);
  
  if (project) {
    currentProject = project;
    openTabs = [];
    renderFileTree();
    renderTabs();
    
    if (project.files.length > 0) {
      openFile(project.files[0]);
    }
    
    updatePreview();
  }
}

async function saveCurrentProject() {
  if (!currentProject) return;
  
  const projects = await Storage.load(DB_KEYS.PROJECTS) || [];
  const index = projects.findIndex(p => p.id === currentProject.id);
  
  if (index > -1) {
    projects[index] = currentProject;
  } else {
    projects.push(currentProject);
  }
  
  await Storage.save(DB_KEYS.PROJECTS, projects);
}

function renderProjectList(projects) {
  const list = document.getElementById('project-list');
  
  if (projects.length === 0) {
    list.innerHTML = `<div class="empty-state"><p data-i18n="noProjects">${i18n.t('noProjects')}</p></div>`;
    return;
  }
  
  list.innerHTML = projects.map(p => `
    <div class="file-item ${currentProject?.id === p.id ? 'active' : ''}" onclick="loadProject('${p.id}')">
      <i data-lucide="folder"></i>
      <span class="file-name">${p.name}</span>
    </div>
  `).join('');
  
  lucide.createIcons();
}

function renderFileTree() {
  const tree = document.getElementById('file-tree');
  
  if (!currentProject || currentProject.files.length === 0) {
    tree.innerHTML = `<div class="empty-state"><p data-i18n="noProjects">${i18n.t('noProjects')}</p></div>`;
    return;
  }
  
  tree.innerHTML = currentProject.files.map(f => `
    <div class="file-item ${currentFile?.name === f.name ? 'active' : ''}" onclick="openFile(currentProject.files.find(file => file.name === '${f.name}'))">
      <i data-lucide="file-code"></i>
      <span class="file-name">${f.name}</span>
    </div>
  `).join('');
  
  lucide.createIcons();
}

function openFile(file) {
  if (!file) return;
  
  currentFile = file;
  
  // Add to tabs if not already open
  if (!openTabs.find(t => t.name === file.name)) {
    openTabs.push(file);
  }
  
  // Update editor
  const language = getLanguageFromFileName(file.name);
  setEditorContent(file.content, language);
  
  // Update UI
  renderFileTree();
  renderTabs();
  updatePreview();
}

function renderTabs() {
  const tabsContainer = document.getElementById('editor-tabs');
  
  tabsContainer.innerHTML = openTabs.map(tab => `
    <div class="editor-tab ${currentFile?.name === tab.name ? 'active' : ''}" onclick="openFile(currentProject.files.find(f => f.name === '${tab.name}'))">
      <span>${tab.name}</span>
      <span class="editor-tab-close" onclick="event.stopPropagation(); closeTab('${tab.name}')">
        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
      </span>
    </div>
  `).join('');
  
  lucide.createIcons();
}

function closeTab(fileName) {
  const index = openTabs.findIndex(t => t.name === fileName);
  if (index > -1) {
    openTabs.splice(index, 1);
    
    if (currentFile?.name === fileName) {
      if (openTabs.length > 0) {
        openFile(openTabs[openTabs.length - 1]);
      } else {
        currentFile = null;
        setEditorContent('// No file open');
      }
    }
    
    renderTabs();
  }
}

function createNewFile() {
  document.getElementById('new-file-modal').classList.add('active');
  document.getElementById('new-file-name').focus();
}

function closeNewFileModal() {
  document.getElementById('new-file-modal').classList.remove('active');
  document.getElementById('new-file-name').value = '';
}

function confirmNewFile() {
  const fileName = document.getElementById('new-file-name').value.trim();
  
  if (!fileName) {
    showToast('Please enter a file name', 'error');
    return;
  }
  
  if (currentProject.files.find(f => f.name === fileName)) {
    showToast('File already exists', 'error');
    return;
  }
  
  const newFile = { name: fileName, content: '' };
  currentProject.files.push(newFile);
  saveCurrentProject();
  renderFileTree();
  openFile(newFile);
  closeNewFileModal();
  showToast('File created', 'success');
}

function createNewProject() {
  document.getElementById('new-project-modal').classList.add('active');
  document.getElementById('new-project-name').focus();
}

function closeNewProjectModal() {
  document.getElementById('new-project-modal').classList.remove('active');
  document.getElementById('new-project-name').value = '';
}

async function confirmNewProject() {
  const projectName = document.getElementById('new-project-name').value.trim();
  
  if (!projectName) {
    showToast('Please enter a project name', 'error');
    return;
  }
  
  const project = {
    id: Date.now().toString(),
    name: projectName,
    files: [
      { name: 'index.html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>' + projectName + '</title>\n</head>\n<body>\n  <h1>' + projectName + '</h1>\n</body>\n</html>' }
    ],
    createdAt: Date.now()
  };
  
  const projects = await Storage.load(DB_KEYS.PROJECTS) || [];
  projects.push(project);
  await Storage.save(DB_KEYS.PROJECTS, projects);
  
  currentProject = project;
  openTabs = [];
  renderProjectList(projects);
  renderFileTree();
  openFile(project.files[0]);
  closeNewProjectModal();
  showToast('Project created', 'success');
}

// ============================================
// PREVIEW
// ============================================
function updatePreview() {
  if (!currentProject) return;
  
  const iframe = document.getElementById('preview-frame');
  const htmlFile = currentProject.files.find(f => f.name.endsWith('.html'));
  
  if (!htmlFile) {
    iframe.srcdoc = '<html><body style="background:#1a1a24;color:white;font-family:sans-serif;padding:20px;"><p>No HTML file found</p></body></html>';
    return;
  }
  
  let html = htmlFile.content;
  
  // Inline CSS
  currentProject.files.filter(f => f.name.endsWith('.css')).forEach(cssFile => {
    const linkRegex = new RegExp(`<link[^>]*href=["']${cssFile.name}["'][^>]*>`, 'g');
    html = html.replace(linkRegex, `<style>${cssFile.content}</style>`);
  });
  
  // Inline JS
  currentProject.files.filter(f => f.name.endsWith('.js')).forEach(jsFile => {
    const scriptRegex = new RegExp(`<script[^>]*src=["']${jsFile.name}["'][^>]*></script>`, 'g');
    html = html.replace(scriptRegex, `<script>${jsFile.content}</script>`);
  });
  
  iframe.srcdoc = html;
}

function refreshPreview() {
  updatePreview();
  showToast('Preview refreshed', 'success');
}

function openPreviewInNewTab() {
  if (!currentProject) return;
  
  const htmlFile = currentProject.files.find(f => f.name.endsWith('.html'));
  if (!htmlFile) return;
  
  let html = htmlFile.content;
  
  // Inline CSS
  currentProject.files.filter(f => f.name.endsWith('.css')).forEach(cssFile => {
    const linkRegex = new RegExp(`<link[^>]*href=["']${cssFile.name}["'][^>]*>`, 'g');
    html = html.replace(linkRegex, `<style>${cssFile.content}</style>`);
  });
  
  // Inline JS
  currentProject.files.filter(f => f.name.endsWith('.js')).forEach(jsFile => {
    const scriptRegex = new RegExp(`<script[^>]*src=["']${jsFile.name}["'][^>]*></script>`, 'g');
    html = html.replace(scriptRegex, `<script>${jsFile.content}</script>`);
  });
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

// ============================================
// DEPLOY (Puter Hosting)
// ============================================
async function deployProject() {
  if (!currentProject) {
    showToast('No project to deploy', 'error');
    return;
  }
  
  if (typeof puter === 'undefined' || !puter.hosting) {
    showToast('Puter hosting not available', 'error');
    return;
  }
  
  try {
    showToast('Deploying...', 'info');
    
    const randomId = Math.random().toString(36).substring(7);
    const subdomain = `codegent-${randomId}`;
    const dir = `www_${randomId}`;
    
    // Create directory
    await puter.fs.mkdir(dir);
    
    // Upload files
    for (const file of currentProject.files) {
      await puter.fs.write(`${dir}/${file.name}`, file.content);
    }
    
    // Create hosting site
    const site = await puter.hosting.create(subdomain, dir);
    const url = `https://${site.subdomain}.puter.site`;
    
    showToast(`${i18n.t('deploySuccess')} ${url}`, 'success');
    
    // Open in new tab
    window.open(url, '_blank');
  } catch (e) {
    console.error('Deploy error:', e);
    showToast(i18n.t('deployError'), 'error');
  }
}

// ============================================
// CHAT & AI
// ============================================
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  input.value = '';
  autoResize(input);
  
  // Add user message
  addChatMessage('user', message);
  
  // Get AI response
  const sendBtn = document.getElementById('chat-send-btn');
  sendBtn.disabled = true;
  
  try {
    const response = await callAI(message, currentModel);
    addChatMessage('ai', response, currentModel);
  } catch (e) {
    console.error('AI error:', e);
    addChatMessage('ai', 'Sorry, an error occurred. Please try again.');
  }
  
  sendBtn.disabled = false;
}

async function callAI(prompt, model) {
  // Build context with current file
  let systemPrompt = `You are Codegent, an AI coding assistant. You help users write, understand, and debug code.
Current project: ${currentProject?.name || 'None'}
Current file: ${currentFile?.name || 'None'}`;

  if (currentFile) {
    systemPrompt += `\n\nCurrent file content:\n\`\`\`${getLanguageFromFileName(currentFile.name)}\n${currentFile.content}\n\`\`\``;
  }

  // Add MCP tools info
  systemPrompt += `\n\nYou have access to these tools:\n${MCP.getTools().map(t => `- ${t.name}: ${t.description}`).join('\n')}`;

  if (typeof puter !== 'undefined' && puter.ai) {
    try {
      const result = await puter.ai.chat(prompt, {
        model: model,
        system: systemPrompt
      });
      return result;
    } catch (e) {
      console.error('Puter AI error:', e);
      throw e;
    }
  } else {
    return 'AI is not available in this environment. Please log in with Puter.';
  }
}

function addChatMessage(role, content, model = null) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageIndex = chatHistory.length;
  
  chatHistory.push({ role, content, model, timestamp: Date.now() });
  
  const messageEl = document.createElement('div');
  messageEl.className = `message message-${role}`;
  
  if (role === 'user') {
    messageEl.innerHTML = `<div class="message-content">${escapeHtml(content)}</div>`;
  } else {
    const parsedContent = sanitizeMarkdown(content);
    messageEl.innerHTML = `
      <div class="message-avatar">
        <i data-lucide="bot" style="width: 18px; height: 18px; color: white;"></i>
      </div>
      <div class="message-content">
        ${parsedContent}
        <div class="regenerate-section">
          <span class="text-xs text-muted">🔄 ${i18n.t('tryWithAnotherModel')}:</span>
          <select class="select" style="font-size: 11px; padding: 4px 8px; min-width: 120px;">
            ${getAllModels().map(m => `<option value="${m.id}" ${m.id === model ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
          <button class="btn btn-secondary" style="font-size: 11px; padding: 4px 8px;" onclick="regenerateWithModel(${messageIndex}, this.previousElementSibling.value)">
            ${i18n.t('regenerate')}
          </button>
        </div>
      </div>
    `;
  }
  
  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  lucide.createIcons();
}

async function regenerateWithModel(messageIndex, newModel) {
  if (messageIndex < 1) return;
  
  const userMessage = chatHistory[messageIndex - 1];
  if (userMessage.role !== 'user') return;
  
  showToast(`Regenerating with ${newModel}...`, 'info');
  
  try {
    const response = await callAI(userMessage.content, newModel);
    
    // Update the AI message
    chatHistory[messageIndex] = {
      role: 'ai',
      content: response,
      model: newModel,
      timestamp: Date.now()
    };
    
    // Re-render messages
    renderChatMessages();
  } catch (e) {
    showToast('Regeneration failed', 'error');
  }
}

function renderChatMessages() {
  const messagesContainer = document.getElementById('chat-messages');
  messagesContainer.innerHTML = '';
  
  chatHistory.forEach((msg, index) => {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${msg.role}`;
    
    if (msg.role === 'user') {
      messageEl.innerHTML = `<div class="message-content">${escapeHtml(msg.content)}</div>`;
    } else {
      const parsedContent = sanitizeMarkdown(msg.content);
      messageEl.innerHTML = `
        <div class="message-avatar">
          <i data-lucide="bot" style="width: 18px; height: 18px; color: white;"></i>
        </div>
        <div class="message-content">
          ${parsedContent}
          <div class="regenerate-section">
            <span class="text-xs text-muted">🔄 ${i18n.t('tryWithAnotherModel')}:</span>
            <select class="select" style="font-size: 11px; padding: 4px 8px; min-width: 120px;">
              ${getAllModels().map(m => `<option value="${m.id}" ${m.id === msg.model ? 'selected' : ''}>${m.name}</option>`).join('')}
            </select>
            <button class="btn btn-secondary" style="font-size: 11px; padding: 4px 8px;" onclick="regenerateWithModel(${index}, this.previousElementSibling.value)">
              ${i18n.t('regenerate')}
            </button>
          </div>
        </div>
      `;
    }
    
    messagesContainer.appendChild(messageEl);
  });
  
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  lucide.createIcons();
}

function handleChatKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function toggleChatPanel() {
  const panel = document.getElementById('chat-panel');
  const icon = document.getElementById('chat-toggle-icon');
  
  chatMinimized = !chatMinimized;
  
  if (chatMinimized) {
    panel.style.height = '50px';
    icon.setAttribute('data-lucide', 'chevron-up');
  } else {
    panel.style.height = 'var(--chat-height)';
    icon.setAttribute('data-lucide', 'chevron-down');
  }
  
  lucide.createIcons();
}

// ============================================
// COMPARE MODE
// ============================================
function toggleCompareMode() {
  const panel = document.getElementById('compare-panel');
  panel.classList.toggle('active');
}

async function runComparison() {
  const prompt = document.getElementById('compare-input').value.trim();
  if (!prompt) {
    showToast('Please enter a prompt', 'error');
    return;
  }
  
  const model1 = document.getElementById('compare-model-1').value;
  const model2 = document.getElementById('compare-model-2').value;
  
  const result1 = document.getElementById('compare-result-1');
  const result2 = document.getElementById('compare-result-2');
  
  result1.innerHTML = '<div class="spinner"></div>';
  result2.innerHTML = '<div class="spinner"></div>';
  
  try {
    const [response1, response2] = await Promise.all([
      callAI(prompt, model1),
      callAI(prompt, model2)
    ]);
    
    result1.innerHTML = sanitizeMarkdown(response1);
    result2.innerHTML = sanitizeMarkdown(response2);
  } catch (e) {
    result1.innerHTML = '<p class="text-muted">Error loading response</p>';
    result2.innerHTML = '<p class="text-muted">Error loading response</p>';
  }
}

// ============================================
// MODEL MANAGEMENT
// ============================================
function getAllModels() {
  return [...MODELS, ...customModels];
}

function populateModelSelects() {
  const selects = ['model-select', 'compare-model-1', 'compare-model-2'];
  const allModels = getAllModels();
  
  // Group by provider
  const grouped = {};
  allModels.forEach(m => {
    const provider = m.provider || 'Custom';
    if (!grouped[provider]) grouped[provider] = [];
    grouped[provider].push(m);
  });
  
  const optionsHtml = Object.entries(grouped).map(([provider, models]) => `
    <optgroup label="${provider}">
      ${models.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
    </optgroup>
  `).join('');
  
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = optionsHtml;
    }
  });
}

function updateModelSelects() {
  populateModelSelects();
}

function onModelChange(modelId) {
  currentModel = modelId;
}

async function addCustomModel() {
  const input = document.getElementById('custom-model-input');
  const modelId = input.value.trim();
  
  if (!modelId) {
    showToast('Please enter a model ID', 'error');
    return;
  }
  
  if (customModels.find(m => m.id === modelId)) {
    showToast('Model already exists', 'error');
    return;
  }
  
  customModels.push({
    id: modelId,
    name: modelId.split('/').pop(),
    provider: 'Custom'
  });
  
  await Storage.save(DB_KEYS.CUSTOM_MODELS, customModels);
  updateModelSelects();
  input.value = '';
  showToast('Custom model added', 'success');
}

// ============================================
// LANGUAGE
// ============================================
function populateLanguageSelects() {
  const languages = i18n.getAllLanguages();
  const languageList = document.getElementById('language-list');
  const settingsLanguage = document.getElementById('settings-language');
  
  const currentLang = i18n.currentLanguage;
  
  languageList.innerHTML = languages.map(lang => `
    <div class="language-item ${lang.code === currentLang ? 'selected' : ''}" onclick="changeLanguage('${lang.code}')">
      <span>${lang.flag}</span>
      <span>${lang.name}</span>
    </div>
  `).join('');
  
  settingsLanguage.innerHTML = languages.map(lang => `
    <option value="${lang.code}" ${lang.code === currentLang ? 'selected' : ''}>${lang.flag} ${lang.name}</option>
  `).join('');
}

function toggleLanguageDropdown() {
  const list = document.getElementById('language-list');
  list.classList.toggle('active');
}

function changeLanguage(code) {
  i18n.setLanguage(code);
  updateLanguageUI();
  document.getElementById('language-list').classList.remove('active');
}

function updateLanguageUI() {
  const lang = i18n.getCurrentLanguage();
  document.getElementById('current-lang-flag').textContent = lang.flag;
  
  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = i18n.t(key);
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = i18n.t(key);
  });
  
  populateLanguageSelects();
}

// ============================================
// IMAGE GALLERY
// ============================================
async function openImageGallery() {
  const modal = document.getElementById('gallery-modal');
  const grid = document.getElementById('gallery-grid');
  
  const images = await Storage.load(DB_KEYS.IMAGES) || [];
  
  if (images.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No images saved yet</p></div>';
  } else {
    grid.innerHTML = images.map(img => `
      <div class="gallery-item">
        <img src="${img.url}" alt="${img.prompt}">
        <div class="gallery-item-overlay">
          <span class="text-xs truncate">${img.prompt}</span>
        </div>
      </div>
    `).join('');
  }
  
  modal.classList.add('active');
  closeUserDropdown();
}

function closeImageGallery() {
  document.getElementById('gallery-modal').classList.remove('active');
}

async function saveImageToGallery(imageUrl, prompt, model) {
  const gallery = await Storage.load(DB_KEYS.IMAGES) || [];
  gallery.unshift({
    id: Date.now().toString(),
    url: imageUrl,
    prompt: prompt,
    model: model,
    timestamp: Date.now()
  });
  
  if (gallery.length > 50) gallery.pop();
  await Storage.save(DB_KEYS.IMAGES, gallery);
}

function uploadImage() {
  // TODO: Implement image upload for vision models
  showToast('Image upload coming soon!', 'info');
}

// ============================================
// SETTINGS
// ============================================
function openSettings() {
  document.getElementById('settings-modal').classList.add('active');
  closeUserDropdown();
  renderMCPTools();
}

function closeSettings() {
  document.getElementById('settings-modal').classList.remove('active');
}

function saveSettings() {
  showToast('Settings saved', 'success');
  closeSettings();
}

function renderMCPTools() {
  const list = document.getElementById('mcp-tools-list');
  const tools = MCP.getTools();
  
  list.innerHTML = tools.map(tool => `
    <div class="file-item" style="cursor: default;">
      <i data-lucide="wrench"></i>
      <div>
        <strong>${escapeHtml(tool.name)}</strong>
        <p class="text-xs text-muted">${escapeHtml(tool.description)}</p>
      </div>
    </div>
  `).join('');
  
  lucide.createIcons();
}

// ============================================
// UI HELPERS
// ============================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}

function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  dropdown.classList.toggle('active');
}

function closeUserDropdown() {
  document.getElementById('user-dropdown').classList.remove('active');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'alert-triangle' : 'info'}"></i>
    <span>${escapeHtml(message)}</span>
  `;
  
  container.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Sanitize markdown output to prevent XSS
function sanitizeMarkdown(markdown) {
  const html = marked.parse(markdown);
  if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'class', 'target', 'rel']
    });
  }
  return html;
}

function setupEventListeners() {
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      closeUserDropdown();
    }
    if (!e.target.closest('.language-dropdown')) {
      document.getElementById('language-list').classList.remove('active');
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (currentFile) {
        currentFile.content = monacoEditor.getValue();
        saveCurrentProject();
        showToast('File saved', 'success');
      }
    }
    
    // Ctrl/Cmd + B to toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      closeSettings();
      closeImageGallery();
      closeNewFileModal();
      closeNewProjectModal();
      if (document.getElementById('compare-panel').classList.contains('active')) {
        toggleCompareMode();
      }
    }
  });
}

/**
 * Codegent - Main Application JavaScript
 * AI-powered code editor with Puter integration
 */

/* ============================================
   Configuration Constants
============================================ */
const CONFIG = {
  PUTER_INIT_TIMEOUT_MS: 3000,  // 3 second timeout for Puter SDK initialization
  DEBOUNCE_DELAY_MS: 500,       // Debounce delay for preview updates
  TOAST_DURATION_MS: 3000       // Toast notification duration
};

/* ============================================
   AI Models Configuration (33 Models)
============================================ */
const AI_MODELS = [
  // OpenAI Models
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', requiresAuth: false },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', requiresAuth: false },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', requiresAuth: false },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', requiresAuth: false },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', requiresAuth: false },
  { id: 'o1-preview', name: 'O1 Preview', provider: 'OpenAI', requiresAuth: true },
  { id: 'o1-mini', name: 'O1 Mini', provider: 'OpenAI', requiresAuth: true },
  
  // Anthropic Models
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', requiresAuth: false },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', requiresAuth: false },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', requiresAuth: true },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', requiresAuth: false },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', requiresAuth: false },
  
  // Google Models
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', requiresAuth: false },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', requiresAuth: false },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', requiresAuth: false },
  
  // Meta Models
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta', requiresAuth: false },
  { id: 'llama-3.2-90b-vision', name: 'Llama 3.2 90B Vision', provider: 'Meta', requiresAuth: false },
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta', requiresAuth: true },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', requiresAuth: false },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta', requiresAuth: false },
  
  // Mistral Models
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', requiresAuth: false },
  { id: 'mistral-nemo', name: 'Mistral Nemo', provider: 'Mistral', requiresAuth: false },
  { id: 'codestral', name: 'Codestral', provider: 'Mistral', requiresAuth: false },
  { id: 'pixtral', name: 'Pixtral', provider: 'Mistral', requiresAuth: false },
  
  // DeepSeek Models
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', requiresAuth: false },
  { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'DeepSeek', requiresAuth: false },
  
  // Qwen Models
  { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'Alibaba', requiresAuth: false },
  { id: 'qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder 32B', provider: 'Alibaba', requiresAuth: false },
  { id: 'qwq-32b', name: 'QwQ 32B', provider: 'Alibaba', requiresAuth: false },
  
  // Other Models
  { id: 'grok-2', name: 'Grok 2', provider: 'xAI', requiresAuth: true },
  { id: 'grok-beta', name: 'Grok Beta', provider: 'xAI', requiresAuth: true },
  { id: 'phi-3-medium', name: 'Phi 3 Medium', provider: 'Microsoft', requiresAuth: false },
  { id: 'command-r-plus', name: 'Command R+', provider: 'Cohere', requiresAuth: false }
];

/* ============================================
   Global State
============================================ */
let puterReady = false;
let isUserSignedIn = false;
let useCloudStorage = false;
let currentUser = null;
let selectedModel = 'gpt-4o';
let editor = null;
let chatHistory = [];
let projectFiles = [];
let currentFile = null;

/* ============================================
   Puter Initialization (with configurable timeout)
============================================ */
async function initPuter() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('⚠️ Puter SDK timeout, Guest Mode activated');
      puterReady = false;
      resolve(false);
    }, CONFIG.PUTER_INIT_TIMEOUT_MS);

    if (typeof puter !== 'undefined') {
      clearTimeout(timeout);
      puterReady = true;
      checkExistingSession().then(resolve);
    } else {
      const check = setInterval(() => {
        if (typeof puter !== 'undefined') {
          clearInterval(check);
          clearTimeout(timeout);
          puterReady = true;
          checkExistingSession().then(resolve);
        }
      }, 100);
    }
  });
}

async function checkExistingSession() {
  try {
    if (puter.auth.isSignedIn()) {
      const user = await puter.auth.getUser();
      if (user) {
        currentUser = user;
        isUserSignedIn = true;
        await testCloudStorage();
        updateUserStatus();
        return true;
      }
    }
  } catch (e) {
    console.warn('Session check failed:', e);
  }
  updateUserStatus();
  return false;
}

async function testCloudStorage() {
  try {
    const testKey = '_codegent_storage_test';
    await puter.kv.set(testKey, 'test');
    await puter.kv.del(testKey);
    useCloudStorage = true;
    console.log('✅ Cloud storage available');
  } catch (e) {
    useCloudStorage = false;
    console.warn('⚠️ Cloud storage not available, using localStorage');
  }
}

/* ============================================
   Authentication
============================================ */
async function signIn() {
  if (!puterReady) {
    showToast(LanguageManager.t('error'), 'error');
    return false;
  }

  try {
    const user = await puter.auth.signIn();
    if (user) {
      currentUser = user;
      isUserSignedIn = true;
      await testCloudStorage();
      updateUserStatus();
      showToast(`${LanguageManager.t('welcome')}, ${user.username || 'User'}!`, 'success');
      return true;
    }
  } catch (e) {
    console.error('Sign in failed:', e);
    showToast(LanguageManager.t('error'), 'error');
  }
  return false;
}

async function signOut() {
  try {
    if (puterReady) {
      await puter.auth.signOut();
    }
    currentUser = null;
    isUserSignedIn = false;
    useCloudStorage = false;
    updateUserStatus();
    showToast(LanguageManager.t('signOut'), 'info');
  } catch (e) {
    console.error('Sign out failed:', e);
  }
}

function updateUserStatus() {
  const statusEl = document.getElementById('user-status');
  if (!statusEl) return;

  if (isUserSignedIn && currentUser) {
    statusEl.className = 'user-status signed-in';
    statusEl.innerHTML = `
      <span class="user-status-dot"></span>
      <span>${currentUser.username || 'User'}</span>
    `;
  } else {
    statusEl.className = 'user-status guest';
    statusEl.innerHTML = `
      <span class="user-status-dot"></span>
      <span>${LanguageManager.t('guestMode')}</span>
    `;
  }

  // Update cloud sync status
  const syncStatus = document.getElementById('sync-status');
  if (syncStatus) {
    syncStatus.textContent = useCloudStorage 
      ? LanguageManager.t('cloudSyncOn') 
      : LanguageManager.t('cloudSyncOff');
  }
}

/* ============================================
   Storage (Hybrid: Cloud + LocalStorage)
============================================ */
const Storage = {
  async save(key, data) {
    const jsonData = JSON.stringify(data);
    
    // Always save to localStorage as backup
    try {
      localStorage.setItem(`codegent_${key}`, jsonData);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    
    // Try cloud storage if available
    if (useCloudStorage && isUserSignedIn && puterReady) {
      try {
        await puter.kv.set(`codegent_${key}`, jsonData);
      } catch (e) {
        console.warn('Cloud storage save failed:', e);
      }
    }
    
    return true;
  },
  
  async load(key) {
    // Try cloud storage first
    if (useCloudStorage && isUserSignedIn && puterReady) {
      try {
        const data = await puter.kv.get(`codegent_${key}`);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.warn('Cloud storage load failed:', e);
      }
    }
    
    // Fallback to localStorage
    try {
      const local = localStorage.getItem(`codegent_${key}`);
      return local ? JSON.parse(local) : null;
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
      return null;
    }
  },
  
  async delete(key) {
    try {
      localStorage.removeItem(`codegent_${key}`);
    } catch (e) {}
    
    if (useCloudStorage && isUserSignedIn && puterReady) {
      try {
        await puter.kv.del(`codegent_${key}`);
      } catch (e) {}
    }
  }
};

/* ============================================
   AI Integration
============================================ */
function isAuthError(error) {
  const msg = error?.message?.toLowerCase() || '';
  return msg.includes('auth') || 
         msg.includes('login') || 
         msg.includes('sign in') || 
         msg.includes('permission') ||
         msg.includes('unauthorized');
}

async function callAI(prompt, modelId = selectedModel) {
  if (!puterReady) {
    throw new Error('Puter SDK not available');
  }

  try {
    const response = await puter.ai.chat(prompt, { model: modelId });
    return response;
  } catch (error) {
    // Check if this is an auth error
    if (isAuthError(error) && !isUserSignedIn) {
      const shouldLogin = confirm(LanguageManager.t('loginRequired'));
      if (shouldLogin) {
        const success = await signIn();
        if (success) {
          // Retry with same model
          return await puter.ai.chat(prompt, { model: modelId });
        }
      }
      // Fallback to a free model
      console.log('Falling back to gpt-4o');
      return await puter.ai.chat(prompt, { model: 'gpt-4o' });
    }
    throw error;
  }
}

async function streamAI(prompt, modelId = selectedModel, onChunk) {
  if (!puterReady) {
    throw new Error('Puter SDK not available');
  }

  try {
    const response = await puter.ai.chat(prompt, { 
      model: modelId,
      stream: true 
    });
    
    let fullText = '';
    for await (const chunk of response) {
      const text = chunk?.text || chunk?.message?.content || '';
      fullText += text;
      if (onChunk) onChunk(text, fullText);
    }
    return fullText;
  } catch (error) {
    if (isAuthError(error) && !isUserSignedIn) {
      const shouldLogin = confirm(LanguageManager.t('loginRequired'));
      if (shouldLogin) {
        await signIn();
      }
    }
    throw error;
  }
}

/* ============================================
   Chat Functions
============================================ */
async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  input.value = '';
  
  // Add user message
  addChatMessage('user', message);
  
  // Show thinking indicator
  const thinkingId = showThinking();
  
  try {
    const systemPrompt = `You are Codegent AI, a helpful coding assistant. You can help with:
- Writing and explaining code
- Debugging issues
- Suggesting improvements
- Answering programming questions

When providing code, use markdown code blocks with the appropriate language specified.
Be concise but thorough in your explanations.`;

    const fullPrompt = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];
    
    const response = await callAI(fullPrompt, selectedModel);
    
    hideThinking(thinkingId);
    
    const responseText = response?.message?.content || response?.text || response || 'No response received';
    addChatMessage('assistant', responseText, selectedModel);
    
    // Save chat history
    chatHistory.push({ role: 'user', content: message });
    chatHistory.push({ role: 'assistant', content: responseText });
    await Storage.save('chat_history', chatHistory);
    
  } catch (error) {
    hideThinking(thinkingId);
    addChatMessage('assistant', `Error: ${error.message}`, selectedModel, true);
    console.error('AI call failed:', error);
  }
}

function addChatMessage(role, content, modelId = null, isError = false) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;
  
  const avatarIcon = role === 'user' ? 'user' : 'bot';
  
  // Parse markdown if it's from assistant
  let parsedContent = content;
  if (role === 'assistant' && typeof marked !== 'undefined') {
    try {
      parsedContent = marked.parse(content);
    } catch (e) {
      console.warn('Markdown parsing failed:', e);
    }
  }
  
  messageEl.innerHTML = `
    <div class="message-avatar">
      <i data-lucide="${avatarIcon}"></i>
    </div>
    <div class="message-content ${isError ? 'error' : ''}">
      ${parsedContent}
      ${role === 'assistant' && modelId ? `
        <div class="regenerate-section">
          <select class="model-select regenerate-model-select">
            ${AI_MODELS.map(m => `
              <option value="${m.id}" ${m.id === modelId ? 'selected' : ''}>
                ${m.name} (${m.provider})
              </option>
            `).join('')}
          </select>
          <button class="btn btn-sm btn-secondary" onclick="regenerateMessage(this)">
            <i data-lucide="refresh-cw"></i>
            ${LanguageManager.t('regenerate')}
          </button>
        </div>
      ` : ''}
    </div>
  `;
  
  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Re-render Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

async function regenerateMessage(button) {
  const messageEl = button.closest('.message');
  const prevMessage = messageEl.previousElementSibling;
  
  if (!prevMessage || !prevMessage.classList.contains('user')) return;
  
  const userContent = prevMessage.querySelector('.message-content');
  const selectEl = messageEl.querySelector('.regenerate-model-select');
  const newModel = selectEl.value;
  
  // Remove current assistant message
  messageEl.remove();
  
  // Remove last assistant message from history
  if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'assistant') {
    chatHistory.pop();
  }
  
  // Regenerate
  const thinkingId = showThinking();
  
  try {
    const fullPrompt = [
      { role: 'system', content: 'You are Codegent AI, a helpful coding assistant.' },
      ...chatHistory.map(m => ({ role: m.role, content: m.content }))
    ];
    
    const response = await callAI(fullPrompt, newModel);
    hideThinking(thinkingId);
    
    const responseText = response?.message?.content || response?.text || response || 'No response';
    addChatMessage('assistant', responseText, newModel);
    
    chatHistory.push({ role: 'assistant', content: responseText });
    await Storage.save('chat_history', chatHistory);
    
  } catch (error) {
    hideThinking(thinkingId);
    addChatMessage('assistant', `Error: ${error.message}`, newModel, true);
  }
}

function showThinking() {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return null;
  
  const thinkingEl = document.createElement('div');
  thinkingEl.className = 'message assistant thinking';
  thinkingEl.id = 'thinking-' + Date.now();
  thinkingEl.innerHTML = `
    <div class="message-avatar">
      <i data-lucide="bot"></i>
    </div>
    <div class="thinking-indicator">
      <div class="thinking-dots">
        <span></span><span></span><span></span>
      </div>
      <span>${LanguageManager.t('thinking')}</span>
    </div>
  `;
  
  messagesContainer.appendChild(thinkingEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  return thinkingEl.id;
}

function hideThinking(thinkingId) {
  if (!thinkingId) return;
  const el = document.getElementById(thinkingId);
  if (el) el.remove();
}

function clearChat() {
  const messagesContainer = document.getElementById('chat-messages');
  if (messagesContainer) {
    messagesContainer.innerHTML = '';
  }
  chatHistory = [];
  Storage.delete('chat_history');
  showToast(LanguageManager.t('clearChat'), 'success');
}

/* ============================================
   Compare Models (Side by Side)
============================================ */
async function openComparePanel() {
  document.getElementById('modal-overlay').classList.add('visible');
  document.getElementById('compare-panel').classList.add('visible');
}

function closeComparePanel() {
  document.getElementById('modal-overlay').classList.remove('visible');
  document.getElementById('compare-panel').classList.remove('visible');
}

async function runComparison() {
  const input = document.getElementById('compare-input');
  const prompt = input.value.trim();
  
  if (!prompt) return;
  
  const model1 = document.getElementById('compare-model-1').value;
  const model2 = document.getElementById('compare-model-2').value;
  
  const result1 = document.getElementById('compare-result-1');
  const result2 = document.getElementById('compare-result-2');
  
  result1.innerHTML = `<div class="thinking-indicator"><div class="thinking-dots"><span></span><span></span><span></span></div></div>`;
  result2.innerHTML = `<div class="thinking-indicator"><div class="thinking-dots"><span></span><span></span><span></span></div></div>`;
  
  // Run both in parallel
  const [response1, response2] = await Promise.allSettled([
    callAI(prompt, model1),
    callAI(prompt, model2)
  ]);
  
  if (response1.status === 'fulfilled') {
    const text = response1.value?.message?.content || response1.value?.text || response1.value || '';
    result1.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
  } else {
    result1.innerHTML = `<span style="color: var(--accent-error)">Error: ${response1.reason?.message || 'Unknown error'}</span>`;
  }
  
  if (response2.status === 'fulfilled') {
    const text = response2.value?.message?.content || response2.value?.text || response2.value || '';
    result2.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
  } else {
    result2.innerHTML = `<span style="color: var(--accent-error)">Error: ${response2.reason?.message || 'Unknown error'}</span>`;
  }
}

/* ============================================
   Monaco Editor
============================================ */
function initMonacoEditor() {
  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
  
  require(['vs/editor/editor.main'], function () {
    // Define dark theme
    monaco.editor.defineTheme('codegent-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#f0f6fc',
        'editorLineNumber.foreground': '#6e7681',
        'editorLineNumber.activeForeground': '#f0f6fc',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#264f78aa'
      }
    });
    
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
      value: '// Welcome to Codegent\n// Start coding or ask AI for help!\n\nconsole.log("Hello, World!");',
      language: 'javascript',
      theme: 'codegent-dark',
      fontSize: 14,
      fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
      minimap: { enabled: true },
      automaticLayout: true,
      lineNumbers: 'on',
      roundedSelection: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      tabSize: 2
    });
    
    // Update preview on content change
    editor.onDidChangeModelContent(debounce(updatePreview, 500));
    
    // Initial preview update
    updatePreview();
  });
}

function setEditorLanguage(language) {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel(), language);
  }
}

function setEditorContent(content, language = 'javascript') {
  if (editor) {
    editor.setValue(content);
    setEditorLanguage(language);
  }
}

function getEditorContent() {
  return editor ? editor.getValue() : '';
}

/* ============================================
   File Tree
============================================ */
function initDefaultProject() {
  projectFiles = [
    { name: 'index.html', type: 'file', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Welcome to my project.</p>
  <script src="script.js"><\/script>
</body>
</html>` },
    { name: 'styles.css', type: 'file', content: `body {
  font-family: system-ui, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #1a1a2e;
  color: #eee;
}

h1 {
  color: #58a6ff;
}` },
    { name: 'script.js', type: 'file', content: `// JavaScript code here
console.log('Hello from Codegent!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded!');
});` }
  ];
  
  renderFileTree();
  openFile(projectFiles[0]);
}

function renderFileTree() {
  const fileTree = document.getElementById('file-tree');
  if (!fileTree) return;
  
  fileTree.innerHTML = projectFiles.map(file => `
    <div class="file-item ${file.type} ${currentFile?.name === file.name ? 'active' : ''}" 
         onclick="openFile(projectFiles.find(f => f.name === '${file.name}'))">
      <i data-lucide="${getFileIcon(file.name)}"></i>
      <span class="file-name">${file.name}</span>
    </div>
  `).join('');
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    'html': 'file-code',
    'css': 'palette',
    'js': 'file-json',
    'ts': 'file-type',
    'json': 'file-json',
    'md': 'file-text',
    'py': 'file-code',
    'java': 'coffee',
    'cpp': 'file-code',
    'c': 'file-code',
    'go': 'file-code',
    'rs': 'file-code',
    'php': 'file-code',
    'rb': 'gem',
    'swift': 'file-code',
    'kt': 'file-code'
  };
  return icons[ext] || 'file';
}

function getLanguageFromFilename(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const languages = {
    'html': 'html',
    'css': 'css',
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin',
    'sql': 'sql',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml'
  };
  return languages[ext] || 'plaintext';
}

function openFile(file) {
  if (!file) return;
  
  currentFile = file;
  setEditorContent(file.content, getLanguageFromFilename(file.name));
  renderFileTree();
  updateEditorTabs();
}

function updateEditorTabs() {
  const tabsContainer = document.getElementById('editor-tabs');
  if (!tabsContainer || !currentFile) return;
  
  tabsContainer.innerHTML = `
    <div class="editor-tab active">
      <i data-lucide="${getFileIcon(currentFile.name)}"></i>
      <span>${currentFile.name}</span>
    </div>
  `;
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function saveCurrentFile() {
  if (!currentFile) return;
  
  currentFile.content = getEditorContent();
  Storage.save('project_files', projectFiles);
  showToast(LanguageManager.t('saveProject'), 'success');
}

function createNewFile() {
  const name = prompt(LanguageManager.t('newFile') + ':');
  if (!name) return;
  
  const file = { name, type: 'file', content: '' };
  projectFiles.push(file);
  renderFileTree();
  openFile(file);
}

/* ============================================
   Live Preview
============================================ */
function updatePreview() {
  const iframe = document.getElementById('preview-frame');
  if (!iframe) return;
  
  // Save current file first
  if (currentFile) {
    currentFile.content = getEditorContent();
  }
  
  // Find HTML file
  const htmlFile = projectFiles.find(f => f.name.endsWith('.html'));
  if (!htmlFile) {
    iframe.srcdoc = '<html><body style="background:#1a1a2e;color:#eee;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui"><p>No HTML file found</p></body></html>';
    return;
  }
  
  let html = htmlFile.content;
  
  // Inject CSS
  const cssFile = projectFiles.find(f => f.name.endsWith('.css'));
  if (cssFile) {
    html = html.replace(
      /<link[^>]*href=["'][^"']*\.css["'][^>]*>/gi,
      `<style>${cssFile.content}</style>`
    );
  }
  
  // Inject JS
  const jsFile = projectFiles.find(f => f.name.endsWith('.js'));
  if (jsFile) {
    html = html.replace(
      /<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/gi,
      `<script>${jsFile.content}<\/script>`
    );
  }
  
  iframe.srcdoc = html;
}

/* ============================================
   Deploy (puter.hosting)
============================================ */
async function deployProject() {
  if (!puterReady || !isUserSignedIn) {
    const shouldLogin = confirm(LanguageManager.t('loginRequired'));
    if (shouldLogin) {
      await signIn();
    }
    if (!isUserSignedIn) return;
  }
  
  showToast(LanguageManager.t('deploying'), 'info');
  
  try {
    const timestamp = Date.now();
    const subdomain = `codegent-${timestamp}`;
    const dirName = `www_${subdomain}`;
    
    // Create directory
    await puter.fs.mkdir(dirName);
    
    // Write all files
    for (const file of projectFiles) {
      await puter.fs.write(`${dirName}/${file.name}`, file.content);
    }
    
    // Create hosting site
    const site = await puter.hosting.create(subdomain, dirName);
    const url = `https://${site.subdomain}.puter.site`;
    
    showDeploySuccess(url);
    showToast(LanguageManager.t('deploySuccess'), 'success');
    
  } catch (error) {
    console.error('Deploy failed:', error);
    showToast(`${LanguageManager.t('deployError')}: ${error.message}`, 'error');
  }
}

function showDeploySuccess(url) {
  document.getElementById('modal-overlay').classList.add('visible');
  const dialog = document.getElementById('deploy-dialog');
  dialog.classList.add('visible');
  document.getElementById('deploy-url-input').value = url;
}

function closeDeployDialog() {
  document.getElementById('modal-overlay').classList.remove('visible');
  document.getElementById('deploy-dialog').classList.remove('visible');
}

function copyDeployUrl() {
  const input = document.getElementById('deploy-url-input');
  input.select();
  document.execCommand('copy');
  showToast('URL copied!', 'success');
}

function openDeployUrl() {
  const url = document.getElementById('deploy-url-input').value;
  window.open(url, '_blank');
}

/* ============================================
   Settings
============================================ */
function openSettings() {
  document.getElementById('modal-overlay').classList.add('visible');
  document.getElementById('settings-panel').classList.add('visible');
  populateSettings();
}

function closeSettings() {
  document.getElementById('modal-overlay').classList.remove('visible');
  document.getElementById('settings-panel').classList.remove('visible');
}

function populateSettings() {
  // Populate language selector
  const langSelect = document.getElementById('language-select');
  if (langSelect) {
    langSelect.innerHTML = LanguageManager.getLanguages().map(lang => `
      <option value="${lang.code}" ${lang.code === LanguageManager.getCurrentLanguage() ? 'selected' : ''}>
        ${lang.nativeName} (${lang.name})
      </option>
    `).join('');
  }
  
  // Populate model selector
  const modelSelect = document.getElementById('default-model-select');
  if (modelSelect) {
    modelSelect.innerHTML = AI_MODELS.map(m => `
      <option value="${m.id}" ${m.id === selectedModel ? 'selected' : ''}>
        ${m.name} (${m.provider})
      </option>
    `).join('');
  }
}

function changeLanguage(langCode) {
  LanguageManager.setLanguage(langCode);
  updateUILanguage();
}

function changeDefaultModel(modelId) {
  selectedModel = modelId;
  Storage.save('selected_model', modelId);
  
  // Update header model selector
  const headerSelect = document.getElementById('model-select');
  if (headerSelect) {
    headerSelect.value = modelId;
  }
}

function updateUILanguage() {
  // Update all translatable elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = LanguageManager.t(key);
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = LanguageManager.t(key);
  });
  
  // Update document title
  document.title = LanguageManager.t('appTitle');
}

/* ============================================
   Toast Notifications
============================================ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'alert-triangle' : 'info'}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, CONFIG.TOAST_DURATION_MS);
}

/* ============================================
   Utility Functions
============================================ */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* ============================================
   Keyboard Shortcuts
============================================ */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S - Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentFile();
    }
    
    // Ctrl/Cmd + Enter - Send chat message
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const chatInput = document.getElementById('chat-input');
      if (document.activeElement === chatInput) {
        e.preventDefault();
        sendChatMessage();
      }
    }
    
    // Escape - Close modals
    if (e.key === 'Escape') {
      closeSettings();
      closeComparePanel();
      closeDeployDialog();
    }
  });
}

/* ============================================
   Initialize Application
============================================ */
async function initApp() {
  console.log('🚀 Initializing Codegent...');
  
  // Initialize language
  LanguageManager.init();
  
  // Initialize Puter with timeout
  await initPuter();
  
  // Load saved settings
  const savedModel = await Storage.load('selected_model');
  if (savedModel) {
    selectedModel = savedModel;
  }
  
  // Load saved chat history
  const savedChat = await Storage.load('chat_history');
  if (savedChat && Array.isArray(savedChat)) {
    chatHistory = savedChat;
    // Render saved messages
    savedChat.forEach(msg => {
      if (msg.role !== 'system') {
        addChatMessage(msg.role, msg.content, selectedModel);
      }
    });
  }
  
  // Load saved project files
  const savedFiles = await Storage.load('project_files');
  if (savedFiles && Array.isArray(savedFiles)) {
    projectFiles = savedFiles;
    renderFileTree();
    if (projectFiles.length > 0) {
      openFile(projectFiles[0]);
    }
  } else {
    initDefaultProject();
  }
  
  // Initialize Monaco Editor
  initMonacoEditor();
  
  // Initialize model selector
  const modelSelect = document.getElementById('model-select');
  if (modelSelect) {
    modelSelect.innerHTML = AI_MODELS.map(m => `
      <option value="${escapeHtml(m.id)}" ${m.id === selectedModel ? 'selected' : ''}>
        ${escapeHtml(m.name)} (${escapeHtml(m.provider)})
      </option>
    `).join('');
    
    modelSelect.addEventListener('change', (e) => {
      selectedModel = e.target.value;
      Storage.save('selected_model', selectedModel);
    });
  }
  
  // Initialize keyboard shortcuts
  initKeyboardShortcuts();
  
  // Update UI language
  updateUILanguage();
  
  // Update user status
  updateUserStatus();
  
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  console.log('✅ Codegent initialized successfully');
  console.log(`Puter Ready: ${puterReady}, Signed In: ${isUserSignedIn}, Cloud Storage: ${useCloudStorage}`);
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

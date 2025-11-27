/**
 * Codegent - AI-Powered Code Editor
 * Ana JavaScript Dosyası
 * 
 * İçerik:
 * - State değişkenleri
 * - Monaco Editor yapılandırması
 * - Dosya sistemi yönetimi (Puter.fs)
 * - AI Sohbet işlevleri (Puter.ai.chat)
 * - Deploy işlevleri (Puter.hosting)
 * - UI yardımcı fonksiyonları
 * - Dil desteği (20 dil)
 */

// ===================
// STATE DEĞİŞKENLERİ
// ===================

let isUserSignedIn = false;
let currentLanguage = 'tr';
let currentStyle = 'normal';
let monaco = null;
let editor = null;
let currentTheme = 'vs-dark';
let fontSize = 14;

// Dosya sistemi state'i
let files = {};
let openTabs = [];
let activeFile = null;
let projectName = 'my-project';

// Sohbet state'i
let chatHistory = [];
let isProcessing = false;

// Özel modeller
let customModels = [];

// ===================
// DİL DESTEĞİ
// ===================

// languages.js dosyasından LANGUAGES ve UI_TRANSLATIONS kullanılır
// Çeviri yardımcı fonksiyonu
function t(key) {
    const translations = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS['en'];
    return translations[key] || UI_TRANSLATIONS['en'][key] || key;
}

// ===================
// KONUŞMA STİLLERİ
// ===================

const CONVERSATION_STYLES = {
    normal: {
        name: 'Normal',
        prompt: 'Profesyonel ve net bir şekilde konuş. Kod örnekleri verirken açık ve anlaşılır ol.'
    },
    genz: {
        name: 'Z Kuşağı',
        prompt: 'Z kuşağı gibi konuş. Bol emoji kullan 🔥💀, kısa cümleler kur, güncel argo ve internet jargonu kullan. Rahat ve eğlenceli ol ama yine de doğru bilgi ver.'
    },
    academic: {
        name: 'Akademik',
        prompt: 'Akademik ve bilimsel bir dil kullan. Resmi ol, detaylı açıklamalar yap, teknik terimler kullan ve gerektiğinde kaynak belirt.'
    },
    friendly: {
        name: 'Samimi',
        prompt: 'Arkadaş gibi samimi konuş. Emoji kullan 😊, espri yap, sıcak ve yakın ol. Resmiyet yapma ama yine de yardımcı ol.'
    }
};

// ===================
// VARSAYILAN DOSYALAR
// ===================

const DEFAULT_FILES = {
    'index.html': {
        content: `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Merhaba Dünya</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Merhaba Dünya! 👋</h1>
        <p>Bu projeyi Codegent ile oluşturdunuz.</p>
        <button id="btn">Bana Tıkla</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
        language: 'html'
    },
    'styles.css': {
        content: `/* Ana Stiller */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

h1 {
    color: #333;
    margin-bottom: 1rem;
}

p {
    color: #666;
    margin-bottom: 1.5rem;
}

button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}`,
        language: 'css'
    },
    'script.js': {
        content: `// Ana JavaScript dosyası
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('btn');
    let clickCount = 0;
    
    button.addEventListener('click', function() {
        clickCount++;
        this.textContent = \`\${clickCount} kez tıklandı!\`;
        
        // Animasyon efekti
        this.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    console.log('🚀 Uygulama başlatıldı!');
});`,
        language: 'javascript'
    }
};

// ===================
// MONACO EDITOR KURULUMU
// ===================

/**
 * Monaco Editor'ü başlatır
 */
function initMonacoEditor() {
    require.config({
        paths: {
            'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs'
        }
    });

    require(['vs/editor/editor.main'], function() {
        monaco = window.monaco;
        
        // Tema tanımla
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
                'editor.background': '#151722',
                'editor.foreground': '#E1E4E8',
                'editorCursor.foreground': '#3B52D4',
                'editor.lineHighlightBackground': '#1E2130',
                'editorLineNumber.foreground': '#6B7280',
                'editor.selectionBackground': '#3B52D444',
                'editor.inactiveSelectionBackground': '#3B52D422'
            }
        });

        // Editor'ü oluştur
        editor = monaco.editor.create(document.getElementById('editor-container'), {
            value: '',
            language: 'javascript',
            theme: 'codegent-dark',
            fontSize: fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: true },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            guides: {
                bracketPairs: true,
                indentation: true
            },
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            formatOnPaste: true,
            formatOnType: true
        });

        // İçerik değişikliğinde dosyayı güncelle
        editor.onDidChangeModelContent(() => {
            if (activeFile && files[activeFile]) {
                files[activeFile].content = editor.getValue();
                updatePreview();
                saveFilesToStorage();
            }
        });

        // Varsayılan dosyaları yükle
        loadDefaultFiles();
        
        console.log('✅ Monaco Editor başlatıldı');
    });
}

// ===================
// DOSYA SİSTEMİ İŞLEVLERİ
// ===================

/**
 * Varsayılan dosyaları yükler
 */
function loadDefaultFiles() {
    // LocalStorage'dan dosyaları yükle
    const savedFiles = localStorage.getItem('codegent_files');
    if (savedFiles) {
        try {
            files = JSON.parse(savedFiles);
        } catch (e) {
            files = { ...DEFAULT_FILES };
        }
    } else {
        files = { ...DEFAULT_FILES };
    }
    
    renderFileTree();
    
    // İlk dosyayı aç
    const firstFile = Object.keys(files)[0];
    if (firstFile) {
        openFile(firstFile);
    }
}

/**
 * Dosyaları LocalStorage'a kaydeder
 */
function saveFilesToStorage() {
    localStorage.setItem('codegent_files', JSON.stringify(files));
}

/**
 * Dosya ağacını render eder
 */
function renderFileTree() {
    const container = document.getElementById('file-tree');
    container.innerHTML = '';
    
    Object.keys(files).sort().forEach(filename => {
        const fileItem = document.createElement('div');
        fileItem.className = `file-item ${activeFile === filename ? 'active' : ''}`;
        fileItem.onclick = () => openFile(filename);
        
        const icon = getFileIcon(filename);
        
        fileItem.innerHTML = `
            <i data-lucide="${icon}" class="file-icon text-gray-400"></i>
            <span class="file-name">${filename}</span>
            <div class="file-actions">
                <button class="file-action-btn" onclick="event.stopPropagation(); renameFile('${filename}')" title="Yeniden Adlandır">
                    <i data-lucide="pencil" class="w-3 h-3"></i>
                </button>
                <button class="file-action-btn" onclick="event.stopPropagation(); deleteFile('${filename}')" title="Sil">
                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
            </div>
        `;
        
        container.appendChild(fileItem);
    });
    
    // Lucide ikonlarını yenile
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Dosya uzantısına göre ikon döndürür
 */
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'html': 'file-code',
        'htm': 'file-code',
        'css': 'palette',
        'scss': 'palette',
        'less': 'palette',
        'js': 'file-json',
        'jsx': 'file-json',
        'ts': 'file-type',
        'tsx': 'file-type',
        'json': 'braces',
        'md': 'file-text',
        'py': 'file-code-2',
        'java': 'coffee',
        'c': 'file-code-2',
        'cpp': 'file-code-2',
        'cs': 'file-code-2',
        'go': 'file-code-2',
        'rs': 'file-code-2',
        'rb': 'gem',
        'php': 'file-code-2',
        'swift': 'file-code-2',
        'kt': 'file-code-2',
        'sql': 'database',
        'xml': 'file-code',
        'yaml': 'file-cog',
        'yml': 'file-cog',
        'dockerfile': 'container',
        'svg': 'image',
        'png': 'image',
        'jpg': 'image',
        'jpeg': 'image',
        'gif': 'image'
    };
    
    return iconMap[ext] || 'file';
}

/**
 * Dosyayı açar ve editöre yükler
 */
function openFile(filename) {
    if (!files[filename]) return;
    
    activeFile = filename;
    
    // Tab'ı ekle veya aktif et
    if (!openTabs.includes(filename)) {
        openTabs.push(filename);
    }
    
    renderTabs();
    renderFileTree();
    
    // Editor'e yükle
    const file = files[filename];
    const language = getMonacoLanguage(filename);
    
    editor.setValue(file.content);
    monaco.editor.setModelLanguage(editor.getModel(), language);
    
    // Önizlemeyi güncelle
    updatePreview();
}

/**
 * Monaco dil ID'sini döndürür
 */
function getMonacoLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'scss': 'scss',
        'less': 'less',
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'json': 'json',
        'md': 'markdown',
        'py': 'python',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',
        'rb': 'ruby',
        'php': 'php',
        'swift': 'swift',
        'kt': 'kotlin',
        'scala': 'scala',
        'r': 'r',
        'sql': 'sql',
        'xml': 'xml',
        'yaml': 'yaml',
        'yml': 'yaml',
        'dockerfile': 'dockerfile',
        'sh': 'shell',
        'bash': 'shell',
        'ps1': 'powershell',
        'graphql': 'graphql',
        'sol': 'sol',
        'lua': 'lua',
        'perl': 'perl',
        'hs': 'haskell',
        'ex': 'elixir',
        'clj': 'clojure',
        'fs': 'fsharp',
        'dart': 'dart',
        'jl': 'julia',
        'asm': 'asm',
        'latex': 'latex',
        'tex': 'latex',
        'vhdl': 'vhdl',
        'v': 'verilog'
    };
    
    return langMap[ext] || 'plaintext';
}

/**
 * Tab bar'ı render eder
 */
function renderTabs() {
    const container = document.getElementById('tab-bar');
    container.innerHTML = '';
    
    openTabs.forEach(filename => {
        const tab = document.createElement('div');
        tab.className = `editor-tab ${activeFile === filename ? 'active' : ''}`;
        tab.onclick = () => openFile(filename);
        
        const icon = getFileIcon(filename);
        
        tab.innerHTML = `
            <i data-lucide="${icon}" class="w-4 h-4 text-gray-400"></i>
            <span>${filename}</span>
            <button class="tab-close-btn" onclick="event.stopPropagation(); closeTab('${filename}')">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        `;
        
        container.appendChild(tab);
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Tab'ı kapatır
 */
function closeTab(filename) {
    const index = openTabs.indexOf(filename);
    if (index > -1) {
        openTabs.splice(index, 1);
        
        // Eğer aktif dosya kapatılıyorsa, başka bir dosyayı aç
        if (activeFile === filename) {
            if (openTabs.length > 0) {
                openFile(openTabs[Math.min(index, openTabs.length - 1)]);
            } else {
                activeFile = null;
                editor.setValue('');
            }
        }
        
        renderTabs();
    }
}

/**
 * Yeni dosya oluşturma modalını açar
 */
function createNewFile() {
    document.getElementById('new-file-modal').classList.remove('hidden');
    document.getElementById('new-file-name').value = '';
    document.getElementById('new-file-name').focus();
}

/**
 * Yeni dosya oluşturma modalını kapatır
 */
function closeNewFileModal() {
    document.getElementById('new-file-modal').classList.add('hidden');
}

/**
 * Yeni dosyayı onaylar ve oluşturur
 */
function confirmNewFile() {
    const filename = document.getElementById('new-file-name').value.trim();
    
    if (!filename) {
        alert(t('enterFileName') || 'Dosya adı giriniz');
        return;
    }
    
    if (files[filename]) {
        alert(t('fileExists') || 'Bu isimde bir dosya zaten var');
        return;
    }
    
    files[filename] = {
        content: '',
        language: getMonacoLanguage(filename)
    };
    
    saveFilesToStorage();
    renderFileTree();
    openFile(filename);
    closeNewFileModal();
}

/**
 * Yeni klasör oluşturur (basit implementasyon)
 */
function createNewFolder() {
    const folderName = prompt(t('enterFolderName') || 'Klasör adını giriniz:');
    if (folderName && folderName.trim()) {
        // Klasör simülasyonu: klasör adı/ + .gitkeep
        const path = folderName.trim() + '/.gitkeep';
        files[path] = { content: '', language: 'plaintext' };
        saveFilesToStorage();
        renderFileTree();
    }
}

/**
 * Dosyayı yeniden adlandırır
 */
function renameFile(oldName) {
    const newName = prompt(t('enterNewFileName') || 'Yeni dosya adını giriniz:', oldName);
    
    if (newName && newName.trim() && newName !== oldName) {
        if (files[newName]) {
            alert(t('fileExists') || 'Bu isimde bir dosya zaten var');
            return;
        }
        
        files[newName] = files[oldName];
        delete files[oldName];
        
        // Tab'ı güncelle
        const tabIndex = openTabs.indexOf(oldName);
        if (tabIndex > -1) {
            openTabs[tabIndex] = newName;
        }
        
        // Aktif dosyayı güncelle
        if (activeFile === oldName) {
            activeFile = newName;
        }
        
        saveFilesToStorage();
        renderFileTree();
        renderTabs();
    }
}

/**
 * Dosyayı siler
 */
function deleteFile(filename) {
    if (confirm(t('confirmDeleteFile') || `"${filename}" dosyasını silmek istediğinize emin misiniz?`)) {
        delete files[filename];
        
        // Tab'dan kaldır
        const tabIndex = openTabs.indexOf(filename);
        if (tabIndex > -1) {
            openTabs.splice(tabIndex, 1);
        }
        
        // Eğer aktif dosya silindiyse
        if (activeFile === filename) {
            if (openTabs.length > 0) {
                openFile(openTabs[0]);
            } else {
                activeFile = null;
                editor.setValue('');
            }
        }
        
        saveFilesToStorage();
        renderFileTree();
        renderTabs();
    }
}

// ===================
// ÖNİZLEME İŞLEVLERİ
// ===================

/**
 * Önizlemeyi günceller
 */
function updatePreview() {
    const iframe = document.getElementById('preview-frame');
    if (!iframe) return;
    
    // HTML dosyası var mı kontrol et
    const htmlFile = files['index.html'] || Object.keys(files).find(f => f.endsWith('.html'));
    
    if (htmlFile && files[htmlFile]) {
        let htmlContent = files[htmlFile].content;
        
        // CSS dosyalarını inline olarak ekle
        Object.keys(files).forEach(filename => {
            if (filename.endsWith('.css')) {
                const cssContent = files[filename].content;
                // <link> tag'ını <style> ile değiştir
                const linkTag = new RegExp(`<link[^>]*href=["']${filename}["'][^>]*>`, 'gi');
                htmlContent = htmlContent.replace(linkTag, `<style>${cssContent}</style>`);
                
                // Eğer link tag'ı yoksa, head'e ekle
                if (!htmlContent.includes(cssContent)) {
                    htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`);
                }
            }
        });
        
        // JS dosyalarını inline olarak ekle
        Object.keys(files).forEach(filename => {
            if (filename.endsWith('.js') && filename !== 'app.js') {
                const jsContent = files[filename].content;
                // <script src> tag'ını inline script ile değiştir
                const scriptTag = new RegExp(`<script[^>]*src=["']${filename}["'][^>]*></script>`, 'gi');
                htmlContent = htmlContent.replace(scriptTag, `<script>${jsContent}</script>`);
                
                // Eğer script tag'ı yoksa, body sonuna ekle
                if (!htmlContent.includes(jsContent)) {
                    htmlContent = htmlContent.replace('</body>', `<script>${jsContent}</script></body>`);
                }
            }
        });
        
        // Iframe'e yükle
        iframe.srcdoc = htmlContent;
    }
}

/**
 * Önizlemeyi yeniler
 */
function refreshPreview() {
    updatePreview();
}

/**
 * Önizleme panelini toggle eder
 */
function togglePreviewPanel() {
    const panel = document.getElementById('preview-panel');
    panel.classList.toggle('hidden');
}

// ===================
// AI SOHBET İŞLEVLERİ
// ===================

/**
 * Sohbet mesajı gönderir
 */
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || isProcessing) return;
    
    input.value = '';
    isProcessing = true;
    
    // Kullanıcı mesajını ekle
    addChatMessage('user', message);
    
    // Yükleniyor göstergesi ekle
    showTypingIndicator();
    
    try {
        // Model ve dil ayarlarını al
        const modelId = document.getElementById('model-selector').value;
        const stylePrompt = CONVERSATION_STYLES[currentStyle]?.prompt || '';
        
        // Aktif dosya içeriğini context olarak ekle
        let contextInfo = '';
        if (activeFile && files[activeFile]) {
            contextInfo = `\n\nŞu anda "${activeFile}" dosyası açık. İçeriği:\n\`\`\`\n${files[activeFile].content.substring(0, 2000)}\n\`\`\``;
        }
        
        // Dil promptu
        let langPrompt = '';
        if (LANGUAGES[currentLanguage]) {
            const langName = LANGUAGES[currentLanguage].prompt;
            langPrompt = `You MUST respond ENTIRELY in ${langName} language.`;
        }
        
        const systemPrompt = `Sen bir uzman yazılım geliştirici ve AI asistansın. Kullanıcıya kod yazma, hata ayıklama ve programlama konularında yardımcı ol.
${stylePrompt}
${langPrompt}

Kod örnekleri verirken:
- Temiz ve okunabilir kod yaz
- Yorum satırları ekle
- En iyi pratikleri kullan
${contextInfo}`;
        
        const fullPrompt = `${systemPrompt}\n\nKullanıcı: ${message}`;
        
        let response;
        
        // Puter API kontrolü
        if (typeof puter !== 'undefined' && puter.ai && puter.ai.chat) {
            response = await puter.ai.chat(fullPrompt, { model: modelId });
        } else {
            // Demo yanıt
            response = getDemoResponse(message);
        }
        
        // Yanıtı parse et
        let content = '';
        if (typeof response === 'string') {
            content = response;
        } else if (response?.message?.content) {
            content = response.message.content;
        } else if (response?.content) {
            content = response.content;
        } else if (response?.text) {
            content = response.text;
        } else if (response?.choices?.[0]?.message?.content) {
            content = response.choices[0].message.content;
        } else {
            content = String(response);
        }
        
        // Yükleniyor göstergesini kaldır
        hideTypingIndicator();
        
        // AI yanıtını ekle
        addChatMessage('assistant', content);
        
    } catch (error) {
        hideTypingIndicator();
        addChatMessage('assistant', `⚠️ Hata: ${error.message}`);
        console.error('Chat error:', error);
    } finally {
        isProcessing = false;
    }
}

/**
 * Demo yanıt döndürür (API mevcut değilse)
 */
function getDemoResponse(message) {
    const responses = [
        'Merhaba! Size nasıl yardımcı olabilirim? Kod yazımı, hata ayıklama veya programlama hakkında sorularınızı yanıtlayabilirim.',
        'Tabii ki! İşte size yardımcı olacak bir örnek kod:\n\n```javascript\nconsole.log("Merhaba Dünya!");\n```',
        'Bu harika bir soru! İşte açıklaması:\n\n1. Öncelikle değişkeni tanımlayın\n2. Ardından fonksiyonu çağırın\n3. Sonucu kontrol edin',
        'Kodunuzu inceledim. İşte bazı önerilerim:\n- Daha açıklayıcı değişken isimleri kullanın\n- Hata yakalama ekleyin\n- Kod tekrarını azaltın'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Sohbete mesaj ekler
 */
function addChatMessage(role, content) {
    const container = document.getElementById('chat-messages');
    
    // Boş state'i kaldır
    const emptyState = container.querySelector('.text-center');
    if (emptyState) {
        emptyState.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const avatar = role === 'user' ? 
        `<div class="chat-avatar"><i data-lucide="user" class="w-4 h-4"></i></div>` :
        `<div class="chat-avatar"><i data-lucide="bot" class="w-4 h-4 text-blue-400"></i></div>`;
    
    // Markdown parse et
    const parsedContent = marked.parse(content);
    
    messageDiv.innerHTML = `
        ${avatar}
        <div class="chat-bubble">${parsedContent}</div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
    
    // Lucide ikonlarını yenile
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Sohbet geçmişine ekle
    chatHistory.push({ role, content });
    saveChatHistory();
}

/**
 * Yükleniyor göstergesini gösterir
 */
function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'chat-message assistant';
    typingDiv.innerHTML = `
        <div class="chat-avatar"><i data-lucide="bot" class="w-4 h-4 text-blue-400"></i></div>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Yükleniyor göstergesini gizler
 */
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Sohbet geçmişini kaydeder
 */
function saveChatHistory() {
    localStorage.setItem('codegent_chat', JSON.stringify(chatHistory));
}

/**
 * Sohbet geçmişini yükler
 */
function loadChatHistory() {
    const saved = localStorage.getItem('codegent_chat');
    if (saved) {
        try {
            chatHistory = JSON.parse(saved);
            // Mesajları render et
            chatHistory.forEach(msg => {
                addChatMessage(msg.role, msg.content);
            });
        } catch (e) {
            console.error('Chat history load error:', e);
        }
    }
}

// ===================
// DEPLOY İŞLEVLERİ
// ===================

/**
 * Projeyi deploy eder
 */
async function deployProject() {
    if (!isUserSignedIn) {
        handleAuth();
        return;
    }
    
    const btn = document.getElementById('deploy-btn');
    const btnText = document.getElementById('deploy-btn-text');
    const originalText = btnText.textContent;
    
    btn.disabled = true;
    btnText.textContent = t('deploying') || 'Yayınlanıyor...';
    
    try {
        if (typeof puter === 'undefined' || !puter.hosting) {
            throw new Error('Puter API mevcut değil');
        }
        
        const randomId = Math.random().toString(36).substring(7);
        const subdomain = `codegent-${randomId}`;
        const dir = `codegent_${randomId}`;
        
        // Klasör oluştur
        await puter.fs.mkdir(dir);
        
        // Dosyaları yaz
        for (const [filename, file] of Object.entries(files)) {
            await puter.fs.write(`${dir}/${filename}`, file.content);
        }
        
        // Hosting oluştur
        const site = await puter.hosting.create(subdomain, dir);
        const url = `https://${site.subdomain || subdomain}.puter.site`;
        
        // Başarılı
        btn.className = btn.className.replace('bg-green-600', 'bg-blue-600');
        btnText.textContent = site.subdomain || subdomain;
        btn.onclick = () => window.open(url, '_blank');
        
        alert(`${t('deploySuccess') || 'Proje başarıyla yayınlandı!'}\n\n${url}`);
        
    } catch (error) {
        console.error('Deploy error:', error);
        alert(`${t('deployError') || 'Deploy hatası:'} ${error.message}`);
        btnText.textContent = originalText;
        btn.disabled = false;
    }
}

/**
 * Projeyi ZIP olarak indirir
 */
async function downloadProject() {
    try {
        const zip = new JSZip();
        
        // Dosyaları zip'e ekle
        for (const [filename, file] of Object.entries(files)) {
            zip.file(filename, file.content);
        }
        
        // ZIP oluştur ve indir
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Download error:', error);
        alert('İndirme hatası: ' + error.message);
    }
}

// ===================
// KULLANICI İŞLEVLERİ
// ===================

/**
 * Kullanıcı girişi/çıkışı yapar
 */
async function handleAuth() {
    if (isUserSignedIn) {
        // Çıkış yap
        isUserSignedIn = false;
        document.getElementById('username').textContent = t('guest') || 'Misafir';
        document.getElementById('user-avatar').textContent = '?';
        return;
    }
    
    try {
        if (typeof puter !== 'undefined' && puter.auth) {
            const user = await puter.auth.signIn();
            if (user) {
                isUserSignedIn = true;
                document.getElementById('username').textContent = user.username || 'Kullanıcı';
                document.getElementById('user-avatar').textContent = (user.username || 'U').charAt(0).toUpperCase();
            }
        } else {
            // Demo mod
            isUserSignedIn = true;
            document.getElementById('username').textContent = 'Demo User';
            document.getElementById('user-avatar').textContent = 'D';
        }
    } catch (error) {
        console.error('Auth error:', error);
    }
}

// ===================
// UI YARDIMCI FONKSİYONLAR
// ===================

/**
 * Ayarlar modalını toggle eder
 */
function toggleSettings() {
    document.getElementById('settings-modal').classList.toggle('hidden');
}

/**
 * Sohbet panelini toggle eder
 */
function toggleChatPanel() {
    const panel = document.getElementById('chat-panel');
    const icon = document.getElementById('chat-toggle-icon');
    
    panel.classList.toggle('collapsed');
    
    if (panel.classList.contains('collapsed')) {
        panel.style.height = '40px';
        icon.style.transform = 'rotate(180deg)';
    } else {
        panel.style.height = '288px'; // 72 * 4 = 288px
        icon.style.transform = 'rotate(0deg)';
    }
}

/**
 * Özel model ekler
 */
function addCustomModel() {
    const input = document.getElementById('custom-model-input');
    const modelId = input.value.trim();
    
    if (!modelId) return;
    
    // Model seçiciye ekle
    const selector = document.getElementById('model-selector');
    
    // Özel modeller grubu var mı kontrol et
    let customGroup = document.getElementById('custom-models-group');
    if (!customGroup) {
        customGroup = document.createElement('optgroup');
        customGroup.id = 'custom-models-group';
        customGroup.label = '🔧 Özel Modeller';
        selector.appendChild(customGroup);
    }
    
    const option = document.createElement('option');
    option.value = modelId;
    option.textContent = modelId.split('/').pop() || modelId;
    customGroup.appendChild(option);
    
    // Listeye ekle ve kaydet
    customModels.push(modelId);
    localStorage.setItem('codegent_custom_models', JSON.stringify(customModels));
    
    input.value = '';
    selector.value = modelId;
}

/**
 * Özel modelleri yükler
 */
function loadCustomModels() {
    const saved = localStorage.getItem('codegent_custom_models');
    if (saved) {
        try {
            customModels = JSON.parse(saved);
            customModels.forEach(modelId => {
                const selector = document.getElementById('model-selector');
                let customGroup = document.getElementById('custom-models-group');
                if (!customGroup) {
                    customGroup = document.createElement('optgroup');
                    customGroup.id = 'custom-models-group';
                    customGroup.label = '🔧 Özel Modeller';
                    selector.appendChild(customGroup);
                }
                
                const option = document.createElement('option');
                option.value = modelId;
                option.textContent = modelId.split('/').pop() || modelId;
                customGroup.appendChild(option);
            });
        } catch (e) {
            console.error('Custom models load error:', e);
        }
    }
}

/**
 * Dil değişikliğini işler
 */
function handleLanguageChange(lang) {
    currentLanguage = lang;
    localStorage.setItem('codegent_language', lang);
    updateUILanguage();
}

/**
 * Stil değişikliğini işler
 */
function handleStyleChange(style) {
    currentStyle = style;
    localStorage.setItem('codegent_style', style);
}

/**
 * UI dilini günceller
 */
function updateUILanguage() {
    // Temel UI elementlerini güncelle
    const elements = {
        'files-title': t('files'),
        'preview-title': t('livePreview'),
        'ai-chat-title': t('aiAssistant'),
        'chat-empty-text': t('chatEmptyText'),
        'settings-title': t('settings'),
        'new-file-title': t('newFile'),
        'deploy-btn-text': t('deploy')
    };
    
    Object.entries(elements).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el && text) {
            el.textContent = text;
        }
    });
}

/**
 * Yazı boyutu değişikliğini işler
 */
function handleFontSizeChange(size) {
    fontSize = size;
    localStorage.setItem('codegent_fontSize', size);
    document.getElementById('font-size-value').textContent = `${size}px`;
    
    if (editor) {
        editor.updateOptions({ fontSize: size });
    }
}

// ===================
// BAŞLATMA
// ===================

/**
 * Uygulamayı başlatır
 */
function initApp() {
    // Lucide ikonlarını başlat
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Kayıtlı ayarları yükle
    currentLanguage = localStorage.getItem('codegent_language') || 'tr';
    currentStyle = localStorage.getItem('codegent_style') || 'normal';
    fontSize = parseInt(localStorage.getItem('codegent_fontSize')) || 14;
    
    // UI elementlerini güncelle
    document.getElementById('language-selector').value = currentLanguage;
    document.getElementById('style-selector').value = currentStyle;
    document.getElementById('font-size-slider').value = fontSize;
    document.getElementById('font-size-value').textContent = `${fontSize}px`;
    
    // Monaco Editor'ü başlat
    initMonacoEditor();
    
    // Özel modelleri yükle
    loadCustomModels();
    
    // Sohbet geçmişini yükle
    // loadChatHistory(); // İsterseniz açabilirsiniz
    
    // Event listeners
    setupEventListeners();
    
    // UI dilini güncelle
    updateUILanguage();
    
    console.log('✅ Codegent başlatıldı');
}

/**
 * Event listener'ları ayarlar
 */
function setupEventListeners() {
    // Dil değişikliği
    document.getElementById('language-selector').addEventListener('change', (e) => {
        handleLanguageChange(e.target.value);
    });
    
    // Stil değişikliği
    document.getElementById('style-selector').addEventListener('change', (e) => {
        handleStyleChange(e.target.value);
    });
    
    // Font boyutu
    document.getElementById('font-size-slider').addEventListener('input', (e) => {
        handleFontSizeChange(parseInt(e.target.value));
    });
    
    // Sohbet input Enter tuşu
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
    
    // Yeni dosya modal Enter tuşu
    document.getElementById('new-file-name').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            confirmNewFile();
        } else if (e.key === 'Escape') {
            closeNewFileModal();
        }
    });
    
    // Pencere boyutu değişikliği
    window.addEventListener('resize', () => {
        if (editor) {
            editor.layout();
        }
    });
}

// DOM hazır olduğunda başlat
document.addEventListener('DOMContentLoaded', initApp);

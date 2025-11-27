# Codegent App

AI destekli kod editörü - Bolt.new/Lovable benzeri web uygulaması.

## 🚀 Özellikler

- **Monaco Editor**: VS Code editörünün temelini oluşturan güçlü kod editörü
- **40+ Programlama Dili Desteği**: JavaScript, TypeScript, Python, Java, C, C++, Go, Rust, ve daha fazlası
- **Canlı Önizleme**: HTML/CSS/JS projeleri için anında görsel önizleme
- **AI Asistan**: Kod hakkında soru sorun, hata ayıklama yapın, kod üretin
- **Dosya Yönetimi**: Dosya oluşturma, düzenleme, silme, yeniden adlandırma
- **Tek Tıkla Deploy**: Puter.hosting ile projenizi anında yayınlayın
- **20 Dil Desteği**: Türkçe, İngilizce, Çince, İspanyolca ve daha fazlası
- **Konuşma Stilleri**: Normal, Z Kuşağı, Akademik, Samimi
- **Dark Tema**: Göz yormayan koyu tema

## 🤖 Desteklenen AI Modelleri

### 2025 Flagships
- GPT 5.1 (Preview)
- Claude Opus 4.5
- Gemini 3 Ultra
- Grok 3
- DeepSeek R1

### Anthropic Claude Ailesi
- Claude Sonnet 4 (Native)
- Claude 3.7 Sonnet
- Claude 3.5 Sonnet
- Claude Opus 4.1
- Claude Haiku 4.5

### OpenAI GPT & O Serisi
- GPT-4o (Native)
- GPT 5
- OpenAI o3
- o3 Deep Research
- GPT-5 Image

### Google Gemini
- Gemini 3 Pro (Native)
- Gemini 2.5 Pro
- Gemini 2.5 Flash

### xAI Grok
- Grok 4.1 Fast
- Grok 4
- Grok 2

### DeepSeek & Çin Modelleri
- DeepSeek V3.1
- DeepSeek V3.2 Exp
- Kimi k2 Thinking
- GLM 4.6

### Diğer Modeller
- Llama 4 Maverick
- Llama 3.3 70B
- Qwen 2.5 72B
- Mistral Large 2411
- Perplexity Sonar Pro

## 🛠️ Kurulum

Bu uygulama tamamen istemci tarafında çalışır ve herhangi bir sunucu gerektirmez.

### Yerel Kullanım

1. Dosyaları indirin veya klonlayın
2. `index.html` dosyasını tarayıcınızda açın

### Hosting

Projeyi herhangi bir statik hosting servisinde barındırabilirsiniz:
- GitHub Pages
- Netlify
- Vercel
- Puter Hosting

## 📁 Dosya Yapısı

```
app/
├── index.html      # Ana HTML dosyası
├── app.js          # Ana JavaScript - Editor, AI, Dosya Yönetimi
├── styles.css      # Tüm stiller
├── languages.js    # 20 dil çevirisi
└── README.md       # Bu dosya
```

## 🔧 Teknolojiler

- **Monaco Editor**: Kod düzenleme
- **Puter.js**: Kimlik doğrulama, dosya sistemi, hosting, AI
- **TailwindCSS**: Stil
- **Lucide Icons**: İkonlar
- **Marked.js**: Markdown işleme
- **JSZip**: Proje indirme

## 🌐 API Entegrasyonları

### Puter.js
- `puter.ai.chat()`: AI sohbet API'si
- `puter.fs`: Dosya sistemi işlemleri
- `puter.hosting`: Tek tıkla deploy
- `puter.auth`: Kullanıcı kimlik doğrulama

## 📝 Kullanım

### Dosya Oluşturma
1. Sol panelde "+" ikonuna tıklayın
2. Dosya adını girin (örn: `app.js`, `style.css`)
3. Enter'a basın

### AI ile Sohbet
1. Alt paneldeki sohbet alanına mesajınızı yazın
2. Enter'a basın veya gönder butonuna tıklayın
3. AI yanıtını bekleyin

### Proje Deploy
1. Sağ üstteki "Deploy" butonuna tıklayın
2. Puter hesabınızla giriş yapın (ilk kullanımda)
3. Projeniz `*.puter.site` adresinde yayınlanır

### Proje İndirme
1. Header'daki indirme ikonuna tıklayın
2. Proje ZIP olarak indirilir

## 🔒 Gizlilik

- Tüm dosyalar tarayıcınızın LocalStorage'ında saklanır
- Puter hesabı ile giriş yaparsanız dosyalar bulutta senkronize edilir
- AI sorguları seçilen model sağlayıcısına gönderilir

## 📄 Lisans

MIT License - Özgürce kullanın, değiştirin ve dağıtın.

## 🤝 Katkıda Bulunma

1. Repo'yu fork edin
2. Değişikliklerinizi yapın
3. Pull request gönderin

---

**Codegent** - Kodlamanın geleceği 🚀

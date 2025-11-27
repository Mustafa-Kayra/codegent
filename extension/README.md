# AI Agent - VS Code Extension

GitHub Copilot alternatifi - AI destekli kod tamamlama ve sohbet extension'ı.

## 🚀 Özellikler

### Tab ile Otomatik Tamamlama (Inline Completion)
Kod yazarken Tab tuşuna basarak AI önerilerini kabul edin.

- Tüm programlama dilleri desteklenir
- Context-aware öneriler
- Hızlı ve akıllı tamamlamalar

### Sohbet Paneli
VS Code sidebar'da AI ile sohbet edin.

- Kod hakkında soru sorun
- Hata ayıklama yardımı alın
- Refactoring önerileri isteyin
- Test oluşturun
- Dokümantasyon ekleyin

### Sağ Tıklama Menüsü
Kod seçip sağ tıklayarak:

- **Kodu Açıkla**: Seçili kodu AI'a açıklatın
- **Refactor Et**: Daha iyi kod önerileri alın
- **Hataları Düzelt**: Potansiyel hataları tespit edin
- **Test Oluştur**: Unit test oluşturun
- **Dokümantasyon Ekle**: JSDoc/docstring ekleyin

### MCP Server Desteği
Model Context Protocol ile harici araçlara bağlanın.

## ⌨️ Kısayollar

| Kısayol | Açıklama |
|---------|----------|
| `Ctrl+Shift+A` / `Cmd+Shift+A` | Sohbet panelini aç |
| `Ctrl+Alt+A` / `Cmd+Alt+A` | Inline tamamlamayı aç/kapat |
| `Tab` | AI önerisini kabul et |

## ⚙️ Ayarlar

Extension ayarlarını `File > Preferences > Settings` menüsünden yapabilirsiniz.

| Ayar | Açıklama | Varsayılan |
|------|----------|------------|
| `aiAgent.enabled` | Extension'ı etkinleştir | `true` |
| `aiAgent.inlineCompletionEnabled` | Tab tamamlamayı etkinleştir | `true` |
| `aiAgent.model` | Kullanılacak AI modeli | `claude-sonnet-4` |
| `aiAgent.language` | Yanıt dili | `tr` |
| `aiAgent.maxTokens` | Maksimum token | `2048` |
| `aiAgent.completionDelay` | Tamamlama gecikmesi (ms) | `500` |

## 🤖 Desteklenen Modeller

- **Anthropic Claude**: claude-sonnet-4, claude-3.7-sonnet, claude-3.5-sonnet
- **OpenAI GPT**: gpt-4o, gpt-5, o3
- **Google Gemini**: gemini-3-pro, gemini-2.5-pro
- **DeepSeek**: deepseek-r1, deepseek-v3.1
- **Meta Llama**: llama-4-maverick, llama-3.3-70b
- **xAI Grok**: grok-3, grok-4

## 📦 Kurulum

### VS Code Marketplace'den
1. VS Code'u açın
2. Extensions paneline gidin (Ctrl+Shift+X)
3. "AI Agent" arayın
4. Install'a tıklayın

### Manuel Kurulum
1. Extension klasörünü indirin
2. `npm install` çalıştırın
3. `npm run compile` çalıştırın
4. VS Code'da F5 ile debug modunda çalıştırın

## 🔧 Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Derleme
npm run compile

# İzleme modu
npm run watch

# Paketleme
npm run package

# Lint
npm run lint

# Test
npm run test
```

## 📁 Proje Yapısı

```
extension/
├── src/
│   ├── extension.ts              # Ana giriş noktası
│   ├── providers/
│   │   ├── inlineCompletionProvider.ts   # Tab otomatik tamamlama
│   │   ├── chatViewProvider.ts           # Sohbet paneli
│   │   └── mcpProvider.ts                # MCP desteği
│   ├── services/
│   │   ├── aiService.ts                  # AI API çağrıları
│   │   ├── databaseService.ts            # Veri depolama
│   │   └── contextService.ts             # Kod context'i
│   └── utils/
│       └── languageUtils.ts              # Dil araçları
├── package.json                  # Extension manifest
├── tsconfig.json                 # TypeScript yapılandırması
├── webpack.config.js             # Webpack yapılandırması
└── README.md                     # Bu dosya
```

## 🔐 API Anahtarları

AI modellerini kullanmak için ilgili API anahtarlarını ayarlayın:

1. **OpenRouter**: Tek anahtarla çoklu model erişimi
2. **Anthropic**: Claude modelleri için
3. **OpenAI**: GPT modelleri için
4. **Google**: Gemini modelleri için

Anahtarları ortam değişkenlerinde tanımlayabilirsiniz:
- `OPENROUTER_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`

## 🔌 MCP Server Yapılandırması

`settings.json` dosyasında MCP sunucularını yapılandırın:

```json
{
    "aiAgent.mcpServers": [
        {
            "name": "filesystem",
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/directory"]
        }
    ]
}
```

## 🐛 Sorun Giderme

### Extension çalışmıyor
1. VS Code'u yeniden başlatın
2. Extension'ın etkin olduğundan emin olun
3. Output panelinde "AI Agent" kanalını kontrol edin

### API hatası alıyorum
1. API anahtarınızı kontrol edin
2. İnternet bağlantınızı kontrol edin
3. Model adının doğru olduğundan emin olun

### Tamamlamalar gelmiyor
1. `aiAgent.inlineCompletionEnabled` ayarını kontrol edin
2. `aiAgent.completionDelay` değerini artırın
3. Dosya türünün desteklendiğinden emin olun

## 📄 Lisans

MIT License

## 🤝 Katkıda Bulunma

1. Repo'yu fork edin
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

---

**AI Agent** - Kodlamanın geleceği 🚀

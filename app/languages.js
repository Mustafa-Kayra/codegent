/**
 * Codegent - AI-Powered Code Editor
 * Dil Desteği Dosyası
 * 
 * İçerik:
 * - 20 dil için dil yapılandırmaları
 * - UI çevirileri
 */

// Desteklenen diller ve özellikleri
const LANGUAGES = {
    tr: { name: 'Türkçe', flag: '🇹🇷', prompt: 'Türkçe' },
    en: { name: 'English', flag: '🇺🇸', prompt: 'English' },
    zh: { name: '中文', flag: '🇨🇳', prompt: 'Chinese (Mandarin)' },
    es: { name: 'Español', flag: '🇪🇸', prompt: 'Spanish' },
    ar: { name: 'العربية', flag: '🇸🇦', prompt: 'Arabic' },
    hi: { name: 'हिन्दी', flag: '🇮🇳', prompt: 'Hindi' },
    pt: { name: 'Português', flag: '🇧🇷', prompt: 'Portuguese' },
    ru: { name: 'Русский', flag: '🇷🇺', prompt: 'Russian' },
    ja: { name: '日本語', flag: '🇯🇵', prompt: 'Japanese' },
    de: { name: 'Deutsch', flag: '🇩🇪', prompt: 'German' },
    fr: { name: 'Français', flag: '🇫🇷', prompt: 'French' },
    ko: { name: '한국어', flag: '🇰🇷', prompt: 'Korean' },
    it: { name: 'Italiano', flag: '🇮🇹', prompt: 'Italian' },
    vi: { name: 'Tiếng Việt', flag: '🇻🇳', prompt: 'Vietnamese' },
    fa: { name: 'فارسی', flag: '🇮🇷', prompt: 'Persian' },
    pl: { name: 'Polski', flag: '🇵🇱', prompt: 'Polish' },
    uk: { name: 'Українська', flag: '🇺🇦', prompt: 'Ukrainian' },
    ro: { name: 'Română', flag: '🇷🇴', prompt: 'Romanian' },
    nl: { name: 'Nederlands', flag: '🇳🇱', prompt: 'Dutch' },
    th: { name: 'ไทย', flag: '🇹🇭', prompt: 'Thai' }
};

// Arayüz çevirileri - Türkçe
const UI_TR = {
    files: 'Dosyalar',
    livePreview: 'Canlı Önizleme',
    aiAssistant: 'AI Asistan',
    chatEmptyText: 'Kod hakkında soru sorun veya AI\'dan yardım isteyin',
    settings: 'Ayarlar',
    newFile: 'Yeni Dosya',
    newFolder: 'Yeni Klasör',
    deploy: 'Deploy',
    deploying: 'Yayınlanıyor...',
    deploySuccess: 'Proje başarıyla yayınlandı!',
    deployError: 'Deploy hatası:',
    guest: 'Misafir',
    login: 'Giriş Yap',
    enterFileName: 'Dosya adı giriniz',
    enterFolderName: 'Klasör adını giriniz:',
    enterNewFileName: 'Yeni dosya adını giriniz:',
    fileExists: 'Bu isimde bir dosya zaten var',
    confirmDeleteFile: 'Bu dosyayı silmek istediğinize emin misiniz?',
    theme: 'Tema',
    fontSize: 'Yazı Boyutu',
    addCustomModel: 'Özel Model Ekle',
    downloadProject: 'Proje İndir',
    refresh: 'Yenile'
};

// Arayüz çevirileri - İngilizce
const UI_EN = {
    files: 'Files',
    livePreview: 'Live Preview',
    aiAssistant: 'AI Assistant',
    chatEmptyText: 'Ask questions about code or request help from AI',
    settings: 'Settings',
    newFile: 'New File',
    newFolder: 'New Folder',
    deploy: 'Deploy',
    deploying: 'Deploying...',
    deploySuccess: 'Project deployed successfully!',
    deployError: 'Deploy error:',
    guest: 'Guest',
    login: 'Sign In',
    enterFileName: 'Enter file name',
    enterFolderName: 'Enter folder name:',
    enterNewFileName: 'Enter new file name:',
    fileExists: 'A file with this name already exists',
    confirmDeleteFile: 'Are you sure you want to delete this file?',
    theme: 'Theme',
    fontSize: 'Font Size',
    addCustomModel: 'Add Custom Model',
    downloadProject: 'Download Project',
    refresh: 'Refresh'
};

// Arayüz çevirileri - Çince
const UI_ZH = {
    files: '文件',
    livePreview: '实时预览',
    aiAssistant: 'AI助手',
    chatEmptyText: '询问代码问题或请求AI帮助',
    settings: '设置',
    newFile: '新建文件',
    newFolder: '新建文件夹',
    deploy: '部署',
    deploying: '部署中...',
    deploySuccess: '项目部署成功！',
    deployError: '部署错误:',
    guest: '访客',
    login: '登录',
    enterFileName: '输入文件名',
    enterFolderName: '输入文件夹名:',
    enterNewFileName: '输入新文件名:',
    fileExists: '此名称的文件已存在',
    confirmDeleteFile: '确定要删除此文件吗？',
    theme: '主题',
    fontSize: '字体大小',
    addCustomModel: '添加自定义模型',
    downloadProject: '下载项目',
    refresh: '刷新'
};

// Arayüz çevirileri - İspanyolca
const UI_ES = {
    files: 'Archivos',
    livePreview: 'Vista Previa en Vivo',
    aiAssistant: 'Asistente IA',
    chatEmptyText: 'Haz preguntas sobre código o pide ayuda a la IA',
    settings: 'Configuración',
    newFile: 'Nuevo Archivo',
    newFolder: 'Nueva Carpeta',
    deploy: 'Desplegar',
    deploying: 'Desplegando...',
    deploySuccess: '¡Proyecto desplegado exitosamente!',
    deployError: 'Error de despliegue:',
    guest: 'Invitado',
    login: 'Iniciar Sesión',
    enterFileName: 'Ingrese el nombre del archivo',
    enterFolderName: 'Ingrese el nombre de la carpeta:',
    enterNewFileName: 'Ingrese el nuevo nombre del archivo:',
    fileExists: 'Ya existe un archivo con este nombre',
    confirmDeleteFile: '¿Está seguro de que desea eliminar este archivo?',
    theme: 'Tema',
    fontSize: 'Tamaño de Fuente',
    addCustomModel: 'Agregar Modelo Personalizado',
    downloadProject: 'Descargar Proyecto',
    refresh: 'Actualizar'
};

// Arayüz çevirileri - Arapça
const UI_AR = {
    files: 'الملفات',
    livePreview: 'معاينة مباشرة',
    aiAssistant: 'مساعد الذكاء الاصطناعي',
    chatEmptyText: 'اسأل أسئلة حول الكود أو اطلب المساعدة من الذكاء الاصطناعي',
    settings: 'الإعدادات',
    newFile: 'ملف جديد',
    newFolder: 'مجلد جديد',
    deploy: 'نشر',
    deploying: 'جاري النشر...',
    deploySuccess: 'تم نشر المشروع بنجاح!',
    deployError: 'خطأ في النشر:',
    guest: 'ضيف',
    login: 'تسجيل الدخول',
    enterFileName: 'أدخل اسم الملف',
    enterFolderName: 'أدخل اسم المجلد:',
    enterNewFileName: 'أدخل اسم الملف الجديد:',
    fileExists: 'يوجد ملف بهذا الاسم بالفعل',
    confirmDeleteFile: 'هل أنت متأكد من حذف هذا الملف؟',
    theme: 'السمة',
    fontSize: 'حجم الخط',
    addCustomModel: 'إضافة نموذج مخصص',
    downloadProject: 'تحميل المشروع',
    refresh: 'تحديث'
};

// Arayüz çevirileri - Hintçe
const UI_HI = {
    files: 'फाइलें',
    livePreview: 'लाइव प्रीव्यू',
    aiAssistant: 'AI सहायक',
    chatEmptyText: 'कोड के बारे में प्रश्न पूछें या AI से सहायता मांगें',
    settings: 'सेटिंग्स',
    newFile: 'नई फाइल',
    newFolder: 'नया फोल्डर',
    deploy: 'डिप्लॉय',
    deploying: 'डिप्लॉय हो रहा है...',
    deploySuccess: 'प्रोजेक्ट सफलतापूर्वक डिप्लॉय हुआ!',
    deployError: 'डिप्लॉय त्रुटि:',
    guest: 'अतिथि',
    login: 'साइन इन करें',
    enterFileName: 'फाइल का नाम दर्ज करें',
    enterFolderName: 'फोल्डर का नाम दर्ज करें:',
    enterNewFileName: 'नया फाइल नाम दर्ज करें:',
    fileExists: 'इस नाम की फाइल पहले से मौजूद है',
    confirmDeleteFile: 'क्या आप वाकई इस फाइल को हटाना चाहते हैं?',
    theme: 'थीम',
    fontSize: 'फॉन्ट साइज़',
    addCustomModel: 'कस्टम मॉडल जोड़ें',
    downloadProject: 'प्रोजेक्ट डाउनलोड करें',
    refresh: 'रिफ्रेश'
};

// Arayüz çevirileri - Portekizce
const UI_PT = {
    files: 'Arquivos',
    livePreview: 'Pré-visualização ao Vivo',
    aiAssistant: 'Assistente IA',
    chatEmptyText: 'Faça perguntas sobre código ou peça ajuda à IA',
    settings: 'Configurações',
    newFile: 'Novo Arquivo',
    newFolder: 'Nova Pasta',
    deploy: 'Deploy',
    deploying: 'Fazendo deploy...',
    deploySuccess: 'Projeto implantado com sucesso!',
    deployError: 'Erro de deploy:',
    guest: 'Convidado',
    login: 'Entrar',
    enterFileName: 'Digite o nome do arquivo',
    enterFolderName: 'Digite o nome da pasta:',
    enterNewFileName: 'Digite o novo nome do arquivo:',
    fileExists: 'Já existe um arquivo com este nome',
    confirmDeleteFile: 'Tem certeza de que deseja excluir este arquivo?',
    theme: 'Tema',
    fontSize: 'Tamanho da Fonte',
    addCustomModel: 'Adicionar Modelo Personalizado',
    downloadProject: 'Baixar Projeto',
    refresh: 'Atualizar'
};

// Arayüz çevirileri - Rusça
const UI_RU = {
    files: 'Файлы',
    livePreview: 'Предпросмотр',
    aiAssistant: 'AI Ассистент',
    chatEmptyText: 'Задавайте вопросы о коде или просите помощи у AI',
    settings: 'Настройки',
    newFile: 'Новый файл',
    newFolder: 'Новая папка',
    deploy: 'Развернуть',
    deploying: 'Развертывание...',
    deploySuccess: 'Проект успешно развернут!',
    deployError: 'Ошибка развертывания:',
    guest: 'Гость',
    login: 'Войти',
    enterFileName: 'Введите имя файла',
    enterFolderName: 'Введите имя папки:',
    enterNewFileName: 'Введите новое имя файла:',
    fileExists: 'Файл с таким именем уже существует',
    confirmDeleteFile: 'Вы уверены, что хотите удалить этот файл?',
    theme: 'Тема',
    fontSize: 'Размер шрифта',
    addCustomModel: 'Добавить модель',
    downloadProject: 'Скачать проект',
    refresh: 'Обновить'
};

// Arayüz çevirileri - Japonca
const UI_JA = {
    files: 'ファイル',
    livePreview: 'ライブプレビュー',
    aiAssistant: 'AIアシスタント',
    chatEmptyText: 'コードについて質問するか、AIにヘルプを求めてください',
    settings: '設定',
    newFile: '新規ファイル',
    newFolder: '新規フォルダ',
    deploy: 'デプロイ',
    deploying: 'デプロイ中...',
    deploySuccess: 'プロジェクトが正常にデプロイされました！',
    deployError: 'デプロイエラー:',
    guest: 'ゲスト',
    login: 'サインイン',
    enterFileName: 'ファイル名を入力',
    enterFolderName: 'フォルダ名を入力:',
    enterNewFileName: '新しいファイル名を入力:',
    fileExists: 'この名前のファイルは既に存在します',
    confirmDeleteFile: 'このファイルを削除してもよろしいですか？',
    theme: 'テーマ',
    fontSize: 'フォントサイズ',
    addCustomModel: 'カスタムモデルを追加',
    downloadProject: 'プロジェクトをダウンロード',
    refresh: '更新'
};

// Arayüz çevirileri - Almanca
const UI_DE = {
    files: 'Dateien',
    livePreview: 'Live-Vorschau',
    aiAssistant: 'KI-Assistent',
    chatEmptyText: 'Stellen Sie Fragen zum Code oder bitten Sie die KI um Hilfe',
    settings: 'Einstellungen',
    newFile: 'Neue Datei',
    newFolder: 'Neuer Ordner',
    deploy: 'Bereitstellen',
    deploying: 'Wird bereitgestellt...',
    deploySuccess: 'Projekt erfolgreich bereitgestellt!',
    deployError: 'Bereitstellungsfehler:',
    guest: 'Gast',
    login: 'Anmelden',
    enterFileName: 'Dateinamen eingeben',
    enterFolderName: 'Ordnernamen eingeben:',
    enterNewFileName: 'Neuen Dateinamen eingeben:',
    fileExists: 'Eine Datei mit diesem Namen existiert bereits',
    confirmDeleteFile: 'Sind Sie sicher, dass Sie diese Datei löschen möchten?',
    theme: 'Design',
    fontSize: 'Schriftgröße',
    addCustomModel: 'Benutzerdefiniertes Modell hinzufügen',
    downloadProject: 'Projekt herunterladen',
    refresh: 'Aktualisieren'
};

// Arayüz çevirileri - Fransızca
const UI_FR = {
    files: 'Fichiers',
    livePreview: 'Aperçu en direct',
    aiAssistant: 'Assistant IA',
    chatEmptyText: 'Posez des questions sur le code ou demandez de l\'aide à l\'IA',
    settings: 'Paramètres',
    newFile: 'Nouveau fichier',
    newFolder: 'Nouveau dossier',
    deploy: 'Déployer',
    deploying: 'Déploiement...',
    deploySuccess: 'Projet déployé avec succès !',
    deployError: 'Erreur de déploiement :',
    guest: 'Invité',
    login: 'Se connecter',
    enterFileName: 'Entrez le nom du fichier',
    enterFolderName: 'Entrez le nom du dossier :',
    enterNewFileName: 'Entrez le nouveau nom du fichier :',
    fileExists: 'Un fichier avec ce nom existe déjà',
    confirmDeleteFile: 'Êtes-vous sûr de vouloir supprimer ce fichier ?',
    theme: 'Thème',
    fontSize: 'Taille de police',
    addCustomModel: 'Ajouter un modèle personnalisé',
    downloadProject: 'Télécharger le projet',
    refresh: 'Actualiser'
};

// Arayüz çevirileri - Korece
const UI_KO = {
    files: '파일',
    livePreview: '실시간 미리보기',
    aiAssistant: 'AI 어시스턴트',
    chatEmptyText: '코드에 대해 질문하거나 AI에게 도움을 요청하세요',
    settings: '설정',
    newFile: '새 파일',
    newFolder: '새 폴더',
    deploy: '배포',
    deploying: '배포 중...',
    deploySuccess: '프로젝트가 성공적으로 배포되었습니다!',
    deployError: '배포 오류:',
    guest: '게스트',
    login: '로그인',
    enterFileName: '파일 이름 입력',
    enterFolderName: '폴더 이름 입력:',
    enterNewFileName: '새 파일 이름 입력:',
    fileExists: '이 이름의 파일이 이미 존재합니다',
    confirmDeleteFile: '이 파일을 삭제하시겠습니까?',
    theme: '테마',
    fontSize: '글꼴 크기',
    addCustomModel: '사용자 정의 모델 추가',
    downloadProject: '프로젝트 다운로드',
    refresh: '새로고침'
};

// Arayüz çevirileri - İtalyanca
const UI_IT = {
    files: 'File',
    livePreview: 'Anteprima Live',
    aiAssistant: 'Assistente IA',
    chatEmptyText: 'Fai domande sul codice o chiedi aiuto all\'IA',
    settings: 'Impostazioni',
    newFile: 'Nuovo File',
    newFolder: 'Nuova Cartella',
    deploy: 'Deploy',
    deploying: 'Distribuzione...',
    deploySuccess: 'Progetto distribuito con successo!',
    deployError: 'Errore di distribuzione:',
    guest: 'Ospite',
    login: 'Accedi',
    enterFileName: 'Inserisci il nome del file',
    enterFolderName: 'Inserisci il nome della cartella:',
    enterNewFileName: 'Inserisci il nuovo nome del file:',
    fileExists: 'Esiste già un file con questo nome',
    confirmDeleteFile: 'Sei sicuro di voler eliminare questo file?',
    theme: 'Tema',
    fontSize: 'Dimensione Font',
    addCustomModel: 'Aggiungi Modello Personalizzato',
    downloadProject: 'Scarica Progetto',
    refresh: 'Aggiorna'
};

// Arayüz çevirileri - Vietnamca
const UI_VI = {
    files: 'Tệp',
    livePreview: 'Xem trước trực tiếp',
    aiAssistant: 'Trợ lý AI',
    chatEmptyText: 'Đặt câu hỏi về mã hoặc yêu cầu AI giúp đỡ',
    settings: 'Cài đặt',
    newFile: 'Tệp mới',
    newFolder: 'Thư mục mới',
    deploy: 'Triển khai',
    deploying: 'Đang triển khai...',
    deploySuccess: 'Dự án đã được triển khai thành công!',
    deployError: 'Lỗi triển khai:',
    guest: 'Khách',
    login: 'Đăng nhập',
    enterFileName: 'Nhập tên tệp',
    enterFolderName: 'Nhập tên thư mục:',
    enterNewFileName: 'Nhập tên tệp mới:',
    fileExists: 'Tệp có tên này đã tồn tại',
    confirmDeleteFile: 'Bạn có chắc muốn xóa tệp này?',
    theme: 'Giao diện',
    fontSize: 'Cỡ chữ',
    addCustomModel: 'Thêm mô hình tùy chỉnh',
    downloadProject: 'Tải dự án',
    refresh: 'Làm mới'
};

// Arayüz çevirileri - Farsça
const UI_FA = {
    files: 'فایل‌ها',
    livePreview: 'پیش‌نمایش زنده',
    aiAssistant: 'دستیار هوش مصنوعی',
    chatEmptyText: 'درباره کد سوال بپرسید یا از هوش مصنوعی کمک بخواهید',
    settings: 'تنظیمات',
    newFile: 'فایل جدید',
    newFolder: 'پوشه جدید',
    deploy: 'استقرار',
    deploying: 'در حال استقرار...',
    deploySuccess: 'پروژه با موفقیت مستقر شد!',
    deployError: 'خطای استقرار:',
    guest: 'مهمان',
    login: 'ورود',
    enterFileName: 'نام فایل را وارد کنید',
    enterFolderName: 'نام پوشه را وارد کنید:',
    enterNewFileName: 'نام جدید فایل را وارد کنید:',
    fileExists: 'فایلی با این نام از قبل وجود دارد',
    confirmDeleteFile: 'آیا مطمئن هستید که می‌خواهید این فایل را حذف کنید؟',
    theme: 'پوسته',
    fontSize: 'اندازه فونت',
    addCustomModel: 'افزودن مدل سفارشی',
    downloadProject: 'دانلود پروژه',
    refresh: 'بازخوانی'
};

// Arayüz çevirileri - Lehçe
const UI_PL = {
    files: 'Pliki',
    livePreview: 'Podgląd na żywo',
    aiAssistant: 'Asystent AI',
    chatEmptyText: 'Zadaj pytania dotyczące kodu lub poproś AI o pomoc',
    settings: 'Ustawienia',
    newFile: 'Nowy plik',
    newFolder: 'Nowy folder',
    deploy: 'Wdróż',
    deploying: 'Wdrażanie...',
    deploySuccess: 'Projekt został pomyślnie wdrożony!',
    deployError: 'Błąd wdrażania:',
    guest: 'Gość',
    login: 'Zaloguj się',
    enterFileName: 'Wprowadź nazwę pliku',
    enterFolderName: 'Wprowadź nazwę folderu:',
    enterNewFileName: 'Wprowadź nową nazwę pliku:',
    fileExists: 'Plik o tej nazwie już istnieje',
    confirmDeleteFile: 'Czy na pewno chcesz usunąć ten plik?',
    theme: 'Motyw',
    fontSize: 'Rozmiar czcionki',
    addCustomModel: 'Dodaj własny model',
    downloadProject: 'Pobierz projekt',
    refresh: 'Odśwież'
};

// Arayüz çevirileri - Ukraynaca
const UI_UK = {
    files: 'Файли',
    livePreview: 'Попередній перегляд',
    aiAssistant: 'AI Асистент',
    chatEmptyText: 'Задавайте питання про код або просіть допомоги у AI',
    settings: 'Налаштування',
    newFile: 'Новий файл',
    newFolder: 'Нова папка',
    deploy: 'Розгорнути',
    deploying: 'Розгортання...',
    deploySuccess: 'Проект успішно розгорнуто!',
    deployError: 'Помилка розгортання:',
    guest: 'Гість',
    login: 'Увійти',
    enterFileName: 'Введіть назву файлу',
    enterFolderName: 'Введіть назву папки:',
    enterNewFileName: 'Введіть нову назву файлу:',
    fileExists: 'Файл з такою назвою вже існує',
    confirmDeleteFile: 'Ви впевнені, що хочете видалити цей файл?',
    theme: 'Тема',
    fontSize: 'Розмір шрифту',
    addCustomModel: 'Додати модель',
    downloadProject: 'Завантажити проект',
    refresh: 'Оновити'
};

// Arayüz çevirileri - Romence
const UI_RO = {
    files: 'Fișiere',
    livePreview: 'Previzualizare live',
    aiAssistant: 'Asistent AI',
    chatEmptyText: 'Puneți întrebări despre cod sau cereți ajutor AI',
    settings: 'Setări',
    newFile: 'Fișier nou',
    newFolder: 'Folder nou',
    deploy: 'Implementare',
    deploying: 'Se implementează...',
    deploySuccess: 'Proiectul a fost implementat cu succes!',
    deployError: 'Eroare de implementare:',
    guest: 'Oaspete',
    login: 'Autentificare',
    enterFileName: 'Introduceți numele fișierului',
    enterFolderName: 'Introduceți numele folderului:',
    enterNewFileName: 'Introduceți noul nume al fișierului:',
    fileExists: 'Un fișier cu acest nume există deja',
    confirmDeleteFile: 'Sigur doriți să ștergeți acest fișier?',
    theme: 'Temă',
    fontSize: 'Dimensiune font',
    addCustomModel: 'Adaugă model personalizat',
    downloadProject: 'Descarcă proiect',
    refresh: 'Reîmprospătare'
};

// Arayüz çevirileri - Hollandaca
const UI_NL = {
    files: 'Bestanden',
    livePreview: 'Live Voorbeeld',
    aiAssistant: 'AI Assistent',
    chatEmptyText: 'Stel vragen over code of vraag hulp aan AI',
    settings: 'Instellingen',
    newFile: 'Nieuw bestand',
    newFolder: 'Nieuwe map',
    deploy: 'Implementeren',
    deploying: 'Implementeren...',
    deploySuccess: 'Project succesvol geïmplementeerd!',
    deployError: 'Implementatiefout:',
    guest: 'Gast',
    login: 'Inloggen',
    enterFileName: 'Voer bestandsnaam in',
    enterFolderName: 'Voer mapnaam in:',
    enterNewFileName: 'Voer nieuwe bestandsnaam in:',
    fileExists: 'Een bestand met deze naam bestaat al',
    confirmDeleteFile: 'Weet u zeker dat u dit bestand wilt verwijderen?',
    theme: 'Thema',
    fontSize: 'Lettergrootte',
    addCustomModel: 'Aangepast model toevoegen',
    downloadProject: 'Project downloaden',
    refresh: 'Vernieuwen'
};

// Arayüz çevirileri - Tayca
const UI_TH = {
    files: 'ไฟล์',
    livePreview: 'ดูตัวอย่างสด',
    aiAssistant: 'ผู้ช่วย AI',
    chatEmptyText: 'ถามคำถามเกี่ยวกับโค้ดหรือขอความช่วยเหลือจาก AI',
    settings: 'การตั้งค่า',
    newFile: 'ไฟล์ใหม่',
    newFolder: 'โฟลเดอร์ใหม่',
    deploy: 'ปรับใช้',
    deploying: 'กำลังปรับใช้...',
    deploySuccess: 'ปรับใช้โปรเจกต์สำเร็จ!',
    deployError: 'ข้อผิดพลาดในการปรับใช้:',
    guest: 'แขก',
    login: 'เข้าสู่ระบบ',
    enterFileName: 'ป้อนชื่อไฟล์',
    enterFolderName: 'ป้อนชื่อโฟลเดอร์:',
    enterNewFileName: 'ป้อนชื่อไฟล์ใหม่:',
    fileExists: 'ไฟล์ที่มีชื่อนี้มีอยู่แล้ว',
    confirmDeleteFile: 'คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้?',
    theme: 'ธีม',
    fontSize: 'ขนาดตัวอักษร',
    addCustomModel: 'เพิ่มโมเดลที่กำหนดเอง',
    downloadProject: 'ดาวน์โหลดโปรเจกต์',
    refresh: 'รีเฟรช'
};

// Tüm çevirileri içeren nesne
const UI_TRANSLATIONS = {
    tr: UI_TR,
    en: UI_EN,
    zh: UI_ZH,
    es: UI_ES,
    ar: UI_AR,
    hi: UI_HI,
    pt: UI_PT,
    ru: UI_RU,
    ja: UI_JA,
    de: UI_DE,
    fr: UI_FR,
    ko: UI_KO,
    it: UI_IT,
    vi: UI_VI,
    fa: UI_FA,
    pl: UI_PL,
    uk: UI_UK,
    ro: UI_RO,
    nl: UI_NL,
    th: UI_TH
};

// Eksik diller için varsayılan olarak İngilizce kullan
Object.keys(LANGUAGES).forEach(lang => {
    if (!UI_TRANSLATIONS[lang]) {
        UI_TRANSLATIONS[lang] = UI_TRANSLATIONS['en'];
    }
});

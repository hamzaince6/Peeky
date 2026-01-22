# 📱 Peeky - Eğitici Oyunlar

AI-destekli, yaş gruplarına özel eğitici mobil oyunlar ve zeka geliştirici aktiviteler sunan React Native uygulaması.

## 🎯 Proje Özellikleri

- ✅ **React Native + Expo** - iOS ve Android için native performans
- ✅ **Tablet Uyumlu** - Responsif tasarım tüm cihazlarda çalışır
- ✅ **AI Destekli İçerik** - Gemini AI ile dinamik soru üretimi
- ✅ **Supabase Backend** - Güvenli veri depolama ve real-time sync
- ✅ **Yaş Grupları** - 0-15 yaş arası 5 farklı grup için özelleştirilmiş içerik
- ✅ **Onboarding İyileştirilmiş** - Zorunlu login yok, direkt yaş seçimine başla
- ✅ **App Store Uyumlu** - Çocuk kategorisine uygun güvenlik ve gizlilik

## 📦 Yaş Grupları

| Grup | Yaş Aralığı | Özellikleri |
|------|-------------|-----------|
| **G1** | 0-3 yaş | Renk tanıma, temel şekiller, büyük butonlar |
| **G2** | 3-5 yaş | Sayılar, hayvanlar, temel sözcükler |
| **G3** | 5-8 yaş | Matematik, okuma, bilim temeleri |
| **G4** | 8-12 yaş | Zorlayıcı matematik, fen bilimleri, mantık |
| **G5** | 12-15 yaş | Karmaşık problemler, eleştirel düşünme |

## 🛠️ Teknik Stack

### Mobil
- **React Native** 18.x
- **Expo** 50.x
- **TypeScript** 5.x
- **React Navigation** 6.x
- **React Native Gesture Handler** (gestures)
- **Expo Linear Gradient** (animasyonlar)

### Backend
- **Supabase** (PostgreSQL, Auth, Storage)
- **Supabase Edge Functions** (Deno runtime)
- **Row Level Security (RLS)** policies

### AI & ML
- **Google Gemini API** (dinamik soru üretimi)
- **Server-side prompt kontrol** (güvenlik)
- **Content filtering** (yaş uygunluğu)

### Dev Tools
- **Expo CLI** (build & testing)
- **EAS Build** (iOS/Android build service)
- **TypeScript** (type safety)

## 📁 Proje Yapısı

```
peeky/
├── app/
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── AgeSelectionScreen.tsx          # Onboarding
│   │   ├── GameHubScreen.tsx
│   │   ├── QuestionGameScreen.tsx
│   │   ├── DrawingGameScreen.tsx           # (V2)
│   │   └── ProfileScreen.tsx               # (V2)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── game/
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── DrawingCanvas.tsx
│   │   │   └── ...
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── ...
│   ├── navigation/
│   │   └── RootNavigator.tsx               # Navigation stack
│   ├── services/
│   │   ├── supabaseService.ts              # DB & auth
│   │   └── aiService.ts                    # Gemini integration
│   ├── hooks/
│   │   ├── useResponsiveDimensions.ts      # Tablet support
│   │   └── useGameSession.ts
│   └── utils/
│       ├── ageGroups.ts                    # Age group configs
│       ├── themeContext.tsx                # UI theme
│       └── authContext.tsx                 # Auth state
├── supabase/
│   ├── functions/
│   │   └── generate-questions/
│   │       └── index.ts                    # Edge function
│   └── migrations/
│       └── 001_init_schema.sql             # DB schema
├── assets/
│   ├── images/
│   └── fonts/
├── App.tsx                                 # Root component
├── app.json                                # Expo config
├── package.json
├── tsconfig.json
├── .env.example                            # Environment variables
└── README.md
```

## 🚀 Başlangıç

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase hesabı
- Google Gemini API key

### 1. Repository'i klonla ve bağımlılıkları yükle

```bash
cd peeky
npm install
```

### 2. Supabase'i konfigüre et

1. [Supabase Console](https://supabase.com) açarak yeni bir project oluştur
2. SQL Editor'de `supabase/migrations/001_init_schema.sql` çalıştır
3. Supabase URL ve Anon Key'i kopyala

### 3. Gemini API'yi ayarla

1. [Google AI Studio](https://makersuite.google.com/app/apikey) açarak API key oluştur
2. Supabase Edge Function'a secret olarak ekle:

```bash
supabase secrets set GEMINI_API_KEY=your_key_here
```

### 4. Supabase secrets'ı konfigüre et

Supabase Dashboard → Project Settings → API Keys altında:

```bash
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
```

### 5. Edge Function'ı deploy et

```bash
supabase functions deploy generate-questions
```

### 6. Uygulamayı çalıştır

```bash
# iOS simulator
npm run ios

# Android emulator
npm run android

# Web
npm run web

# Expo app üzerinde
npm run start
```

## 🔐 Güvenlik

### Authentication Flow

1. **App başladığında** → Anonymous Supabase auth otomatik oluştur
2. **Zorunlu login yok** → Direkt AgeSelection ekranına git
3. **Profil oluştur** → Yaş grubu + nickname seç
4. **Opsiyonel parent** → Daha sonra ebeveyn email ekleyebilir

### Content Safety

- ✅ Promptlar sunucu-tarafında oluşturulur (client'tan manipüle edilemez)
- ✅ Gemini safety filters etkin
- ✅ Yaş grubu whitelist kontrol
- ✅ RLS policies tüm tabloları korur
- ✅ Veri minimizasyonu (sadece gerekli veriler tutulur)

## 📱 Tablet Support

`useResponsiveDimensions` hook otomatik olarak:

- Cihaz genişliğini tespit eder (≥600px = tablet)
- Grid layout'ları ayarlar (1-4 sütun)
- Font boyutlarını scale eder
- Padding'leri optimize eder

Örnek:

```tsx
const { isTablet, gridColumns, contentPadding } = useResponsiveDimensions();
```

## 🎨 Tema Sistemi

Her yaş grubu için özelleştirilmiş renk şeması:

```tsx
import { useTheme } from 'app/utils/themeContext';

const { theme, setAgeGroup } = useTheme();

// theme.colors.primary
// theme.colors.secondary
// theme.fontSize.title
// theme.fontSize.body
```

## 🔌 Supabase Edge Functions

### `/generate-questions`

Yaş grubu ve konu için dinamik soru üretir.

**Request:**
```json
{
  "age_group": "G3",
  "count": 5,
  "topic": "math"
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "text": "2 + 3 = ?",
      "options": ["4", "5", "6", "7"],
      "correct_index": 1,
      "topic": "math"
    }
  ]
}
```

## 📊 Database Schema

### `users` - Kullanıcı profilleri
```sql
id (UUID), age_group, nickname, parent_email, profile_image_url, created_at
```

### `game_sessions` - Oyun seçimleri
```sql
id, user_id, game_type, score, duration, correct_count, total_count, created_at
```

### `ai_questions_cache` - Soruların önbelleği
```sql
id, age_group, question (JSONB), used_count, created_at
```

### `drawings` - Çizim depoları
```sql
id, user_id, image_url, created_at
```

## 🎮 Oyun Türleri

### V1 (MVP)
- ❌ **Soru-Cevap** - Çoktan seçmeli sorular (kaplı)
- 🔄 Onboarding flow
- 🔄 Supabase auth & profil
- 🔄 Score tracking

### V2 (İkinci Sprint)
- 🚧 **Çizim Zamanı** - Canvas-tabanlı serbest çizim
- 🚧 **Hafıza Egzersizi** - Nesneleri hatırla
- 🚧 Profil & istatistikler
- 🚧 Rozet sistemi

### V3+ (Gelecek)
- Öğretmen modu
- Ebeveyn paneli
- Offline destek
- Subscription
- AI kişiselleştirme

## 🧪 Testing

```bash
# Type checking
npm run tsc

# Linting
npm run lint
```

## 📦 Build & Deploy

### EAS Build (iOS)

```bash
npm install -g eas-cli
eas build --platform ios --profile production
```

### EAS Build (Android)

```bash
eas build --platform android --profile production
```

### Supabase Functions Deploy

```bash
supabase functions deploy generate-questions
```

## 🔄 Environment Variables

`.env.local` oluştur:

```env
SUPABASE_URL=https://xyzw.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSy...
APP_ENV=production
```

Daha sonra `app.json`'a ekle:

```json
"extra": {
  "supabaseUrl": "$SUPABASE_URL",
  "supabaseAnonKey": "$SUPABASE_ANON_KEY"
}
```

## 📄 Lisans & Yasal

- ✅ **KVKK Uyumlu** (Kişisel Verileri Koruma Kanunu)
- ✅ **COPPA Uyumlu** (ABD - Çocuk Gizliliği)
- ✅ **Apple Kids Category** - App Store category
- ✅ **Google Play Family Library** - Family-friendly content

## 🤝 Katkıda Bulunma

Katkılar memnuniyetle karşılanır! Lütfen:

1. Branch oluştur (`git checkout -b feature/amazing-feature`)
2. Commit et (`git commit -m 'Add amazing feature'`)
3. Push et (`git push origin feature/amazing-feature`)
4. Pull Request aç

## 📞 Destek

Sorular veya sorunlar için [Issues](https://github.com/your-org/peeky/issues) açın.

## 📜 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

**Peeky** - Çocukların eğitici ve eğlenceli öğrenme yolculuğu! 🎮✨

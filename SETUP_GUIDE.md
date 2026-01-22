# 🚀 Peeky Setup Guide

Adım adım Peeky'yi kurma ve konfigürasyon rehberi.

## 1️⃣ Supabase Projesi Oluştur

### 1.1 Yeni Supabase Projesi

1. [supabase.com](https://supabase.com) açarak giriş yap
2. **+ New Project** tıkla
3. Proje bilgileri:
   - **Project name**: `peeky`
   - **Database password**: Güçlü bir şifre seç
   - **Region**: En yakın bölgeniz (örn: `eu-central-1`)
4. **Create new project** tıkla (2-3 dakika bekle)

### 1.2 API Keys'i Kopyala

Settings → API Keys'te:
- `SUPABASE_URL` → `Project URL`
- `SUPABASE_ANON_KEY` → `anon public` key
- `SUPABASE_SERVICE_ROLE_KEY` → `service_role` secret key (gizli tutulmalı)

### 1.3 Database Schema'sı Kurun

1. Supabase Dashboard açın
2. SQL Editor → New Query
3. [001_init_schema.sql](../supabase/migrations/001_init_schema.sql) dosyasını kopyala-yapıştır
4. ▶️ Run

```sql
-- Tüm tabloları ve policies'leri otomatik oluştur
```

### 1.4 Storage Bucket

Storage → Buckets → Create a new bucket:
- **Name**: `drawings`
- **Public bucket**: OFF (private)
- Create

## 2️⃣ Google Gemini API Anahtarı

### 2.1 API Anahtarını Al

1. [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) aç
2. **Create API Key** tıkla
3. Anahtarı kopyala

### 2.2 Supabase'e Secret Olarak Ekle

Terminal'de:

```bash
# Supabase CLI kurulumuş mu kontrol et
supabase --version

# Eğer yüklü değilse:
npm install -g supabase

# Supabase'e giriş yap
supabase login

# API key'i secret olarak ekle
supabase secrets set GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXX
```

## 3️⃣ Edge Function'ı Deploy Et

### 3.1 Supabase CLI Kurulumu

```bash
npm install -g supabase
supabase login
```

### 3.2 Proje'yi Link Et

Proje dizininde:

```bash
supabase link --project-ref your_project_ref
```

`your_project_ref`, Supabase Dashboard'dan:
- Settings → General → Project Reference ID

### 3.3 Function'ı Deploy Et

```bash
supabase functions deploy generate-questions
```

Başarılı çıktı:

```
✓ Function deployed successfully
Endpoint: https://your-ref.supabase.co/functions/v1/generate-questions
```

## 4️⃣ React Native Uygulamasını Konfigüre Et

### 4.1 Environment Variables

Proje dizininde `.env.local` oluştur:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXX
```

### 4.2 app.json'ı Güncelle

```json
"extra": {
  "supabaseUrl": "https://xxxxxxxx.supabase.co",
  "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4.3 Bağımlılıkları Yükle

```bash
npm install
```

## 5️⃣ Yerel Geliştirme

### 5.1 Expo Start

```bash
npm start
```

### 5.2 iOS Simulator

```bash
npm run ios
```

Gereksinimler:
- macOS
- Xcode
- iOS Simulator

### 5.3 Android Emulator

```bash
npm run android
```

Gereksinimler:
- Android Studio
- Android Emulator çalışır durumda

### 5.4 Web Preview

```bash
npm run web
```

## 6️⃣ Üretim İçin Build

### 6.1 EAS Account Oluştur

```bash
npm install -g eas-cli
eas login
```

### 6.2 app.json'da Project ID'yi Ayarla

```json
"extra": {
  "eas": {
    "projectId": "peeky-educational-games"
  }
}
```

### 6.3 Build Profile'ları Ayarla

```bash
eas build:configure
```

### 6.4 iOS Build (macOS gerekli)

```bash
eas build --platform ios --profile production
```

### 6.5 Android Build

```bash
eas build --platform android --profile production
```

## 7️⃣ App Store Yayını

### 7.1 Apple App Store

1. Apple Developer Program üyesi olmalısın
2. App Store Connect → My Apps
3. **+ New App** tıkla
4. Bundle ID: `com.peeky.educationalgames`
5. TestFlight'a EAS build yükle:

```bash
eas submit --platform ios --latest
```

### 7.2 Google Play Store

1. Google Play Developer hesabı oluştur
2. Google Play Console → Create app
3. Package name: `com.peeky.educationalgames`
4. EAS build'i yükle:

```bash
eas submit --platform android --latest
```

## 8️⃣ Özellik Kontrolleri

### ✅ Yapması Gereken Kontroller

- [ ] Uygulamayı başlat
- [ ] Splash screen göründü mü?
- [ ] Age Selection'a geçildi mi? (zorunlu login yok)
- [ ] Yaş grubu seçildi mi?
- [ ] GameHub açıldı mı?
- [ ] "Soru Cevap" oyununa giriş yapılabildi mi?
- [ ] Tablet ekranında 2 sütun göründü mü?
- [ ] Telefon ekranında 1 sütun göründü mü?

### 🧪 Test Case'ler

```typescript
// Age Selection
✓ Farklı yaş gruplarını seç
✓ Ad gir
✓ "Oyunlara Başla" tıkla

// Game Hub
✓ Farklı oyunlar görünür mü?
✓ "Çok Yakında" oyunları devre dışı mı?

// Question Game
✓ Soru yüklendi mi?
✓ Cevap seçebilir misin?
✓ Sonuç gösteriliyor mu?
✓ İlerleme çubuğu artıyor mu?
✓ Skoru artıyor mu?
```

## 🐛 Troubleshooting

### "Supabase URL boş" Hatası

**Çözüm:**
```json
// app.json'da ayarlandı mı?
"extra": {
  "supabaseUrl": "https://...",
  "supabaseAnonKey": "eyJ..."
}
```

### "Gemini API error" Hatası

**Çözüm:**
```bash
# Secret ayarlandı mı?
supabase secrets list

# Eğer yoksa ekle:
supabase secrets set GEMINI_API_KEY=your_key
```

### Authentication başarısız

**Çözüm:**
```bash
# RLS policies ayarlandı mı?
# Supabase Dashboard → SQL Editor:
SELECT * FROM users; -- Hata verirse RLS açık değil
```

### Edge Function 404 hatası

**Çözüm:**
```bash
# Function deploy edildikten sonra 1-2 dakika bekle
# Daha sonra test et:
curl https://your-ref.supabase.co/functions/v1/generate-questions
```

## 📞 İletişim

Sorunlar veya sorular için:
- GitHub Issues
- Email: support@peeky.app
- Discord: [Community Server]

---

**Peeky kurmayı tamamladın!** 🎉
Artık geliştirmeye başlayabilirsin!

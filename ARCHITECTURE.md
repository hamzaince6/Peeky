# 📋 Peeky Project Documentation

Genel proje mimarisi, tasarım kararları ve best practices.

## 🏗️ Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────┐
│                React Native App (Expo)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Navigation Stack (React Nav)             │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │        Screen Layer                     │   │  │
│  │  │  - AgeSelection (Onboarding)           │   │  │
│  │  │  - GameHub                             │   │  │
│  │  │  - QuestionGame                        │   │  │
│  │  │  - DrawingGame (V2)                    │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │        Context Providers                 │   │  │
│  │  │  - AuthContext (user, profile)          │   │  │
│  │  │  - ThemeContext (colors, fonts)         │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Services Layer                           │  │
│  │  ┌─────────────────┐  ┌─────────────────────┐   │  │
│  │  │ supabaseService │  │   aiService         │   │  │
│  │  │ - auth          │  │ - generateQuestions │   │  │
│  │  │ - profiles      │  │ - getCached         │   │  │
│  │  │ - sessions      │  │ - withFallback      │   │  │
│  │  └─────────────────┘  └─────────────────────┘   │  │
│  │                                                  │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │      Custom Hooks                        │   │  │
│  │  │  - useResponsiveDimensions (tablet)     │   │  │
│  │  │  - useTheme                             │   │  │
│  │  │  - useAuth                              │   │  │
│  │  │  - useGameSession                       │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Backend: Supabase                           │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │  PostgreSQL Database                     │   │  │
│  │  │  - users, game_sessions                  │   │  │
│  │  │  - ai_questions_cache, drawings          │   │  │
│  │  │  - RLS Policies                          │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │  Edge Functions (Deno)                   │   │  │
│  │  │  - generate-questions                    │   │  │
│  │  │    ├→ Gemini AI API                      │   │  │
│  │  │    ├→ Prompt validation                  │   │  │
│  │  │    └→ Content filtering                  │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │  Storage                                 │   │  │
│  │  │  - drawings bucket (user uploads)        │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │  Auth (JWT)                              │   │  │
│  │  │  - Anonymous sessions                    │   │  │
│  │  │  - Optional parent signup (V2)           │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
App Launch
    ↓
[SplashScreen] (2-3 sec loading)
    ↓
Check Current User
    ├─ User exists?
    │   ├─ YES → Check Profile
    │   │         ├─ Profile exists? YES → [GameHub] ✓
    │   │         └─ Profile exists? NO → [AgeSelection]
    │   │
    │   └─ NO → Create Anonymous Session
    │           └─ [AgeSelection]
    │
[AgeSelection]
    ├─ User selects age group
    ├─ Enter nickname
    └─ Create profile in users table
         ↓
    [GameHub] ✓
```

## 🎨 Styling & Theme

### Color System (By Age Group)

```typescript
// G1 (0-3) - Pink/Warm
primary: '#FFB6C1' (light pink)
secondary: '#FFC0CB' (pink)
accent: '#FF69B4' (hot pink)

// G2 (3-5) - Blue/Cool
primary: '#87CEEB' (sky blue)
secondary: '#87CEFA' (light sky blue)
accent: '#4169E1' (royal blue)

// G3 (5-8) - Yellow/Warm
primary: '#FFD700' (gold)
secondary: '#FFA500' (orange)
accent: '#FF8C00' (dark orange)

// G4 (8-12) - Green/Natural
primary: '#98FB98' (pale green)
secondary: '#00FA9A' (medium spring green)
accent: '#00B050' (green)

// G5 (12-15) - Purple/Sophisticated
primary: '#DDA0DD' (plum)
secondary: '#DA70D6' (orchid)
accent: '#8B00FF' (violet)
```

### Typography System

Font sizes otomatik olarak yaş grubuna göre ayarlanır:

```typescript
// Her yaş grubu için
fontSize: {
  title: 32,   // G1 (0-3)
  title: 22,   // G5 (12-15)
  body: 20,    // G1
  body: 14,    // G5
  button: 24,  // G1
  button: 16,  // G5
}

// Tablet scale: 1.2x
```

## 📱 Responsive Design

### Breakpoints

```typescript
PHONE:  width < 600px
TABLET: width ≥ 600px

// Orientations
PORTRAIT:  height > width
LANDSCAPE: width > height
```

### Grid System

```typescript
PHONE (1 column):
┌─────────────┐
│   Game 1    │
├─────────────┤
│   Game 2    │
├─────────────┤
│   Game 3    │
└─────────────┘

TABLET (2 columns - portrait):
┌─────────┬─────────┐
│ Game 1  │ Game 2  │
├─────────┼─────────┤
│ Game 3  │ Game 4  │
└─────────┴─────────┘

TABLET (4 columns - landscape):
┌─────┬─────┬─────┬─────┐
│ G1  │ G2  │ G3  │ G4  │
└─────┴─────┴─────┴─────┘
```

## 🎮 Game Flow

### Question Game Flow

```
[QuestionGame]
    ├─ Load questions from AI (with cache fallback)
    ├─ Display question + 4 options
    ├─ User selects answer
    ├─ Show result (1.5 sec)
    ├─ Auto-advance to next question
    ├─ Repeat for all questions
    └─ [ResultScreen]
         ├─ Show score, percentage
         ├─ "Tekrar Oyna" button
         └─ "Geri Dön" button
```

### Game Session Data Model

```typescript
{
  id: UUID,
  user_id: UUID,
  game_type: 'questions',
  age_group: 'G3',
  score: 4,
  duration: 120, // seconds
  correct_count: 4,
  total_count: 5,
  created_at: ISO8601
}
```

## 🚀 Performance Optimization

### Caching Strategy

1. **AI Questions Cache**
   - Questions cached in `ai_questions_cache` table
   - Sorted by `used_count` (less used first)
   - Fallback to fresh generation if needed

2. **Component Optimization**
   - `React.memo()` for UI components
   - `useCallback()` for event handlers
   - `useMemo()` for computed values

3. **Data Fetching**
   - Lazy load game data
   - Paginate if needed
   - Local SQLite for future offline support

### Bundle Size

- Tree-shaking enabled
- Expo manages native modules
- Async component imports for screens

## 📊 Data Models

### User Profile
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  age_group TEXT, -- G1-G5
  nickname TEXT,
  age INTEGER,
  parent_email TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP
);
```

### Game Session
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  game_type TEXT,
  score INTEGER,
  duration INTEGER,
  correct_count INTEGER,
  total_count INTEGER,
  created_at TIMESTAMP
);
```

### AI Questions Cache
```sql
CREATE TABLE ai_questions_cache (
  id UUID PRIMARY KEY,
  age_group TEXT,
  question JSONB,
  used_count INTEGER,
  created_at TIMESTAMP
);

-- question structure:
{
  "text": "Soru?",
  "options": ["A", "B", "C", "D"],
  "correct_index": 1,
  "topic": "math"
}
```

## 🔒 Security

### Authentication
- Anonymous JWT for children
- Optional parent email (V2)
- No passwords for children

### Authorization (RLS)
- Users can only view/modify their own data
- Public read-only access to questions cache
- Admin access via service role key

### Content Safety
- Server-side prompt generation (no client control)
- Gemini API safety filters
- Topic whitelist per age group
- No external links in questions

### Data Privacy
- KVKK compliant (Turkish GDPR)
- COPPA compliant (US Children's Act)
- Minimal data collection
- Parental consent (V2)

## 🧪 Testing Strategy

### Unit Tests
```typescript
// For utilities and services
test('getAgeGroupByAge returns correct group', () => {
  expect(getAgeGroupByAge(2)).toBe('G1');
  expect(getAgeGroupByAge(7)).toBe('G3');
});
```

### Integration Tests
```typescript
// For flows
test('Age selection creates user profile', async () => {
  // 1. Select age group
  // 2. Enter nickname
  // 3. Verify profile in DB
});
```

### E2E Tests
```typescript
// Full user journey
test('User can play complete game', async () => {
  // 1. Launch app
  // 2. Select age group
  // 3. Play game
  // 4. See score
});
```

## 📈 Analytics Events (Future)

```typescript
// To track in future versions
'app_launch'
'age_selected'
'game_started' { game_type, age_group }
'answer_submitted' { correct: boolean }
'game_completed' { score, duration }
'drawing_saved'
```

## 🚢 Deployment Process

### Development
```bash
npm start
npm run ios / android / web
```

### Staging (EAS Preview)
```bash
eas build --platform ios --profile preview
```

### Production (App Stores)
```bash
# iOS
eas build --platform ios --profile production
eas submit --platform ios

# Android
eas build --platform android --profile production
eas submit --platform android
```

### Edge Functions
```bash
supabase functions deploy generate-questions
```

## 📝 Coding Standards

### File Naming
- Components: `PascalCase.tsx`
- Utils: `camelCase.ts`
- Screens: `PascalCaseScreen.tsx`

### Component Structure
```typescript
// 1. Imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Type definitions
interface Props {
  // ...
}

// 3. Component
const MyComponent = ({ prop }: Props) => {
  // Logic
  return (
    // JSX
  );
};

// 4. Styles
const styles = StyleSheet.create({
  // ...
});

// 5. Export
export default MyComponent;
```

### Naming Conventions
- Booleans: `isActive`, `hasError`, `canSubmit`
- Handlers: `handleClick`, `onPress`, `onChange`
- Async: `fetchData`, `createUser`, `updateProfile`

## 🐛 Debugging

### Console Logs
```typescript
// App startup
console.log('🚀 App started');
console.log('👤 User ID:', userId);
console.log('🎨 Theme:', theme.colors);

// Errors
console.error('❌ Error:', error);
```

### Network Inspector
- Supabase requests in console
- Function logs in Supabase Dashboard

### React DevTools
```bash
npm install -g react-devtools
react-devtools
```

## 🔮 Future Roadmap

### V2 (Next Sprint)
- [ ] Çizim oyunu
- [ ] Hafıza egzersizi
- [ ] Profil & istatistikler
- [ ] Rozet sistemi

### V3 (Season 2)
- [ ] Ebeveyn paneli
- [ ] Öğretmen modu
- [ ] Offline destek
- [ ] Subscription model

### V4+ (Horizon)
- [ ] AI kişiselleştirme
- [ ] Social features
- [ ] Web platform
- [ ] Accessibility (screen reader)

---

**Last Updated**: January 2026
**Maintained By**: Peeky Team

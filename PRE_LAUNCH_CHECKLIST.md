# 🎯 Peeky Pre-Launch Checklist

Use this checklist to ensure everything is ready before launching Peeky.

## ✅ Development Environment Setup

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] All dependencies installed (`npm install`)
- [ ] TypeScript compiles (`npm run tsc --noEmit`)
- [ ] No lint errors (`npm run lint` - if configured)

## ✅ Backend Configuration

### Supabase
- [ ] Supabase project created
- [ ] Database schema migrated (001_init_schema.sql)
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket "drawings" created
- [ ] JWT secret configured
- [ ] Anon key obtained: `SUPABASE_ANON_KEY`
- [ ] Service role key obtained: `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Project URL obtained: `SUPABASE_URL`

### Gemini AI
- [ ] Google Cloud project created
- [ ] Gemini API key generated: `GEMINI_API_KEY`
- [ ] API key added to Supabase secrets
- [ ] API quota verified (check Google Cloud console)

### Supabase Edge Functions
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Logged in to Supabase (`supabase login`)
- [ ] Project linked (`supabase link --project-ref your_ref`)
- [ ] Edge Function deployed (`supabase functions deploy generate-questions`)
- [ ] Function endpoint verified (Supabase Dashboard)

## ✅ Application Configuration

- [ ] `.env.local` file created with all keys
- [ ] All env variables populated:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `GEMINI_API_KEY`
- [ ] `app.json` configured:
  - [ ] `version` incremented if needed
  - [ ] `ios.supportsTablet` set to `true`
  - [ ] `android` permissions configured
  - [ ] Bundle IDs set (`com.peeky.educationalgames`)
- [ ] `babel.config.js` configured with aliases

## ✅ Code Quality

- [ ] TypeScript has no errors (`npx tsc --noEmit`)
- [ ] All imports are correct
- [ ] No console.error in production code
- [ ] Components are properly typed
- [ ] Navigation types are correct

## ✅ Feature Verification

### Authentication
- [ ] App launches without login screen
- [ ] Age selection screen shows first
- [ ] User can select age group
- [ ] User can enter nickname
- [ ] Profile is created in Supabase
- [ ] Subsequent launches go to GameHub

### UI/UX
- [ ] SplashScreen displays correctly
- [ ] AgeSelection responsive on phone/tablet
- [ ] GameHub shows 4 game cards
- [ ] Colors match age group theme
- [ ] Fonts are age-appropriate sizes
- [ ] Buttons are large enough for touch

### Gameplay
- [ ] Question Game loads questions
- [ ] Sample questions display correctly
- [ ] Answer options clickable
- [ ] Score increments on correct answer
- [ ] Result shown after answer
- [ ] Auto-advances to next question
- [ ] Final score screen shows correctly
- [ ] "Tekrar Oyna" button works
- [ ] "Geri Dön" button goes back to GameHub

### Responsiveness
- [ ] Phone layout (1 column): Verified
- [ ] Tablet portrait (2 columns): Verified
- [ ] Tablet landscape (4 columns): Verified
- [ ] Fonts scale appropriately
- [ ] Touch targets are 48x48px minimum
- [ ] No text overflow

### Performance
- [ ] App starts in < 5 seconds
- [ ] Navigation transitions smooth
- [ ] No memory leaks on repeated navigation
- [ ] Images are optimized
- [ ] API calls timeout properly

## ✅ Security & Compliance

- [ ] No hardcoded API keys in code
- [ ] All secrets in environment variables
- [ ] RLS policies prevent unauthorized access
- [ ] Content filtering configured
- [ ] Age-appropriate topic whitelist set
- [ ] No external links in questions
- [ ] KVKK compliance verified
- [ ] COPPA compliance checked
- [ ] Privacy policy drafted (optional for V1)

## ✅ Data & Database

- [ ] `users` table has proper schema
- [ ] `game_sessions` table ready
- [ ] `ai_questions_cache` table ready
- [ ] `drawings` table ready
- [ ] Storage bucket configured
- [ ] Indexes created for performance
- [ ] Constraints configured
- [ ] Migrations tested in staging

## ✅ Testing

### Manual Testing
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested on web browser
- [ ] Tested landscape mode
- [ ] Tested with slow network
- [ ] Tested offline scenarios

### Age Group Testing
- [ ] G1 (0-3) theme and fonts
- [ ] G2 (3-5) theme and fonts
- [ ] G3 (5-8) theme and fonts
- [ ] G4 (8-12) theme and fonts
- [ ] G5 (12-15) theme and fonts

### Error Scenarios
- [ ] Network error handled
- [ ] Invalid API response handled
- [ ] Timeout handled gracefully
- [ ] Empty data handled
- [ ] Duplicate actions prevented

## ✅ Documentation

- [ ] README.md complete
- [ ] SETUP_GUIDE.md comprehensive
- [ ] ARCHITECTURE.md detailed
- [ ] Code comments present
- [ ] API documentation ready
- [ ] Deployment guide written

## ✅ Build & Deployment

### iOS
- [ ] Bundle identifier correct: `com.peeky.educationalgames`
- [ ] App version set
- [ ] Build number incremented
- [ ] Icons prepared (1024x1024)
- [ ] Splash screen prepared
- [ ] Privacy policy link set
- [ ] App Store category: "Education" or "Kids"

### Android
- [ ] Package name correct: `com.peeky.educationalgames`
- [ ] App version set
- [ ] Version code incremented
- [ ] Icons prepared (192x192 minimum)
- [ ] Permissions configured
- [ ] Content rating set
- [ ] Google Play category: "Education"

## ✅ Pre-Launch Cleanup

- [ ] Remove debug logging
- [ ] Remove test data from database
- [ ] Check for TODO comments
- [ ] Remove unused imports
- [ ] Optimize bundle size
- [ ] Clean up node_modules
- [ ] Update version number

## ✅ Launch Preparation

- [ ] Marketing assets prepared
- [ ] Privacy policy finalized
- [ ] Terms of service drafted
- [ ] Support email setup
- [ ] Analytics configured (optional)
- [ ] Error tracking setup (optional)
- [ ] Crash reporting enabled (optional)

## 📋 Sign-Off

| Role | Name | Date | Sign |
|------|------|------|------|
| Developer | ________ | ________ | ________ |
| QA | ________ | ________ | ________ |
| Product Manager | ________ | ________ | ________ |

## 🚀 Launch!

Once all checkboxes are complete, you're ready to:

1. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

2. **Submit to Google Play**
   ```bash
   eas submit --platform android
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy generate-questions
   ```

4. **Monitor After Launch**
   - Check error logs
   - Monitor user feedback
   - Track performance metrics
   - Prepare patch if needed

---

**Created**: January 2026
**Updated**: As needed
**Status**: Ready for Review

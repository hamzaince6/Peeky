# 🎮 Peeky - Start Here 👇

Welcome to **Peeky**, an AI-powered educational game for children aged 0-15!

This file guides you through understanding and using this project.

---

## 📚 Documentation Index

Read these in order based on your role:

### 👨‍💻 **For Developers** (Start Here!)
1. **[README.md](README.md)** ⭐ - Project overview & features
2. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Step-by-step setup
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical deep-dive
4. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - File structure & stats

### 🎯 **For Project Managers**
1. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Stats & roadmap
2. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What's built
3. **[PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md)** - Launch prep

### 🧪 **For QA/Testers**
1. **[PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md)** - Test checklist
2. **[ARCHITECTURE.md](ARCHITECTURE.md#-testing-strategy)** - Testing strategy

### 🚀 **For DevOps/Deployment**
1. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Infrastructure setup
2. **[README.md](README.md#-build--deploy)** - Build & deploy

---

## ⚡ Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (Windows)
.\quickstart.bat

# OR (Mac/Linux)
bash quickstart.sh

# 3. Start the app
npm start

# 4. Run on device/simulator
npm run ios        # iOS
npm run android    # Android
npm run web        # Browser
```

---

## 🎯 Project at a Glance

```
📦 Peeky (v1.0.0)
├── ✅ React Native + Expo
├── ✅ 5 Age Groups (0-15 years)
├── ✅ AI-Powered Questions (Gemini)
├── ✅ Responsive Design (Phone & Tablet)
├── ✅ Supabase Backend
├── ✅ No Forced Login (Onboarding first)
└── ✅ App Store Ready
```

---

## 📁 Key Folders

| Folder | Purpose |
|--------|---------|
| `app/screens/` | App pages (Age Selection, GameHub, etc) |
| `app/components/` | Reusable UI components |
| `app/services/` | Backend API integration |
| `app/utils/` | Utilities (theme, auth context) |
| `supabase/` | Backend configuration & migrations |
| `assets/` | Images, fonts, icons |

---

## 🔑 Key Technologies

- **Frontend**: React Native, Expo, TypeScript
- **Navigation**: React Navigation
- **Backend**: Supabase (PostgreSQL, Auth)
- **AI**: Google Gemini API
- **Styling**: React Native StyleSheet
- **State Management**: React Context

---

## 📱 App Flow

```
App Launch
    ↓
Splash Screen (loading)
    ↓
Age Selection (NO LOGIN!) 👈 First screen
    ↓
Enter Nickname & Select Age Group
    ↓
Game Hub (4 games)
    ↓
Select Game → Play → Score
```

---

## ✨ Main Features Implemented

- ✅ **Anonymous Authentication** - No passwords for kids
- ✅ **Age Selection** - Customized UX per age group
- ✅ **Color-Coded Themes** - G1-G5 have unique colors
- ✅ **Responsive UI** - Auto-adapts to tablets
- ✅ **Question Game** - Full gameplay with scoring
- ✅ **Supabase Integration** - Real database
- ✅ **Gemini AI Setup** - Ready for question generation
- ✅ **TypeScript** - Full type safety

---

## 🚀 Next Steps

### If You're Setting Up the First Time:
1. Read [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Create Supabase account
3. Get Gemini API key
4. Run `npm install` & `npm start`

### If You're Continuing Development:
1. Check [ARCHITECTURE.md](ARCHITECTURE.md)
2. Open `app/screens/` to see components
3. Modify what you need
4. Test on device/emulator

### If You're Deploying:
1. Review [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md)
2. Run `eas build --platform ios`
3. Run `eas build --platform android`
4. Submit to App Store

---

## 🎓 Learning the Codebase

### Most Important Files to Read First:

1. **[App.tsx](App.tsx)** - Entry point (20 lines)
2. **[app/navigation/RootNavigator.tsx](app/navigation/RootNavigator.tsx)** - Navigation flow (65 lines)
3. **[app/screens/AgeSelectionScreen.tsx](app/screens/AgeSelectionScreen.tsx)** - Complex component (190 lines)
4. **[app/services/supabaseService.ts](app/services/supabaseService.ts)** - Backend calls (150 lines)
5. **[app/utils/themeContext.tsx](app/utils/themeContext.tsx)** - State management (40 lines)

### File Size Guide:
- Simple screens: 100-150 lines
- Complex screens: 200-300 lines
- Services: 100-200 lines
- Utils: 30-100 lines

---

## 🐛 Common Issues & Solutions

### "SUPABASE_URL is empty"
**Solution**: Check `.env.local` file - all keys must be filled

### "Gemini API error"
**Solution**: API key must be set in Supabase secrets

### "TypeScript errors"
**Solution**: Run `npm install` and restart IDE

### "App won't start"
**Solution**: Check `npm list` - all packages installed?

---

## 📞 Need Help?

| Topic | Resource |
|-------|----------|
| React Native | https://reactnative.dev |
| Expo | https://docs.expo.dev |
| Supabase | https://supabase.com/docs |
| Gemini AI | https://ai.google.dev |
| TypeScript | https://www.typescriptlang.org |

---

## ✅ Pre-Development Checklist

Before you start coding:

- [ ] Read README.md
- [ ] Run `npm install`
- [ ] Create `.env.local` file
- [ ] Run `npm start`
- [ ] See app launch successfully
- [ ] Review ARCHITECTURE.md

---

## 🎯 Development Tips

1. **Use TypeScript** - Strict mode catches errors early
2. **Test Responsive** - Check both phone and tablet views
3. **Follow Structure** - Keep components, services, utils separate
4. **Use Theme** - Always use theme colors, not hardcoded colors
5. **Document Complex Logic** - Add comments for non-obvious code
6. **Test Navigation** - Make sure back buttons work correctly

---

## 📦 Project Statistics

```
Total Lines of Code: 3,500+
TypeScript Files: 15
React Screens: 5
Components: 6
Database Tables: 4
API Endpoints: 3+
Documentation Pages: 6
Age Groups: 5
Languages Supported: Turkish (Türkçe)
```

---

## 🚀 Ready to Code?

```bash
# 1. Start development server
npm start

# 2. Open a screen file
code app/screens/GameHubScreen.tsx

# 3. Make a change
# 4. See it reload instantly!

# 5. When done, commit
git add .
git commit -m "feat: add awesome feature"
git push
```

---

## 📋 File Checklist

Essential files you should know:

- [ ] `App.tsx` - Main entry point
- [ ] `app.json` - Expo configuration
- [ ] `tsconfig.json` - TypeScript settings
- [ ] `package.json` - Dependencies
- [ ] `app/navigation/RootNavigator.tsx` - App navigation
- [ ] `app/utils/themeContext.tsx` - Theme system
- [ ] `app/utils/authContext.tsx` - Authentication
- [ ] `app/services/supabaseService.ts` - Backend
- [ ] `supabase/migrations/001_init_schema.sql` - Database

---

## 💡 Pro Tips

1. **Hot Reload** - Changes reload instantly in Expo
2. **TypeScript** - All files are `.ts` or `.tsx` for safety
3. **Theme Colors** - Always use `useTheme()` hook
4. **Responsive** - Use `useResponsiveDimensions()` for tablets
5. **Authentication** - Use `useAuth()` for user data
6. **Navigation** - Check `RootNavigator.tsx` for all routes

---

## 🎓 Learn by Doing

### Exercise 1: Change a Color
1. Open `app/utils/ageGroups.ts`
2. Find `G3` colors
3. Change primary color to `#FF00FF`
4. See it change instantly!

### Exercise 2: Add a New Button
1. Open `app/screens/GameHubScreen.tsx`
2. Add a new button at the bottom
3. Use `<PrimaryButton label="..." />`
4. See it render!

### Exercise 3: Create a New Screen
1. Create `app/screens/NewScreen.tsx`
2. Copy structure from `GameHubScreen.tsx`
3. Add to `RootNavigator.tsx`
4. Test navigation!

---

## 🏁 Launch Readiness

This project is ready for:

✅ Development & Testing
✅ Supabase Integration
✅ Gemini API Connection
✅ App Store Submission
✅ User Testing
✅ Beta Release

---

## 📞 Questions?

Check these first:
1. [README.md](README.md) - Features & overview
2. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Setup instructions
3. [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details

Can't find the answer? Create an issue on GitHub!

---

## 🎉 Welcome Aboard!

You're now part of the **Peeky** team! 

This app will help millions of children learn while having fun. Enjoy building! 🚀

---

**Last Updated**: January 22, 2026
**Version**: 1.0.0
**Status**: Ready for Development ✨

**Happy Coding!** 👨‍💻👩‍💻

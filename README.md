# 🌊 FlowTrix — Focus Better. Track Smarter. Achieve More.

<div align="center">

**A modern productivity & session-tracking mobile app built with React Native (Expo)**

FlowTrix helps users stay focused, build consistency, track categories, set goals, earn achievements, and visualize progress — all wrapped in a clean, minimal, and elegant UI.

<img src="https://github.com/z-Pearlina/Trackora-app/blob/main/assets/mockup.png" width="800" />

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000000?style=for-the-badge&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green?style=for-the-badge)](https://github.com/z-Pearlina/FlowTrix)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

[Features](#-features) • [Tech Stack](#️-tech-stack) • [Getting Started](#-getting-started) • [Screenshots](#-screenshots) • [License](#-license)

</div>

---

## 🚀 Features

### 🎯 **Smart Session Tracking**
- ⏱️ Start, pause, resume, and complete sessions effortlessly
- 🏷️ Choose or change categories during an active session
- 📝 Add titles & notes before, during, or after sessions
- 🔄 Track long-work sessions & maintain consistent flow
- ✏️ Full editing capabilities for all session details

### 🏁 **Goal-Oriented Productivity**
- 🎯 Create custom goals with target duration (hours + minutes)
- 📊 Track goal progress in real-time with visual indicators
- 📈 Automatically calculate completion percentage
- 🔄 Resume unfinished goals anytime
- ✅ Partial progress is always counted and saved
- 📅 Set daily, weekly, monthly, or custom timeframes

### 🏆 **Achievement System**
- 🎖️ Unlock achievements only when truly earned
- 📊 Covers sessions, streaks, hours, goals, categories, and more
- ✨ Polished, accurate logic for achievement awarding
- 🔔 Get notified instantly when you unlock new badges
- 🏅 Track your progress across multiple achievement tiers

### 📊 **Detailed Statistics**
- 📜 Complete session history with filtering
- ⏰ Total hours tracked across all categories
- 🎨 Category diversity and breakdown charts
- 🔥 Streak insights to maintain consistency
- 📈 Beautiful Victory Native charts
- 📅 Calendar view of all tracked sessions
- 🎯 Clean, modern analytics UI

### 🔔 **Custom Notifications**
- ⏰ Daily productivity reminders at your preferred time
- ✅ Session completion alerts
- 🏆 Achievement unlock notifications
- 🎯 Goal progress and completion alerts
- ⚙️ Fully customizable preferences
- 💾 Notification history stored locally for quick access

### ⚙️ **Modern Settings Panel**
- 🎨 Clean & minimal UI matching the app's aesthetic
- 🔧 Custom preferences for notifications and features
- 🎯 Dashboard customization (show/hide categories)
- 📦 Export all data as JSON
- 🌙 Dark theme with cyan/teal palette
- ✨ Smooth and intuitive behavior

### 🎨 **Beautiful UI/UX**
- 💎 Modern glassmorphism design
- 🌊 Cyan/teal gradient color scheme
- ✨ Smooth animations with React Native Reanimated
- 👆 Swipeable cards for intuitive actions
- 🎭 Consistent design system throughout
- 📱 Optimized for mobile experience

---

## 🛠️ Tech Stack

### **Core**
- **[React Native](https://reactnative.dev/)** `0.81.5` - Cross-platform mobile framework
- **[Expo](https://expo.dev/)** `~54.0` - Development platform & build tools
- **[TypeScript](https://www.typescriptlang.org/)** `~5.9.2` - Type-safe JavaScript
- **[React](https://react.dev/)** `19.1.0` - Component-based UI library

### **Navigation**
- **[React Navigation](https://reactnavigation.org/)** `^7.1.19` - Routing and navigation
  - Stack Navigator for screens
  - Bottom Tabs for main navigation
  - Custom transitions and gestures

### **State Management & Storage**
- **[Zustand](https://github.com/pmndrs/zustand)** `^5.0.8` - Lightweight global state management
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** `2.2.0` - Persistent local storage
- Zero dependencies, fast performance
- Simple and scalable architecture

### **UI Components & Styling**
- **[Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** `~15.0.7` - Beautiful gradient effects
- **[Expo Blur](https://docs.expo.dev/versions/latest/sdk/blur-view/)** `~15.0.7` - Glassmorphism blur effects
- **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)** `~4.1.1` - 60fps smooth animations
- **[React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)** `~2.28.0` - Touch interactions & swipes
- **[React Native SVG](https://github.com/software-mansion/react-native-svg)** `15.12.1` - Scalable vector graphics

### **Charts & Data Visualization**
- **[Victory Native](https://commerce.nearform.com/open-source/victory/)** `^41.20.2` - Beautiful, customizable charts
- **[React Native Calendars](https://github.com/wix/react-native-calendars)** `^1.1313.0` - Calendar views

### **Utilities & Services**
- **[date-fns](https://date-fns.org/)** `^4.1.0` - Modern date manipulation
- **[Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)** `~0.32.12` - Local & push notifications
- **[Expo File System](https://docs.expo.dev/versions/latest/sdk/filesystem/)** `~19.0.17` - File operations & data export
- **[Expo Fonts](https://docs.expo.dev/versions/latest/sdk/font/)** `~14.0.9` - Custom typography (Outfit font family)

### **Development & Testing**
- **[Jest](https://jestjs.io/)** `^29.7.0` - Testing framework
- **[TypeScript ESLint](https://typescript-eslint.io/)** - Code quality
- **[EAS Build](https://docs.expo.dev/build/introduction/)** - Cloud builds for iOS & Android

---

## 🚀 Getting Started

### **Prerequisites**

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (Mac only) or **Android Emulator**

### **Installation**

```bash
# Clone the repository
git clone https://github.com/your-username/FlowTrix.git

# Navigate to project directory
cd FlowTrix

# Install dependencies
npm install

# Start the development server
expo start
```

### **Running the App**

```bash
# Run on iOS (Mac only)
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

### **Building for Production**

```bash
# Build Android APK
eas build --platform android --profile preview

# Build iOS
eas build --platform ios --profile production
```

---

## 📱 Screenshots

<div align="center">

> Add your app screenshots here

<img src="./screenshots/home.png" width="200" />
<img src="./screenshots/session.png" width="200" />
<img src="./screenshots/stats.png" width="200" />
<img src="./screenshots/goals.png" width="200" />

</div>

---

## 📂 Project Structure

```
FlowTrix/
├── assets/                  # Images, fonts, and static files
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── GlassCard.tsx
│   │   ├── SwipeableSessionCard.tsx
│   │   └── CustomHeader.tsx
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── StartSessionScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   ├── GoalsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── stores/              # Zustand state stores
│   │   ├── useSessionStore.ts
│   │   ├── useGoalStore.ts
│   │   └── useAchievementStore.ts
│   ├── services/            # Business logic & utilities
│   │   ├── NotificationService.ts
│   │   ├── StorageService.ts
│   │   └── AchievementService.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useTimer.ts
│   │   └── usePaginatedSessions.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── theme/               # Design system
│   │   └── theme.ts
│   └── utils/               # Helper functions
│       └── typography.ts
├── app.json                 # Expo configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

---

## 🎨 Design System

### **Color Palette**

```typescript
// Primary Colors
Cyan:  #67E8F9  // Highlights, active states
Aqua:  #38BDF8  // Primary actions, buttons
Mint:  #34D399  // Success, achievements
Teal:  #14B8A6  // Accent color

// Background Gradient
Deep:   #08171c  // Main background
Medium: #0d1f26  // Card backgrounds
Light:  #1e313b  // Elevated surfaces

// Glassmorphism
Background: rgba(30, 49, 59, 0.4)
Border:     rgba(107, 255, 235, 0.1)
```

### **Typography**
- **Font Family:** [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts)
- **Weights:** 100-900 (Thin to Black)
- **Style:** Modern, geometric, highly legible

### **UI Patterns**
- 💎 Glassmorphism with blur effects
- ✨ Spring animations for natural feel
- 👆 Swipeable cards with action buttons
- 🌊 Cyan/teal gradient accents
- 📐 8px spacing system for consistency

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 🔐 Permissions

### **Android**
- `POST_NOTIFICATIONS` - Send local notifications
- `VIBRATE` - Haptic feedback
- `RECEIVE_BOOT_COMPLETED` - Restore scheduled notifications after reboot
- `SCHEDULE_EXACT_ALARM` - Precise notification timing
- `USE_EXACT_ALARM` - Exact alarm scheduling for reminders

### **iOS**
- **Notifications** - Goal reminders and achievement alerts
- **Background Modes** - Remote notification support

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your Profile](https://linkedin.com/in/your-profile)

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - Amazing React Native development platform
- [React Navigation](https://reactnavigation.org/) - Powerful navigation library
- [Zustand](https://github.com/pmndrs/zustand) - Simple and fast state management
- [Victory Native](https://commerce.nearform.com/open-source/victory/) - Beautiful data visualization
- Design inspired by modern productivity and wellness apps

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/your-username/flowtrix?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/flowtrix?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/flowtrix)
![GitHub license](https://img.shields.io/github/license/your-username/flowtrix)

---

<div align="center">

**Made with ❤️ using React Native and Expo**

⭐ Star this repo if you found it helpful!

[⬆ Back to top](#-flowtrix--focus-better-track-smarter-achieve-more)

</div>

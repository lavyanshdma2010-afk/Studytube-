# StudyTube - Distraction-Free Educational YouTube Application

StudyTube is an educational platform that enables students to watch only verified educational YouTube videos while blocking entertainment, gaming, shorts, and distractions.

## Core Features
1. **Educational YouTube Search**:
   - Filtered results for NCERT, CBSE, UPSC, JEE, NEET, Mathematics, Science, History, Geography, Economics, Political Science, English, and Programming.
2. **Blocked Keyword Safety**:
   - Blocks non-educational searches (e.g. Minecraft, GTA, Fortnite, Roblox, PUBG, Music, Movies, Memes, Reels, Shorts, Vlogs) with instant feedback: *"This search is blocked. Please search educational content only."*
3. **Distraction-Free Video Player**:
   - YouTube iframe embed with `controls=1&rel=0&modestbranding=1`.
   - **No comments, no recommendations, no Shorts, no related videos, no live chat.**
   - Timestamped study notes drawer for taking notes during lessons.
4. **40-Minute Pomodoro Study Timer**:
   - 40 minute study timer / 5 minute break timer with custom duration option.
   - Web Audio completion chime and study session logging.
5. **Learning Statistics & Heatmap**:
   - Daily streak counter.
   - Weekly study minutes SVG bar chart.
   - Monthly study hours summary & subject breakdown.
   - Calendar activity heatmap.
6. **Focus Shield Mode**:
   - Fullscreen distraction lock with motivational quotes, pause/resume, and rain/white-noise ambient sound synth.

## Running the Web App (Vite + Express)

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Native Android Project Structure (`/android`)

This repository also includes the complete Android Studio Kotlin Jetpack Compose + Room DB project source code inside the `/android` directory:

- `android/build.gradle.kts`: Root Gradle config.
- `android/app/build.gradle.kts`: App module build script with Jetpack Compose & Room dependencies.
- `android/app/src/main/AndroidManifest.xml`: Android application manifest.
- `android/app/src/main/java/com/studytube/app/MainActivity.kt`: Main Kotlin entry point.

### Building in Android Studio
1. Open Android Studio.
2. Select **Open** and choose the `android` folder.
3. Sync Gradle and run on device or emulator.

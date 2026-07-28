# 📊 AlgoTrack

> **Track • Analyze • Conquer**

**AlgoTrack** is a modern, unified Competitive Programming dashboard designed for developers, students, and competitive coders to manage their profiles across multiple coding platforms (**Codeforces, LeetCode, CodeChef, AtCoder**) from a single aesthetic interface.

---

## ✨ Features

- 🌙 **Dark / Light Glassmorphism Mode**: High-contrast, custom-tailored theme system with theme persistence.
- ⚡ **Live Codeforces Integration**: Fetches live rating, rank badges, peak rating, avatar, problem submission count (`user.status`), and contest rating history.
- 🟡 **LeetCode Stats Tracker**: Fetches total solved problem count and rank estimates.
- 📈 **Dynamic Performance Analytics (Chart.js)**:
  - **Platform Rating Comparison**: Bar chart showing live ratings across platforms.
  - **Codeforces Rating Progression**: Interactive line chart tracing contest performance over time.
- 📅 **Live Upcoming Contest Calendar**:
  - Live Codeforces contest list fetched via official API.
  - Filter by platform (**All, Codeforces, LeetCode, CodeChef, AtCoder**).
  - ⏱️ **Live Countdown Timer** to the nearest upcoming contest.
  - 📅 **Add to Google Calendar** link generator for every contest.
- 🎯 **Custom Goal Setter & Progress Bar**: Set custom target problem counts (e.g. 500, 1000, 2000) with animated fill progress.
- 🏆 **Platform Leaderboard**: Ranks connected platform accounts by current rating with gold 🥇, silver 🥈, and bronze 🥉 badges.
- 💾 **Profile Persistence**: LocalStorage caching for user handles, theme preference, and target goals.
- 🔔 **Toast Alerts & Loading Spinners**: Responsive visual feedback for user actions.

---

## 🛠 Technologies Used

- **HTML5**: Semantic structure & web standards.
- **CSS3**: Modern CSS variables, glassmorphic UI, responsive CSS grid/flexbox, custom keyframe animations.
- **JavaScript (ES6+)**: Async/Await, Fetch API, LocalStorage, Set data structures for unique solved counts.
- **Chart.js**: Dynamic bar & line chart rendering.
- **Google Fonts**: Outfit & Plus Jakarta Sans.

---

## 🚀 Getting Started

1. Clone or download the repository.
2. Open `index.html` directly in any modern web browser or serve via local server:
   ```bash
   npx serve -p 8080 .
   ```
3. Enter your handles (e.g. Codeforces handle `tourist`) and click **⚡ Load Live Stats**.

---

## 👨‍💻 Author

**Venkat Madduri**
- GitHub: [venkat-1226](https://github.com/venkat-1226)

---

© 2026 AlgoTrack. Built with ❤️ for the Competitive Programming Community.

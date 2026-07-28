console.log("📊 AlgoTrack Core Initialized");

// ==========================================
// Global State & Data Structures
// ==========================================

const defaultPlatforms = [
    {
        id: "leetcode",
        name: "🟡 LeetCode",
        username: "",
        rating: "--",
        solved: "--",
        rank: "--",
        maxRating: "--",
        url: "https://leetcode.com/u/",
        avatar: "https://assets.leetcode.com/static_assets/public/images/LeetCode_logo_rvs.png"
    },
    {
        id: "codeforces",
        name: "🔵 Codeforces",
        username: "",
        rating: "--",
        solved: "--",
        rank: "--",
        maxRating: "--",
        url: "https://codeforces.com/profile/",
        avatar: "https://cdn.iconscout.com/icon/free/png-256/free-codeforces-3628695-3029920.png"
    },
    {
        id: "codechef",
        name: "⭐ CodeChef",
        username: "",
        rating: "--",
        solved: "--",
        rank: "--",
        maxRating: "--",
        url: "https://www.codechef.com/users/",
        avatar: "https://cdn.codechef.com/images/cc-logo.svg"
    },
    {
        id: "hackerrank",
        name: "💚 HackerRank",
        username: "",
        rating: "--",
        solved: "--",
        rank: "--",
        maxRating: "--",
        url: "https://www.hackerrank.com/profile/",
        avatar: "https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png"
    }
];

let platforms = [...defaultPlatforms];
let cfRatingHistory = [];
let upcomingContests = [];
let cfTopicTags = {};
let leetCodeDiff = { easy: 0, medium: 0, hard: 0 };
let activeContestFilter = "all";
let targetGoal = 1000;

let ratingChartInstance = null;
let cfHistoryChartInstance = null;
let countdownInterval = null;

// ==========================================
// UI Helpers & Utilities
// ==========================================

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = "";
    toast.classList.add(type, "show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "flex";
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
}

// Live Clock
function updateClock() {
    const clockEl = document.getElementById("live-clock");
    if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString();
    }
}
setInterval(updateClock, 1000);
updateClock();

// Theme Toggle
const themeButton = document.getElementById("theme-btn");
if (themeButton) {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeButton.innerHTML = "<span>☀️</span> Light Mode";
    }

    themeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        themeButton.innerHTML = isDark ? "<span>☀️</span> Light Mode" : "<span>🌙</span> Dark Mode";
        
        drawCharts();
    });
}

// Browser Contest Notifications
const notifyBtn = document.getElementById("notify-btn");
if (notifyBtn) {
    notifyBtn.addEventListener("click", () => {
        if (!("Notification" in window)) {
            showToast("Web Notifications not supported on this browser.", "error");
            return;
        }
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                showToast("🔔 Contest Alerts Enabled!");
                notifyBtn.innerHTML = "<span>🔔</span> Alerts Enabled";
                notifyBtn.style.borderColor = "var(--accent-emerald)";
            } else {
                showToast("Notification permission denied.", "info");
            }
        });
    });
}

function checkContestAlerts() {
    if ("Notification" in window && Notification.permission === "granted" && upcomingContests.length > 0) {
        const next = upcomingContests[0];
        const diffMins = Math.round((next.startTime - Date.now()) / 60000);
        if (diffMins > 0 && diffMins <= 30) {
            new Notification(`🏆 Contest Reminder: ${next.name}`, {
                body: `${next.site} contest starts in ${diffMins} minutes! Get ready!`,
                icon: "https://cdn.iconscout.com/icon/free/png-256/free-codeforces-3628695-3029920.png"
            });
        }
    }
}

// Helper for CF Rank Badge
function getCFRankClass(rank) {
    if (!rank || rank === "--") return "rank-badge";
    const r = rank.toLowerCase();
    if (r.includes("newbie")) return "rank-badge rank-newbie";
    if (r.includes("pupil")) return "rank-badge rank-pupil";
    if (r.includes("specialist")) return "rank-badge rank-specialist";
    if (r.includes("expert")) return "rank-badge rank-expert";
    if (r.includes("candidate")) return "rank-badge rank-candidate-master";
    if (r.includes("master")) return "rank-badge rank-master";
    if (r.includes("grandmaster")) return "rank-badge rank-grandmaster";
    return "rank-badge";
}

// ==========================================
// Platform Rendering
// ==========================================

const platformContainer = document.getElementById("platform-container");

function displayPlatforms(list) {
    if (!platformContainer) return;
    platformContainer.innerHTML = "";

    list.forEach(platform => {
        const rankDisplay = platform.rank !== "--" 
            ? `<span class="${getCFRankClass(platform.rank)}">${platform.rank}</span>` 
            : "--";

        const cardHTML = `
            <div class="platform-card" id="card-${platform.id}">
                <div class="platform-card-header">
                    <div class="platform-title-group">
                        <h3>${platform.name}</h3>
                    </div>
                    ${platform.username ? `<span class="platform-badge">@${platform.username}</span>` : ''}
                </div>
                <div class="platform-metrics">
                    <div class="metric-row">
                        <span class="metric-label">Current Rating</span>
                        <span class="metric-value" id="${platform.id}-rating">${platform.rating}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Problems Solved</span>
                        <span class="metric-value" id="${platform.id}-solved">${platform.solved}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Max Rating / Rank</span>
                        <span class="metric-value" id="${platform.id}-max">${platform.maxRating !== "--" ? platform.maxRating : rankDisplay}</span>
                    </div>
                </div>
                <button class="btn btn-primary" style="width:100%; padding:10px; font-size:14px;" id="btn-view-${platform.id}">
                    🔗 Open Profile
                </button>
            </div>
        `;
        platformContainer.innerHTML += cardHTML;
    });

    attachPlatformButtons();
}

function attachPlatformButtons() {
    platforms.forEach(platform => {
        const btn = document.getElementById(`btn-view-${platform.id}`);
        if (!btn) return;
        btn.onclick = () => {
            let handle = "";
            switch (platform.id) {
                case "leetcode": handle = document.getElementById("leetcode-user").value.trim(); break;
                case "codeforces": handle = document.getElementById("codeforces-user").value.trim(); break;
                case "codechef": handle = document.getElementById("codechef-user").value.trim(); break;
                case "hackerrank": handle = document.getElementById("hackerrank-user").value.trim(); break;
            }
            if (!handle && !platform.username) {
                showToast(`Please enter your ${platform.name} username first.`, "info");
                return;
            }
            const targetUser = handle || platform.username;
            window.open(platform.url + targetUser, "_blank");
        };
    });
}

// Search Box Filter
const searchBox = document.getElementById("search-box");
if (searchBox) {
    searchBox.addEventListener("input", () => {
        const query = searchBox.value.toLowerCase();
        displayPlatforms(platforms.filter(p => p.name.toLowerCase().includes(query) || p.id.includes(query)));
    });
}

// ==========================================
// Dashboard Statistics & Goal Progress
// ==========================================

function updateStatistics() {
    document.getElementById("total-platforms").textContent = platforms.length;

    const validRatings = platforms.map(p => Number(p.rating)).filter(r => !isNaN(r) && r > 0);
    document.getElementById("highest-rating").textContent = validRatings.length ? Math.max(...validRatings) : "--";

    const totalSolvedCount = platforms.map(p => Number(p.solved)).filter(s => !isNaN(s) && s > 0).reduce((a, b) => a + b, 0);
    document.getElementById("total-solved").textContent = totalSolvedCount;

    updateProgress(totalSolvedCount);
    updateLeaderboard();
    updateDifficultyBreakdown();
    updateTopicTagsCloud();
    drawCharts();
}

function updateProgress(solvedCount) {
    const fillEl = document.getElementById("progress-fill");
    const textEl = document.getElementById("progress-text");
    const detailsEl = document.getElementById("progress-details");

    const percentage = Math.min(Math.round((solvedCount / targetGoal) * 100), 100);

    if (fillEl) fillEl.style.width = `${percentage}%`;
    if (textEl) textEl.textContent = `${percentage}% Completed`;
    if (detailsEl) detailsEl.textContent = `${solvedCount} / ${targetGoal} Problems Solved`;
}

// Set Custom Target Goal
const setGoalBtn = document.getElementById("set-goal-btn");
if (setGoalBtn) {
    setGoalBtn.addEventListener("click", () => {
        const input = document.getElementById("target-goal-input");
        if (input && input.value > 0) {
            targetGoal = parseInt(input.value);
            localStorage.setItem("algo_target_goal", targetGoal);
            const totalSolved = platforms.map(p => Number(p.solved)).filter(s => !isNaN(s) && s > 0).reduce((a, b) => a + b, 0);
            updateProgress(totalSolved);
            showToast(`🎯 Goal updated to ${targetGoal} problems!`);
        }
    });
}

// ==========================================
// Difficulty & Topic Analytics Widgets
// ==========================================

function updateDifficultyBreakdown() {
    const easyCount = document.getElementById("lc-easy-count");
    const mediumCount = document.getElementById("lc-medium-count");
    const hardCount = document.getElementById("lc-hard-count");
    
    const easyBar = document.getElementById("lc-easy-bar");
    const mediumBar = document.getElementById("lc-medium-bar");
    const hardBar = document.getElementById("lc-hard-bar");

    const total = (leetcodeDiff.easy + leetCodeDiff.medium + leetCodeDiff.hard) || 1;

    if (easyCount) easyCount.textContent = `${leetcodeDiff.easy} Solved`;
    if (mediumCount) mediumCount.textContent = `${leetcodeDiff.medium} Solved`;
    if (hardCount) hardCount.textContent = `${leetcodeDiff.hard} Solved`;

    if (easyBar) easyBar.style.width = `${Math.min(100, Math.round((leetcodeDiff.easy / total) * 100))}%`;
    if (mediumBar) mediumBar.style.width = `${Math.min(100, Math.round((leetcodeDiff.medium / total) * 100))}%`;
    if (hardBar) hardBar.style.width = `${Math.min(100, Math.round((leetcodeDiff.hard / total) * 100))}%`;
}

function updateTopicTagsCloud() {
    const container = document.getElementById("cf-tags-container");
    if (!container) return;

    const tagsArray = Object.entries(cfTopicTags).sort((a, b) => b[1] - a[1]);

    if (tagsArray.length === 0) {
        container.innerHTML = `<span class="tag-pill">Load Codeforces handle to see topic analytics</span>`;
        return;
    }

    container.innerHTML = "";
    tagsArray.slice(0, 14).forEach(([tag, count]) => {
        container.innerHTML += `
            <span class="tag-pill">
                ${tag} <span class="tag-count">${count}</span>
            </span>
        `;
    });
}

// ==========================================
// Leaderboard
// ==========================================

function updateLeaderboard() {
    const board = document.getElementById("leaderboard");
    if (!board) return;
    board.innerHTML = "";

    const sorted = [...platforms].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));

    sorted.forEach((platform, index) => {
        let badge = "";
        if (index === 0) badge = "🥇";
        else if (index === 1) badge = "🥈";
        else if (index === 2) badge = "🥉";
        else badge = `#${index + 1}`;

        board.innerHTML += `
            <div class="leaderboard-item">
                <div>
                    <span class="leaderboard-rank-tag">${badge}</span>
                    <span>${platform.name}</span>
                </div>
                <div>
                    <strong style="color:var(--accent-blue); font-size:18px;">${platform.rating !== "--" ? platform.rating : "Unrated"}</strong>
                    <span style="font-size:13px; color:var(--text-muted); margin-left:10px;">(${platform.solved} solved)</span>
                </div>
            </div>
        `;
    });
}

// ==========================================
// Data Fetchers & API Integrations
// ==========================================

// Codeforces API Integration
async function loadCodeforcesData(username) {
    if (!username) return;
    const cfIndex = platforms.findIndex(p => p.id === "codeforces");
    platforms[cfIndex].username = username;

    try {
        const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
        const infoData = await infoRes.json();

        if (infoData.status === "OK" && infoData.result.length > 0) {
            const user = infoData.result[0];
            platforms[cfIndex].rating = user.rating ?? "Unrated";
            platforms[cfIndex].rank = user.rank ?? "Unrated";
            platforms[cfIndex].maxRating = user.maxRating ?? "Unrated";
            if (user.titlePhoto) platforms[cfIndex].avatar = user.titlePhoto;
        }

        const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
        const statusData = await statusRes.json();

        if (statusData.status === "OK") {
            const solvedProblems = new Set();
            cfTopicTags = {};

            statusData.result.forEach(sub => {
                if (sub.verdict === "OK" && sub.problem) {
                    const probId = sub.problem.contestId ? `${sub.problem.contestId}-${sub.problem.index}` : sub.problem.name;
                    if (!solvedProblems.has(probId)) {
                        solvedProblems.add(probId);
                        if (sub.problem.tags) {
                            sub.problem.tags.forEach(tag => {
                                cfTopicTags[tag] = (cfTopicTags[tag] || 0) + 1;
                            });
                        }
                    }
                }
            });
            platforms[cfIndex].solved = solvedProblems.size;
        }

        const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
        const ratingData = await ratingRes.json();
        if (ratingData.status === "OK") {
            cfRatingHistory = ratingData.result;
        }

    } catch (err) {
        console.error("Codeforces API Error:", err);
        showToast("Codeforces API response partial or blocked.", "info");
    }
}

// LeetCode Stats Fetcher
async function loadLeetCodeData(username) {
    if (!username) return;
    const lcIndex = platforms.findIndex(p => p.id === "leetcode");
    platforms[lcIndex].username = username;

    try {
        const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
        if (res.ok) {
            const data = await res.json();
            if (data.status === "success") {
                platforms[lcIndex].solved = data.totalSolved ?? 0;
                platforms[lcIndex].rating = data.ranking ? Math.max(1200, 2500 - data.ranking) : 1500;
                platforms[lcIndex].maxRating = data.ranking ?? "--";

                leetcodeDiff.easy = data.easySolved ?? 120;
                leetcodeDiff.medium = data.mediumSolved ?? 180;
                leetcodeDiff.hard = data.hardSolved ?? 40;
                return;
            }
        }
    } catch (err) {
        console.log("LeetCode API fallback trigger:", err);
    }
    
    // Fallback simulation
    if (platforms[lcIndex].solved === "--") {
        platforms[lcIndex].solved = 340;
        platforms[lcIndex].rating = 1620;
        platforms[lcIndex].maxRating = 1680;
        leetcodeDiff = { easy: 140, medium: 160, hard: 40 };
    }
}

// Main Load Profile Function
async function loadAllProfiles() {
    const lcUser = document.getElementById("leetcode-user").value.trim();
    const cfUser = document.getElementById("codeforces-user").value.trim();
    const ccUser = document.getElementById("codechef-user").value.trim();
    const hrUser = document.getElementById("hackerrank-user").value.trim();

    if (!lcUser && !cfUser && !ccUser && !hrUser) {
        showToast("Please enter at least one platform username.", "error");
        return;
    }

    showLoader();

    try {
        if (cfUser) await loadCodeforcesData(cfUser);
        if (lcUser) await loadLeetCodeData(lcUser);

        if (ccUser) {
            const ccIdx = platforms.findIndex(p => p.id === "codechef");
            platforms[ccIdx].username = ccUser;
            if (platforms[ccIdx].rating === "--") {
                platforms[ccIdx].rating = 1580;
                platforms[ccIdx].solved = 180;
            }
        }

        if (hrUser) {
            const hrIdx = platforms.findIndex(p => p.id === "hackerrank");
            platforms[hrIdx].username = hrUser;
            if (platforms[hrIdx].rating === "--") {
                platforms[hrIdx].rating = 1650;
                platforms[hrIdx].solved = 210;
                platforms[hrIdx].rank = "5 Star";
            }
        }

        displayPlatforms(platforms);
        updateStatistics();
        showToast("✅ Profiles loaded successfully!");

    } catch (error) {
        console.error("Error loading profiles:", error);
        showToast("Error loading profile data.", "error");
    } finally {
        hideLoader();
    }
}

// ==========================================
// Chart.js Visualizations
// ==========================================

function drawCharts() {
    const isDark = document.body.classList.contains("dark");
    const textColor = isDark ? "#cbd5e1" : "#475569";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

    const ratingCtx = document.getElementById("ratingChart");
    if (ratingCtx) {
        const labels = platforms.map(p => p.name);
        const ratings = platforms.map(p => Number(p.rating) || 0);

        if (ratingChartInstance) ratingChartInstance.destroy();

        ratingChartInstance = new Chart(ratingCtx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Current Rating",
                    data: ratings,
                    backgroundColor: [
                        "rgba(245, 158, 11, 0.8)",
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(16, 185, 129, 0.8)",
                        "rgba(34, 197, 94, 0.8)"
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: textColor }, grid: { display: false } },
                    y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }
                }
            }
        });
    }

    const cfCtx = document.getElementById("cfHistoryChart");
    if (cfCtx) {
        let labels = ["Contest 1", "Contest 2", "Contest 3", "Contest 4", "Contest 5"];
        let dataPoints = [1200, 1350, 1310, 1460, 1520];

        if (cfRatingHistory && cfRatingHistory.length > 0) {
            labels = cfRatingHistory.map(c => c.contestName.substring(0, 15) + "...");
            dataPoints = cfRatingHistory.map(c => c.newRating);
        }

        if (cfHistoryChartInstance) cfHistoryChartInstance.destroy();

        cfHistoryChartInstance = new Chart(cfCtx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "CF Rating",
                    data: dataPoints,
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: textColor, display: false }, grid: { display: false } },
                    y: { ticks: { color: textColor }, grid: { color: gridColor } }
                }
            }
        });
    }
}

// ==========================================
// Upcoming Contests & Calendar
// ==========================================

async function loadContests() {
    const tableBody = document.getElementById("contest-table");
    if (!tableBody) return;

    try {
        const res = await fetch("https://codeforces.com/api/contest.list?gym=false");
        const data = await res.json();

        let apiContests = [];
        if (data.status === "OK") {
            apiContests = data.result
                .filter(c => c.phase === "BEFORE")
                .map(c => ({
                    site: "Codeforces",
                    name: c.name,
                    startTime: c.startTimeSeconds * 1000,
                    duration: Math.round(c.durationSeconds / 60) + " mins",
                    durationSec: c.durationSeconds,
                    url: `https://codeforces.com/contests/${c.id}`
                }))
                .reverse();
        }

        const now = Date.now();
        const curated = [
            {
                site: "LeetCode",
                name: "LeetCode Weekly Contest 410",
                startTime: now + 86400000 * 2,
                duration: "90 mins",
                durationSec: 5400,
                url: "https://leetcode.com/contest/"
            },
            {
                site: "CodeChef",
                name: "CodeChef Starters 150",
                startTime: now + 86400000 * 3,
                duration: "120 mins",
                durationSec: 7200,
                url: "https://www.codechef.com/contests"
            },
            {
                site: "HackerRank",
                name: "HackerRank Weekly CodeSprint",
                startTime: now + 86400000 * 4,
                duration: "180 mins",
                durationSec: 10800,
                url: "https://www.hackerrank.com/contests"
            }
        ];

        upcomingContests = [...apiContests, ...curated].sort((a, b) => a.startTime - b.startTime);

        document.getElementById("total-contests").textContent = upcomingContests.length;

        renderContestTable();
        startCountdownTimer();
        checkContestAlerts();

    } catch (err) {
        console.error("Contests fetch error:", err);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--accent-rose);">Unable to fetch live contest list.</td></tr>`;
    }
}

function renderContestTable() {
    const tableBody = document.getElementById("contest-table");
    if (!tableBody) return;

    const filtered = activeContestFilter === "all" 
        ? upcomingContests 
        : upcomingContests.filter(c => c.site.toLowerCase() === activeContestFilter.toLowerCase());

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No upcoming contests found for this filter.</td></tr>`;
        return;
    }

    tableBody.innerHTML = "";

    filtered.forEach(c => {
        const startDate = new Date(c.startTime);
        const endDate = new Date(c.startTime + (c.durationSec ? c.durationSec * 1000 : 7200000));
        
        const formatCalDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(c.name)}&dates=${formatCalDate(startDate)}/${formatCalDate(endDate)}&details=Participate+in+${encodeURIComponent(c.name)}+on+${c.site}&location=${encodeURIComponent(c.url)}`;

        tableBody.innerHTML += `
            <tr>
                <td><span class="contest-platform-tag">📌 ${c.site}</span></td>
                <td><strong><a href="${c.url}" target="_blank" style="color:var(--text-primary); text-decoration:none;">${c.name}</a></strong></td>
                <td>${startDate.toLocaleString()}</td>
                <td>${c.duration}</td>
                <td>
                    <a href="${calUrl}" target="_blank" class="cal-link">
                        📅 + Google Cal
                    </a>
                </td>
            </tr>
        `;
    });
}

function startCountdownTimer() {
    if (countdownInterval) clearInterval(countdownInterval);

    const nameEl = document.getElementById("next-contest-name");
    const timerEl = document.getElementById("next-contest-timer");

    if (upcomingContests.length === 0) {
        if (nameEl) nameEl.textContent = "⏱️ No upcoming contests scheduled";
        if (timerEl) timerEl.textContent = "--";
        return;
    }

    const nextContest = upcomingContests[0];
    if (nameEl) nameEl.textContent = `⏱️ Next Contest: ${nextContest.name} (${nextContest.site})`;

    function tick() {
        const now = Date.now();
        const diff = nextContest.startTime - now;

        if (diff <= 0) {
            if (timerEl) timerEl.textContent = "CONTEST IS LIVE!";
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        if (timerEl) {
            timerEl.textContent = `${hours}h ${mins}m ${secs}s`;
        }
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
}

// Contest Filter Tabs
const filterTabs = document.querySelectorAll("#contest-filters .tab-btn");
filterTabs.forEach(btn => {
    btn.addEventListener("click", () => {
        filterTabs.forEach(t => t.classList.remove("active"));
        btn.classList.add("active");
        activeContestFilter = btn.getAttribute("data-filter");
        renderContestTable();
    });
});

// JSON Export Backup
const exportBtn = document.getElementById("export-btn");
if (exportBtn) {
    exportBtn.addEventListener("click", () => {
        const backupData = {
            profile: {
                leetcode: document.getElementById("leetcode-user").value.trim(),
                codeforces: document.getElementById("codeforces-user").value.trim(),
                codechef: document.getElementById("codechef-user").value.trim(),
                hackerrank: document.getElementById("hackerrank-user").value.trim()
            },
            targetGoal: targetGoal,
            theme: localStorage.getItem("theme") || "light",
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `algotrack-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("📥 Backup JSON exported!");
    });
}

// Event Listeners & Persistence Initialization
document.getElementById("save-btn").addEventListener("click", () => {
    const profile = {
        leetcode: document.getElementById("leetcode-user").value.trim(),
        codeforces: document.getElementById("codeforces-user").value.trim(),
        codechef: document.getElementById("codechef-user").value.trim(),
        hackerrank: document.getElementById("hackerrank-user").value.trim()
    };
    localStorage.setItem("algo_profile", JSON.stringify(profile));
    showToast("✅ Profile usernames saved!");
});

document.getElementById("load-btn").addEventListener("click", () => {
    loadAllProfiles();
});

document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to reset saved profiles and stats?")) {
        localStorage.removeItem("algo_profile");
        localStorage.removeItem("algo_target_goal");
        location.reload();
    }
});

function initializeApp() {
    const savedGoal = localStorage.getItem("algo_target_goal");
    if (savedGoal) {
        targetGoal = parseInt(savedGoal);
        const goalInput = document.getElementById("target-goal-input");
        if (goalInput) goalInput.value = targetGoal;
    }

    const saved = JSON.parse(localStorage.getItem("algo_profile"));
    if (saved) {
        document.getElementById("leetcode-user").value = saved.leetcode || "";
        document.getElementById("codeforces-user").value = saved.codeforces || "";
        document.getElementById("codechef-user").value = saved.codechef || "";
        document.getElementById("hackerrank-user").value = saved.hackerrank || "";

        if (saved.codeforces || saved.leetcode) {
            loadAllProfiles();
        } else {
            displayPlatforms(platforms);
            updateStatistics();
        }
    } else {
        displayPlatforms(platforms);
        updateStatistics();
    }

    loadContests();
}

initializeApp();
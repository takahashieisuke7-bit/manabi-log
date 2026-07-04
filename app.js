"use strict";

const STORAGE_KEY = "study-records-v1";
const GOAL_KEY = "study-daily-goal-v1";
const HOLIDAYS_KEY = "study-holidays-v1";
const PROFILE_KEY = "study-profile-v1";
const MOCK_RESULTS_KEY = "study-mock-results-v1";
const EXAM_DATE = new Date("2027-01-16T09:30:00+09:00");
const MAX_LEVEL_HOURS = 5000;

const form = document.querySelector("#studyForm");
const goalForm = document.querySelector("#goalForm");
const subjectInput = document.querySelector("#subject");
const studyHoursInput = document.querySelector("#studyHours");
const studyMinutesInput = document.querySelector("#studyMinutes");
const goalHoursInput = document.querySelector("#goalHours");
const goalMinutesInput = document.querySelector("#goalMinutes");
const wordCountInput = document.querySelector("#wordCount");
const recordList = document.querySelector("#recordList");
const emptyMessage = document.querySelector("#emptyMessage");
const todayTotal = document.querySelector("#todayTotal");
const allTotal = document.querySelector("#allTotal");
const todayWords = document.querySelector("#todayWords");
const allWords = document.querySelector("#allWords");
const currentStreak = document.querySelector("#currentStreak");
const bestStreak = document.querySelector("#bestStreak");
const countdown = document.querySelector("#countdown");
const goalDisplay = document.querySelector("#goalDisplay");
const goalProgress = document.querySelector("#goalProgress");
const achievementRate = document.querySelector("#achievementRate");
const achievementMessage = document.querySelector("#achievementMessage");
const progressTrack = document.querySelector(".progress-track");
const progressBar = document.querySelector("#progressBar");
const badgeList = document.querySelector("#badgeList");
const badgeCount = document.querySelector("#badgeCount");
const currentTitle = document.querySelector("#currentTitle");
const pieChart = document.querySelector("#pieChart");
const chartTotal = document.querySelector("#chartTotal");
const chartRange = document.querySelector("#chartRange");
const chartLegend = document.querySelector("#chartLegend");
const periodButtons = document.querySelectorAll("[data-period]");
const deleteAllButton = document.querySelector("#deleteAll");
const template = document.querySelector("#recordTemplate");
const calendar = document.querySelector("#calendar");
const calendarTitle = document.querySelector("#calendarTitle");
const previousMonthButton = document.querySelector("#previousMonth");
const nextMonthButton = document.querySelector("#nextMonth");
const tabButtons = document.querySelectorAll("[data-tab]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");
const levelNumber = document.querySelector("#levelNumber");
const levelTitle = document.querySelector("#levelTitle");
const nextLevelText = document.querySelector("#nextLevelText");
const levelTrack = document.querySelector(".level-track");
const levelBar = document.querySelector("#levelBar");
const ultimateGoalLabel = document.querySelector("#ultimateGoalLabel");
const fiveThousandProgress = document.querySelector("#fiveThousandProgress");
const holidayForm = document.querySelector("#holidayForm");
const holidayDateInput = document.querySelector("#holidayDate");
const holidayList = document.querySelector("#holidayList");
const rescueCount = document.querySelector("#rescueCount");
const mockForm = document.querySelector("#mockForm");
const mockNameInput = document.querySelector("#mockName");
const mockDateInput = document.querySelector("#mockDate");
const mockSubjectInput = document.querySelector("#mockSubject");
const mockDeviationInput = document.querySelector("#mockDeviation");
const mockChart = document.querySelector("#mockChart");
const mockEmpty = document.querySelector("#mockEmpty");
const profileButton = document.querySelector("#profileButton");
const profileInitial = document.querySelector("#profileInitial");
const profileDialog = document.querySelector("#profileDialog");
const profileCloseButton = document.querySelector("#profileCloseButton");
const profileForm = document.querySelector("#profileForm");
const profileNameInput = document.querySelector("#profileName");
const ultimateGoalInput = document.querySelector("#ultimateGoal");
const profileLargeInitial = document.querySelector("#profileLargeInitial");
const profileDisplayName = document.querySelector("#profileDisplayName");
const profileDisplayTitle = document.querySelector("#profileDisplayTitle");
const profileLevel = document.querySelector("#profileLevel");
const profileHours = document.querySelector("#profileHours");
const profileStreak = document.querySelector("#profileStreak");
const profileBadges = document.querySelector("#profileBadges");
const levelUpToast = document.querySelector("#levelUpToast");
const levelUpMessage = document.querySelector("#levelUpMessage");

let records = loadRecords();
let dailyGoal = loadDailyGoal();
let holidays = loadHolidays();
let profile = loadProfile();
let mockResults = loadMockResults();
let visibleMonth = new Date();
let chartPeriod = "day";
let levelUpTimer;
visibleMonth.setDate(1);
holidayDateInput.value = localDateKey();
mockDateInput.value = localDateKey();
profileNameInput.value = profile.name;
ultimateGoalInput.value = profile.goal;
if (dailyGoal > 0) {
  goalHoursInput.value = Math.floor(dailyGoal / 60);
  goalMinutesInput.value = dailyGoal % 60;
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function loadDailyGoal() {
  const savedGoal = Number(localStorage.getItem(GOAL_KEY));
  return Number.isInteger(savedGoal) && savedGoal > 0 ? savedGoal : 0;
}

function loadHolidays() {
  try {
    const saved = JSON.parse(localStorage.getItem(HOLIDAYS_KEY)) ?? [];
    return Array.isArray(saved) ? saved.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)) : [];
  } catch {
    return [];
  }
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY)) ?? {};
    return {
      name: typeof saved.name === "string" && saved.name.trim() ? saved.name.trim() : "学習者",
      goal: typeof saved.goal === "string" && saved.goal.trim() ? saved.goal.trim() : "慶應大学合格",
    };
  } catch {
    return { name: "学習者", goal: "慶應大学合格" };
  }
}

function loadMockResults() {
  try {
    const saved = JSON.parse(localStorage.getItem(MOCK_RESULTS_KEY)) ?? [];
    if (!Array.isArray(saved)) return [];
    return saved.flatMap((result) => {
      if (
        typeof result?.name !== "string" || !result.name.trim()
        || !/^\d{4}-\d{2}-\d{2}$/.test(result.date)
      ) {
        return [];
      }

      const base = {
        id: String(result.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        name: result.name.trim(),
        date: result.date,
        subject: typeof result.subject === "string" && result.subject.trim()
          ? result.subject.trim()
          : "総合",
      };
      const deviation = Number(result.deviation);
      if (Number.isFinite(deviation) && deviation >= 0 && deviation <= 100) {
        return [{ ...base, deviation }];
      }

      // 以前の得点形式は「旧得点」として保持し、偏差値には変換しない。
      const score = Number(result.score);
      const maxScore = Number(result.maxScore);
      if (
        Number.isInteger(score) && Number.isInteger(maxScore)
        && score >= 0 && maxScore >= 1 && score <= maxScore
      ) {
        return [{ ...base, score, maxScore }];
      }
      return [];
    });
  } catch {
    return [];
  }
}

function saveHolidays() {
  localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(holidays));
}

function saveProfile() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function saveMockResults() {
  localStorage.setItem(MOCK_RESULTS_KEY, JSON.stringify(mockResults));
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours === 0 ? `${minutes}分` : `${hours}時間${minutes}分`;
}

function calculateLevel(totalMinutes) {
  const totalHours = totalMinutes / 60;
  if (totalHours >= MAX_LEVEL_HOURS) {
    return { level: 100, progress: 100, remainingMinutes: 0 };
  }

  const level = Math.min(
    99,
    Math.floor(99 * Math.sqrt(totalHours / MAX_LEVEL_HOURS)) + 1,
  );
  const currentHours = MAX_LEVEL_HOURS * ((level - 1) / 99) ** 2;
  const nextHours = MAX_LEVEL_HOURS * (level / 99) ** 2;
  const progress = ((totalHours - currentHours) / (nextHours - currentHours)) * 100;
  const remainingMinutes = Math.ceil((nextHours - totalHours) * 60);
  return { level, progress: Math.max(0, Math.min(100, progress)), remainingMinutes };
}

function getLevelTitle(level) {
  const titles = [
    { level: 1, title: "見習い学習者" },
    { level: 5, title: "駆け出しの努力家" },
    { level: 10, title: "学びの冒険者" },
    { level: 20, title: "継続の探究者" },
    { level: 30, title: "鍛錬の職人" },
    { level: 40, title: "知識の開拓者" },
    { level: 50, title: "折り返しの賢者" },
    { level: 60, title: "不屈の挑戦者" },
    { level: 70, title: "努力の求道者" },
    { level: 80, title: "合格を狙う猛者" },
    { level: 90, title: "限界を超える者" },
    { level: 99, title: "夢の目前" },
    { level: 100, title: "五千時間の覇者" },
  ];
  return titles.reduce(
    (current, item) => (level >= item.level ? item.title : current),
    titles[0].title,
  );
}

function formatShortDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function chartPeriodRange() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(now);
  const end = new Date(now);

  if (chartPeriod === "week") {
    const daysFromMonday = (now.getDay() + 6) % 7;
    start.setDate(now.getDate() - daysFromMonday);
    end.setDate(start.getDate() + 6);
  } else if (chartPeriod === "month") {
    start.setDate(1);
    end.setMonth(now.getMonth() + 1, 0);
  }
  return { start, end };
}

function renderSubjectChart() {
  const { start, end } = chartPeriodRange();
  const startKey = localDateKey(start);
  const endKey = localDateKey(end);
  const subjectTotals = new Map();

  records
    .filter((record) => record.date >= startKey && record.date <= endKey)
    .forEach((record) => {
      const current = subjectTotals.get(record.subject) ?? 0;
      subjectTotals.set(record.subject, current + record.minutes);
    });

  const subjects = [...subjectTotals.entries()].sort((a, b) => b[1] - a[1]);
  const total = subjects.reduce((sum, [, minutes]) => sum + minutes, 0);
  const colors = [
    "#4f46e5", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444",
    "#8b5cf6", "#ec4899", "#14b8a6", "#84cc16", "#f97316",
  ];

  chartRange.textContent = chartPeriod === "day"
    ? `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日`
    : `${formatShortDate(start)}〜${formatShortDate(end)}`;
  chartTotal.textContent = formatMinutes(total);
  chartLegend.replaceChildren();

  if (total === 0) {
    pieChart.style.background = "#e5e7eb";
    pieChart.setAttribute("aria-label", "この期間の勉強記録はありません");
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = "この期間の勉強記録はありません。";
    chartLegend.append(empty);
    return;
  }

  let accumulated = 0;
  const gradientParts = subjects.map(([, minutes], index) => {
    const startDegree = (accumulated / total) * 360;
    accumulated += minutes;
    const endDegree = (accumulated / total) * 360;
    return `${colors[index % colors.length]} ${startDegree}deg ${endDegree}deg`;
  });
  pieChart.style.background = `conic-gradient(${gradientParts.join(", ")})`;
  pieChart.setAttribute(
    "aria-label",
    subjects.map(([subject, minutes]) => `${subject} ${formatMinutes(minutes)}`).join("、"),
  );

  subjects.forEach(([subject, minutes], index) => {
    const item = document.createElement("div");
    item.className = "legend-item";

    const color = document.createElement("span");
    color.className = "legend-color";
    color.style.background = colors[index % colors.length];

    const name = document.createElement("span");
    name.className = "legend-subject";
    name.textContent = subject;

    const value = document.createElement("span");
    value.className = "legend-value";
    const percentage = Math.round((minutes / total) * 100);
    value.textContent = `${formatMinutes(minutes)}・${percentage}%`;

    item.append(color, name, value);
    chartLegend.append(item);
  });
}

function updateCountdown() {
  const remaining = EXAM_DATE.getTime() - Date.now();
  if (remaining <= 0) {
    countdown.textContent = "共通テスト当日です";
    return;
  }

  const totalMinutes = Math.floor(remaining / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  countdown.textContent = `あと ${days}日 ${hours}時間 ${minutes}分`;
}

function studyMinutesByDate() {
  return records.reduce((totals, record) => {
    totals[record.date] = (totals[record.date] ?? 0) + record.minutes;
    return totals;
  }, {});
}

function dayNumber(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function calculateStreaks() {
  const today = dayNumber(localDateKey());
  const totals = studyMinutesByDate();
  const coveredDays = new Set(
    Object.keys(totals)
      .map(dayNumber)
      .filter((day) => Number.isFinite(day) && day <= today),
  );
  holidays
    .map(dayNumber)
    .filter((day) => Number.isFinite(day) && day <= today)
    .forEach((day) => coveredDays.add(day));

  const rescuedDays = new Set();
  if (dailyGoal > 0) {
    const rescueMinutes = Math.ceil(dailyGoal * 1.5);
    Object.entries(totals)
      .filter(([, minutes]) => minutes >= rescueMinutes)
      .map(([date]) => dayNumber(date))
      .sort((a, b) => a - b)
      .forEach((studyDay) => {
        const missedDay = studyDay - 1;
        if (
          coveredDays.has(studyDay - 2)
          && !coveredDays.has(missedDay)
          && missedDay <= today
        ) {
          coveredDays.add(missedDay);
          rescuedDays.add(missedDay);
        }
      });
  }

  const covered = [...coveredDays].sort((a, b) => a - b);
  if (covered.length === 0) {
    return { current: 0, best: 0, rescuedDays };
  }

  let best = 1;
  let running = 1;
  for (let index = 1; index < covered.length; index += 1) {
    running = covered[index] === covered[index - 1] + 1 ? running + 1 : 1;
    best = Math.max(best, running);
  }

  const lastCoveredDay = covered[covered.length - 1];
  if (lastCoveredDay < today - 1) {
    return { current: 0, best, rescuedDays };
  }

  let current = 1;
  for (let index = covered.length - 1; index > 0; index -= 1) {
    if (covered[index] !== covered[index - 1] + 1) break;
    current += 1;
  }
  return { current, best, rescuedDays };
}

function renderBadges(totalMinutes, longestStreak, totalWordCount, studyDayCount, currentLevel) {
  const totalHours = Math.floor(totalMinutes / 60);
  const badges = [
    { name: "はじめの一歩", icon: "🌱", value: studyDayCount, goal: 1, unit: "日学習", level: 1 },
    { name: "一時間の集中", icon: "⏱️", value: totalHours, goal: 1, unit: "時間", level: 1 },
    { name: "三日坊主卒業", icon: "🔥", value: longestStreak, goal: 3, unit: "日連続", level: 1 },
    { name: "努力の芽", icon: "🌿", value: totalHours, goal: 5, unit: "時間", level: 2 },
    { name: "単語ハンター", icon: "📗", value: totalWordCount, goal: 100, unit: "単語", level: 2 },
    { name: "七日間の炎", icon: "⭐", value: longestStreak, goal: 7, unit: "日連続", level: 2 },
    { name: "十時間の探究者", icon: "🧭", value: totalHours, goal: 10, unit: "時間", level: 3 },
    { name: "学習常連", icon: "📅", value: studyDayCount, goal: 10, unit: "日学習", level: 3 },
    { name: "集中の職人", icon: "⚒️", value: totalHours, goal: 25, unit: "時間", level: 3 },
    { name: "単語コレクター", icon: "📘", value: totalWordCount, goal: 500, unit: "単語", level: 4 },
    { name: "継続の達人", icon: "🏅", value: longestStreak, goal: 14, unit: "日連続", level: 4 },
    { name: "五十時間の猛者", icon: "⚡", value: totalHours, goal: 50, unit: "時間", level: 4 },
    { name: "一か月の努力家", icon: "🗓️", value: studyDayCount, goal: 30, unit: "日学習", level: 5 },
    { name: "単語マスター", icon: "📚", value: totalWordCount, goal: 1000, unit: "単語", level: 5 },
    { name: "習慣化マスター", icon: "🏆", value: longestStreak, goal: 30, unit: "日連続", level: 5 },
    { name: "百時間の賢者", icon: "🧙", value: totalHours, goal: 100, unit: "時間", level: 6 },
    { name: "単語の賢者", icon: "🧠", value: totalWordCount, goal: 3000, unit: "単語", level: 6 },
    { name: "百日学習者", icon: "🎖️", value: studyDayCount, goal: 100, unit: "日学習", level: 6 },
    { name: "三百時間の王者", icon: "👑", value: totalHours, goal: 300, unit: "時間", level: 7 },
    { name: "まなびの伝説", icon: "💎", value: longestStreak, goal: 100, unit: "日連続", level: 7 },
  ];
  const levelBadges = [
    { name: "駆け出しの努力家", icon: "🥉", goal: 5, level: 1 },
    { name: "学びの冒険者", icon: "🗺️", goal: 10, level: 2 },
    { name: "継続の探究者", icon: "🔎", goal: 20, level: 2 },
    { name: "鍛錬の職人", icon: "🛠️", goal: 30, level: 3 },
    { name: "知識の開拓者", icon: "🚩", goal: 40, level: 3 },
    { name: "折り返しの賢者", icon: "🔮", goal: 50, level: 4 },
    { name: "不屈の挑戦者", icon: "🛡️", goal: 60, level: 4 },
    { name: "努力の求道者", icon: "⚔️", goal: 70, level: 5 },
    { name: "合格を狙う猛者", icon: "🎯", goal: 80, level: 5 },
    { name: "限界を超える者", icon: "🌌", goal: 90, level: 6 },
    { name: "夢の目前", icon: "🌠", goal: 99, level: 6 },
    { name: "五千時間の覇者", icon: "👑", goal: 100, level: 7 },
  ].map((badge) => ({
    ...badge,
    value: currentLevel,
    unit: "レベル",
  }));
  badges.push(...levelBadges);

  badgeList.replaceChildren();
  let unlockedCount = 0;
  badges.forEach((badge) => {
    const unlocked = badge.value >= badge.goal;
    if (unlocked) {
      unlockedCount += 1;
    }

    const item = document.createElement("div");
    item.className = `badge${unlocked ? ` unlocked level-${badge.level}` : ""}`;

    const icon = document.createElement("span");
    icon.className = "badge-icon";
    icon.textContent = unlocked ? badge.icon : "🔒";

    const name = document.createElement("strong");
    name.textContent = badge.name;

    const condition = document.createElement("small");
    condition.textContent = unlocked
      ? `${badge.goal}${badge.unit} 達成！`
      : `${Math.min(badge.value, badge.goal)} / ${badge.goal}${badge.unit}`;

    item.append(icon, name, condition);
    badgeList.append(item);
  });
  badgeCount.textContent = `${unlockedCount} / ${badges.length}`;
  currentTitle.textContent = getLevelTitle(currentLevel);
  return unlockedCount;
}

function renderCalendar() {
  calendar.replaceChildren();
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totals = studyMinutesByDate();
  const todayKey = localDateKey();
  const streaks = calculateStreaks();
  const holidaySet = new Set(holidays);

  calendarTitle.textContent = `${year}年 ${month + 1}月`;

  for (let index = 0; index < firstWeekday; index += 1) {
    calendar.append(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = localDateKey(date);
    const studiedMinutes = totals[dateKey] ?? 0;
    const isHoliday = holidaySet.has(dateKey);
    const isRescued = streaks.rescuedDays.has(dayNumber(dateKey));
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    if (dateKey === todayKey) cell.classList.add("today");
    if (studiedMinutes > 0) cell.classList.add("studied");
    if (isHoliday && studiedMinutes === 0) cell.classList.add("holiday");
    if (isRescued && studiedMinutes === 0) cell.classList.add("rescued");
    if (dailyGoal > 0 && studiedMinutes >= dailyGoal) {
      cell.classList.add("goal-achieved");
    }

    const dateNumber = document.createElement("span");
    dateNumber.className = "calendar-date";
    dateNumber.textContent = day;
    cell.append(dateNumber);

    if (studiedMinutes > 0) {
      const time = document.createElement("span");
      time.className = "calendar-time";
      time.textContent = formatMinutes(studiedMinutes);
      cell.append(time);
      cell.title = `${dateKey}: ${formatMinutes(studiedMinutes)}`;
    } else if (isHoliday || isRescued) {
      const status = document.createElement("span");
      status.className = "calendar-time";
      status.textContent = isHoliday ? "休日" : "救済";
      cell.append(status);
      cell.title = `${dateKey}: ${status.textContent}`;
    }
    calendar.append(cell);
  }
}

function renderHolidays() {
  holidayList.replaceChildren();
  const sortedHolidays = [...holidays].sort();
  if (sortedHolidays.length === 0) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = "設定された休日はありません。";
    holidayList.append(empty);
    return;
  }

  sortedHolidays.forEach((date) => {
    const chip = document.createElement("span");
    chip.className = "holiday-chip";
    chip.append(document.createTextNode(date));

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `${date}の休日設定を削除`);
    removeButton.addEventListener("click", () => {
      holidays = holidays.filter((holiday) => holiday !== date);
      saveHolidays();
      render();
    });
    chip.append(removeButton);
    holidayList.append(chip);
  });
}

function renderMockResults() {
  mockChart.replaceChildren();
  mockEmpty.hidden = mockResults.length > 0;
  const groups = new Map();
  mockResults.forEach((result) => {
    const key = `${result.date}\u0000${result.name}`;
    if (!groups.has(key)) {
      groups.set(key, { name: result.name, date: result.date, results: [] });
    }
    groups.get(key).results.push(result);
  });

  const createBar = (result, removeHandler) => {
    const isLegacyScore = !Number.isFinite(result.deviation);
    const isOverall = result.subject === "総合";
    const barValue = isLegacyScore
      ? Math.round((result.score / result.maxScore) * 100)
      : result.deviation;
    const item = document.createElement("div");
    item.className =
      `mock-result${isOverall ? " overall" : ""}${isLegacyScore ? " legacy" : ""}`;

    const title = document.createElement("span");
    title.className = "mock-result-title";
    title.textContent = `${result.subject}${isLegacyScore ? "（旧得点）" : ""}`;

    const value = document.createElement("span");
    value.className = "mock-result-value";
    value.textContent = isLegacyScore
      ? `${result.score}/${result.maxScore}`
      : `偏差値 ${Number(result.deviation.toFixed(1))}`;

    const track = document.createElement("div");
    track.className = "mock-bar-track";
    const bar = document.createElement("div");
    bar.className = "mock-bar";
    bar.style.width = `${Math.min(100, barValue)}%`;
    track.append(bar);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "mock-delete";
    removeButton.textContent = "削除";
    removeButton.addEventListener("click", removeHandler);

    item.append(title, value, track, removeButton);
    return item;
  };

  [...groups.values()]
    .sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name, "ja"))
    .forEach((group) => {
      const groupElement = document.createElement("section");
      groupElement.className = "mock-group";

      const header = document.createElement("div");
      header.className = "mock-group-header";
      const heading = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = group.name;
      const date = document.createElement("small");
      date.textContent = group.date;
      heading.append(name, date);

      const removeGroupButton = document.createElement("button");
      removeGroupButton.type = "button";
      removeGroupButton.className = "mock-delete";
      removeGroupButton.textContent = "模試を削除";
      removeGroupButton.addEventListener("click", () => {
        const ids = new Set(group.results.map((result) => result.id));
        mockResults = mockResults.filter((result) => !ids.has(result.id));
        saveMockResults();
        renderMockResults();
      });
      header.append(heading, removeGroupButton);

      const bars = document.createElement("div");
      bars.className = "mock-bars";
      const sortedResults = [...group.results].sort((a, b) => {
        if (a.subject === "総合") return -1;
        if (b.subject === "総合") return 1;
        return a.subject.localeCompare(b.subject, "ja");
      });
      sortedResults
        .forEach((result) => {
          bars.append(createBar(
            result,
            () => {
              mockResults = mockResults.filter((item) => item.id !== result.id);
              saveMockResults();
              renderMockResults();
            },
          ));
        });
      if (!group.results.some((result) => result.subject === "総合")) {
        const missingTotal = document.createElement("p");
        missingTotal.className = "mock-total-missing";
        missingTotal.textContent = "総合偏差値は未入力です。";
        bars.prepend(missingTotal);
      }

      groupElement.append(header, bars);
      mockChart.append(groupElement);
    });
}

function renderLevelAndProfile(totalMinutes, streaks, unlockedBadgeCount) {
  const levelInfo = calculateLevel(totalMinutes);
  const title = getLevelTitle(levelInfo.level);
  const initial = Array.from(profile.name)[0] ?? "学";

  levelNumber.textContent = levelInfo.level;
  levelTitle.textContent = title;
  levelBar.style.width = `${levelInfo.progress}%`;
  levelTrack.setAttribute("aria-valuenow", String(Math.round(levelInfo.progress)));
  nextLevelText.textContent = levelInfo.level === 100
    ? "最高レベル到達。5000時間を積み上げた証です。"
    : `次のレベルまで ${formatMinutes(levelInfo.remainingMinutes)}`;
  ultimateGoalLabel.textContent = profile.goal;
  fiveThousandProgress.textContent =
    `${Math.floor(totalMinutes / 60)} / ${MAX_LEVEL_HOURS}時間`;

  profileInitial.textContent = initial;
  profileLargeInitial.textContent = initial;
  profileDisplayName.textContent = profile.name;
  profileDisplayTitle.textContent = title;
  profileLevel.textContent = levelInfo.level;
  profileHours.textContent = formatMinutes(totalMinutes);
  profileStreak.textContent = `${streaks.current}日`;
  profileBadges.textContent = `${unlockedBadgeCount}個`;
}

function showLevelUp(newLevel) {
  clearTimeout(levelUpTimer);
  levelUpMessage.textContent = `レベル${newLevel}「${getLevelTitle(newLevel)}」`;
  levelUpToast.hidden = false;
  levelUpTimer = setTimeout(() => {
    levelUpToast.hidden = true;
  }, 3500);
}

function render() {
  recordList.replaceChildren();
  emptyMessage.hidden = records.length > 0;
  deleteAllButton.hidden = records.length === 0;

  for (const record of records) {
    const item = template.content.cloneNode(true);
    item.querySelector(".record-subject").textContent = record.subject;
    item.querySelector(".record-date").textContent = record.date;
    const words = Number(record.wordCount) || 0;
    item.querySelector(".record-words").textContent =
      words > 0 ? `英単語 ${words}個` : "";
    item.querySelector(".record-minutes").textContent = formatMinutes(record.minutes);
    item.querySelector(".delete-button").addEventListener("click", () => {
      records = records.filter((item) => item.id !== record.id);
      saveRecords();
      render();
    });
    recordList.append(item);
  }

  const total = records.reduce((sum, record) => sum + record.minutes, 0);
  const today = records
    .filter((record) => record.date === localDateKey())
    .reduce((sum, record) => sum + record.minutes, 0);
  const totalWordCount = records.reduce(
    (sum, record) => sum + (Number(record.wordCount) || 0),
    0,
  );
  const todayWordCount = records
    .filter((record) => record.date === localDateKey())
    .reduce((sum, record) => sum + (Number(record.wordCount) || 0), 0);
  const streaks = calculateStreaks();
  const studyDayCount = new Set(records.map((record) => record.date)).size;
  const currentLevel = calculateLevel(total).level;

  allTotal.textContent = formatMinutes(total);
  todayTotal.textContent = formatMinutes(today);
  todayWords.textContent = `${todayWordCount}個`;
  allWords.textContent = `累計 ${totalWordCount}個`;
  currentStreak.textContent = `${streaks.current}日`;
  currentStreak.classList.toggle("burning", streaks.current > 0);
  bestStreak.textContent = `最長 ${streaks.best}日`;
  rescueCount.textContent = `救済 ${streaks.rescuedDays.size}回`;
  goalDisplay.textContent = dailyGoal > 0 ? formatMinutes(dailyGoal) : "未設定";
  if (dailyGoal === 0) {
    goalProgress.textContent = "目標を設定してみよう";
    achievementRate.textContent = "未設定";
    achievementMessage.textContent = "目標がなければ達成もない。まず今日の基準を決めよう。";
    progressBar.style.width = "0%";
    progressBar.classList.remove("completed");
    progressTrack.setAttribute("aria-valuenow", "0");
  } else if (today >= dailyGoal) {
    const rate = Math.floor((today / dailyGoal) * 100);
    goalProgress.textContent = "今日の目標達成！";
    achievementRate.textContent = `${rate}%`;
    achievementMessage.textContent = "目標達成。よくやった。でも合格までは、この積み重ねを止めない。";
    progressBar.style.width = "100%";
    progressBar.classList.add("completed");
    progressTrack.setAttribute("aria-valuenow", "100");
  } else {
    const rate = Math.floor((today / dailyGoal) * 100);
    goalProgress.textContent = `目標まであと${formatMinutes(dailyGoal - today)}`;
    achievementRate.textContent = `${rate}%`;
    achievementMessage.textContent = today === 0
      ? "まだ0分。目標は行動して初めて意味がある。今すぐ始めよう。"
      : `残り${formatMinutes(dailyGoal - today)}。まだ終わっていない。今日の目標は今日やり切ろう。`;
    progressBar.style.width = `${rate}%`;
    progressBar.classList.remove("completed");
    progressTrack.setAttribute("aria-valuenow", String(rate));
  }
  const unlockedBadgeCount = renderBadges(
    total,
    streaks.best,
    totalWordCount,
    studyDayCount,
    currentLevel,
  );
  renderLevelAndProfile(total, streaks, unlockedBadgeCount);
  renderHolidays();
  renderMockResults();
  renderSubjectChart();
  renderCalendar();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const previousTotal = records.reduce((sum, record) => sum + record.minutes, 0);
  const previousLevel = calculateLevel(previousTotal).level;
  const subject = subjectInput.value.trim();
  const studyHours = Number(studyHoursInput.value);
  const studyMinutes = Number(studyMinutesInput.value);
  const minutes = studyHours * 60 + studyMinutes;
  const wordCount = wordCountInput.value === "" ? 0 : Number(wordCountInput.value);
  if (
    !subject
    || !Number.isInteger(studyHours) || studyHours < 0 || studyHours > 23
    || !Number.isInteger(studyMinutes) || studyMinutes < 0 || studyMinutes > 59
    || minutes < 1
    || !Number.isInteger(wordCount) || wordCount < 0 || wordCount > 10000
  ) {
    alert("勉強時間を1分以上、23時間59分以内で入力してください。");
    return;
  }

  records.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    subject,
    minutes,
    wordCount,
    date: localDateKey(),
  });
  saveRecords();
  render();
  const newLevel = calculateLevel(previousTotal + minutes).level;
  if (newLevel > previousLevel) {
    showLevelUp(newLevel);
  }
  form.reset();
  subjectInput.focus();
});

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const hours = Number(goalHoursInput.value);
  const minutes = Number(goalMinutesInput.value);
  if (
    !Number.isInteger(hours) || !Number.isInteger(minutes)
    || hours < 0 || hours > 23 || minutes < 0 || minutes > 59
    || hours + minutes === 0
  ) {
    alert("目標時間を1分以上に設定してください。");
    return;
  }

  dailyGoal = hours * 60 + minutes;
  localStorage.setItem(GOAL_KEY, String(dailyGoal));
  render();
});

holidayForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = holidayDateInput.value;
  if (!date || holidays.includes(date)) {
    alert(date ? "その日はすでに休日に設定されています。" : "休日の日付を選んでください。");
    return;
  }

  holidays.push(date);
  saveHolidays();
  render();
});

mockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = mockNameInput.value.trim();
  const date = mockDateInput.value;
  const subject = mockSubjectInput.value.trim();
  const deviation = Number(mockDeviationInput.value);
  if (
    !name || !date || !subject
    || !Number.isFinite(deviation) || deviation < 0 || deviation > 100
  ) {
    alert("模試名・受験日・科目・偏差値を確認してください。偏差値は0〜100で入力します。");
    return;
  }

  const existing = mockResults.find(
    (result) => (
      result.name === name
      && result.date === date
      && result.subject === subject
    ),
  );
  if (existing) {
    existing.deviation = deviation;
    delete existing.score;
    delete existing.maxScore;
  } else {
    mockResults.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      date,
      subject,
      deviation,
    });
  }
  saveMockResults();
  renderMockResults();
  mockSubjectInput.value = "";
  mockDeviationInput.value = "";
  mockSubjectInput.focus();
});

profileButton.addEventListener("click", () => {
  profileNameInput.value = profile.name;
  ultimateGoalInput.value = profile.goal;
  profileDialog.showModal();
});

profileCloseButton.addEventListener("click", () => {
  profileDialog.close();
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = profileNameInput.value.trim();
  const goal = ultimateGoalInput.value.trim();
  if (!name || !goal) {
    alert("表示名と最終目標を入力してください。");
    return;
  }

  profile = { name, goal };
  saveProfile();
  render();
  profileDialog.close();
});

deleteAllButton.addEventListener("click", () => {
  if (confirm("すべての勉強記録を削除しますか？")) {
    records = [];
    saveRecords();
    render();
  }
});

previousMonthButton.addEventListener("click", () => {
  visibleMonth.setMonth(visibleMonth.getMonth() - 1);
  renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
  visibleMonth.setMonth(visibleMonth.getMonth() + 1);
  renderCalendar();
});

periodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    chartPeriod = button.dataset.period;
    periodButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderSubjectChart();
  });
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedTab = button.dataset.tab;
    tabButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", String(selected));
    });
    tabPanels.forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== selectedTab;
    });
  });
});

updateCountdown();
setInterval(updateCountdown, 60000);
render();

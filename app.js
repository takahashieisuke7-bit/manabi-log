"use strict";

const STORAGE_KEY = "study-records-v1";
const GOAL_KEY = "study-daily-goal-v1";
const EXAM_DATE = new Date("2027-01-16T09:30:00+09:00");

const form = document.querySelector("#studyForm");
const goalForm = document.querySelector("#goalForm");
const subjectInput = document.querySelector("#subject");
const minutesInput = document.querySelector("#minutes");
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
const deleteAllButton = document.querySelector("#deleteAll");
const template = document.querySelector("#recordTemplate");
const calendar = document.querySelector("#calendar");
const calendarTitle = document.querySelector("#calendarTitle");
const previousMonthButton = document.querySelector("#previousMonth");
const nextMonthButton = document.querySelector("#nextMonth");

let records = loadRecords();
let dailyGoal = loadDailyGoal();
let visibleMonth = new Date();
visibleMonth.setDate(1);
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
  const studyDays = [...new Set(records.map((record) => record.date))]
    .map(dayNumber)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  if (studyDays.length === 0) {
    return { current: 0, best: 0 };
  }

  let best = 1;
  let running = 1;
  for (let index = 1; index < studyDays.length; index += 1) {
    running = studyDays[index] === studyDays[index - 1] + 1 ? running + 1 : 1;
    best = Math.max(best, running);
  }

  const today = dayNumber(localDateKey());
  const lastStudyDay = studyDays.at(-1);
  if (lastStudyDay < today - 1) {
    return { current: 0, best };
  }

  let current = 1;
  for (let index = studyDays.length - 1; index > 0; index -= 1) {
    if (studyDays[index] !== studyDays[index - 1] + 1) break;
    current += 1;
  }
  return { current, best };
}

function renderBadges(longestStreak, totalWordCount) {
  const badges = [
    { name: "はじめの一歩", icon: "🌱", value: longestStreak, goal: 1, unit: "日連続" },
    { name: "三日坊主卒業", icon: "🔥", value: longestStreak, goal: 3, unit: "日連続" },
    { name: "1週間マスター", icon: "⭐", value: longestStreak, goal: 7, unit: "日連続" },
    { name: "継続の達人", icon: "🏅", value: longestStreak, goal: 14, unit: "日連続" },
    { name: "習慣化マスター", icon: "🏆", value: longestStreak, goal: 30, unit: "日連続" },
    { name: "単語コレクター", icon: "📘", value: totalWordCount, goal: 500, unit: "単語" },
    { name: "まなびの伝説", icon: "💎", value: longestStreak, goal: 100, unit: "日連続" },
  ];

  badgeList.replaceChildren();
  let unlockedCount = 0;
  badges.forEach((badge, index) => {
    const unlocked = badge.value >= badge.goal;
    if (unlocked) unlockedCount += 1;

    const item = document.createElement("div");
    item.className = `badge${unlocked ? ` unlocked level-${index + 1}` : ""}`;

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
}

function renderCalendar() {
  calendar.replaceChildren();
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totals = studyMinutesByDate();
  const todayKey = localDateKey();

  calendarTitle.textContent = `${year}年 ${month + 1}月`;

  for (let index = 0; index < firstWeekday; index += 1) {
    calendar.append(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = localDateKey(date);
    const studiedMinutes = totals[dateKey] ?? 0;
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    if (dateKey === todayKey) cell.classList.add("today");
    if (studiedMinutes > 0) cell.classList.add("studied");
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
    }
    calendar.append(cell);
  }
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
    item.querySelector(".record-minutes").textContent = `${record.minutes}分`;
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

  allTotal.textContent = formatMinutes(total);
  todayTotal.textContent = formatMinutes(today);
  todayWords.textContent = `${todayWordCount}個`;
  allWords.textContent = `累計 ${totalWordCount}個`;
  currentStreak.textContent = `${streaks.current}日`;
  bestStreak.textContent = `最長 ${streaks.best}日`;
  goalDisplay.textContent = dailyGoal > 0 ? formatMinutes(dailyGoal) : "未設定";
  if (dailyGoal === 0) {
    goalProgress.textContent = "目標を設定してみよう";
    achievementRate.textContent = "未設定";
    achievementMessage.textContent = "目標時間を設定すると表示されます";
    progressBar.style.width = "0%";
    progressBar.classList.remove("completed");
    progressTrack.setAttribute("aria-valuenow", "0");
  } else if (today >= dailyGoal) {
    const rate = Math.floor((today / dailyGoal) * 100);
    goalProgress.textContent = "今日の目標達成！";
    achievementRate.textContent = `${rate}%`;
    achievementMessage.textContent = "目標達成！すばらしい！";
    progressBar.style.width = "100%";
    progressBar.classList.add("completed");
    progressTrack.setAttribute("aria-valuenow", "100");
  } else {
    const rate = Math.floor((today / dailyGoal) * 100);
    goalProgress.textContent = `目標まであと${formatMinutes(dailyGoal - today)}`;
    achievementRate.textContent = `${rate}%`;
    achievementMessage.textContent = "あと少し、積み重ねていこう";
    progressBar.style.width = `${rate}%`;
    progressBar.classList.remove("completed");
    progressTrack.setAttribute("aria-valuenow", String(rate));
  }
  renderBadges(streaks.best, totalWordCount);
  renderCalendar();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const subject = subjectInput.value.trim();
  const minutes = Number(minutesInput.value);
  const wordCount = wordCountInput.value === "" ? 0 : Number(wordCountInput.value);
  if (
    !subject || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440
    || !Number.isInteger(wordCount) || wordCount < 0 || wordCount > 10000
  ) {
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

updateCountdown();
setInterval(updateCountdown, 60000);
render();

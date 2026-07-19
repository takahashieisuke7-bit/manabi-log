"use strict";

const STORAGE_KEY = "study-records-v1";
const GOAL_KEY = "study-daily-goal-v1";
const HOLIDAYS_KEY = "study-holidays-v1";
const PROFILE_KEY = "study-profile-v1";
const MOCK_RESULTS_KEY = "study-mock-results-v1";
const TODOS_KEY = "study-todos-v1";
const SUBJECT_GOALS_KEY = "study-subject-goals-v1";
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
const unlockedTitleCount = document.querySelector("#unlockedTitleCount");
const unlockedTitleList = document.querySelector("#unlockedTitleList");
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
const mockRoundInput = document.querySelector("#mockRound");
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
const exportBackupButton = document.querySelector("#exportBackup");
const backupFileInput = document.querySelector("#backupFile");
const backupStatus = document.querySelector("#backupStatus");
const todoForm = document.querySelector("#todoForm");
const todoInput = document.querySelector("#todoInput");
const todoList = document.querySelector("#todoList");
const todoEmpty = document.querySelector("#todoEmpty");
const todoProgress = document.querySelector("#todoProgress");
const todoBadge = document.querySelector("#todoBadge");
const weeklyRange = document.querySelector("#weeklyRange");
const weeklySummary = document.querySelector("#weeklySummary");
const weeklyReviewGrid = document.querySelector("#weeklyReviewGrid");
const weeklyAdvice = document.querySelector("#weeklyAdvice");
const weaknessPrimaryList = document.querySelector("#weaknessPrimaryList");
const weaknessList = document.querySelector("#weaknessList");
const weaknessMoreDetails = document.querySelector("#weaknessMoreDetails");
const weaknessMoreSummary = document.querySelector("#weaknessMoreSummary");
const badgeFilterButtons = document.querySelectorAll("[data-badge-filter]");
const subjectGoalForm = document.querySelector("#subjectGoalForm");
const subjectGoalNameInput = document.querySelector("#subjectGoalName");
const subjectGoalHoursInput = document.querySelector("#subjectGoalHours");
const subjectGoalMinutesInput = document.querySelector("#subjectGoalMinutes");
const subjectGoalList = document.querySelector("#subjectGoalList");
const subjectGoalEmpty = document.querySelector("#subjectGoalEmpty");
const subjectGoalCount = document.querySelector("#subjectGoalCount");

let records = loadRecords();
let dailyGoal = loadDailyGoal();
let holidays = loadHolidays();
let profile = loadProfile();
let mockResults = loadMockResults();
let todos = loadTodos();
let subjectGoals = loadSubjectGoals();
let visibleMonth = new Date();
let chartPeriod = "day";
let badgeFilter = "all";
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
    return sanitizeRecords(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []);
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function loadDailyGoal() {
  const savedGoal = Number(localStorage.getItem(GOAL_KEY));
  return sanitizeDailyGoal(savedGoal);
}

function loadHolidays() {
  try {
    const saved = JSON.parse(localStorage.getItem(HOLIDAYS_KEY)) ?? [];
    return sanitizeHolidays(saved);
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
        round: Number.isInteger(Number(result.round))
          && Number(result.round) >= 1
          && Number(result.round) <= 99
          ? Number(result.round)
          : null,
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

function loadTodos() {
  try {
    return sanitizeTodos(JSON.parse(localStorage.getItem(TODOS_KEY)) ?? []);
  } catch {
    return [];
  }
}

function loadSubjectGoals() {
  try {
    return sanitizeSubjectGoals(JSON.parse(localStorage.getItem(SUBJECT_GOALS_KEY)) ?? []);
  } catch {
    return [];
  }
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function sanitizeRecords(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((record) => {
    const subject = typeof record?.subject === "string" ? record.subject.trim() : "";
    const minutes = Number(record?.minutes);
    const wordCount = Number(record?.wordCount ?? 0);
    if (
      !subject
      || !isDateKey(record?.date)
      || !Number.isInteger(minutes) || minutes < 1 || minutes > 23 * 60 + 59
      || !Number.isInteger(wordCount) || wordCount < 0 || wordCount > 10000
    ) {
      return [];
    }
    return [{
      id: String(record.id ?? createId()),
      subject,
      minutes,
      wordCount,
      date: record.date,
    }];
  });
}

function sanitizeDailyGoal(value) {
  const goal = Number(value);
  return Number.isInteger(goal) && goal > 0 && goal <= 23 * 60 + 59 ? goal : 0;
}

function sanitizeHolidays(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(isDateKey))].sort();
}

function sanitizeProfile(value) {
  const name = typeof value?.name === "string" && value.name.trim()
    ? value.name.trim().slice(0, 20)
    : "学習者";
  const goal = typeof value?.goal === "string" && value.goal.trim()
    ? value.goal.trim().slice(0, 40)
    : "慶応大学合格";
  return { name, goal };
}

function sanitizeMockResults(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((result) => {
    if (
      typeof result?.name !== "string" || !result.name.trim()
      || !isDateKey(result.date)
    ) {
      return [];
    }

    const base = {
      id: String(result.id ?? createId()),
      name: result.name.trim().slice(0, 30),
      date: result.date,
      round: Number.isInteger(Number(result.round))
        && Number(result.round) >= 1
        && Number(result.round) <= 99
        ? Number(result.round)
        : null,
      subject: typeof result.subject === "string" && result.subject.trim()
        ? result.subject.trim().slice(0, 30)
        : "総合",
    };
    const deviation = Number(result.deviation);
    if (Number.isFinite(deviation) && deviation >= 0 && deviation <= 100) {
      return [{ ...base, deviation }];
    }

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
}

function sanitizeTodos(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((todo) => {
    const text = typeof todo?.text === "string" ? todo.text.trim().slice(0, 50) : "";
    const date = isDateKey(todo?.date) ? todo.date : localDateKey();
    if (!text) return [];
    return [{
      id: String(todo.id ?? createId()),
      text,
      date,
      done: Boolean(todo.done),
    }];
  });
}

function sanitizeSubjectGoals(value) {
  if (!Array.isArray(value)) return [];
  const goals = new Map();
  value.forEach((goal) => {
    const subject = typeof goal?.subject === "string" ? goal.subject.trim().slice(0, 30) : "";
    const minutes = Number(goal?.minutes);
    if (
      subject
      && Number.isInteger(minutes)
      && minutes >= 1
      && minutes <= 23 * 60 + 59
    ) {
      goals.set(subject, { subject, minutes });
    }
  });
  return [...goals.values()].sort((a, b) => a.subject.localeCompare(b.subject, "ja"));
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

function saveTodos() {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

function saveSubjectGoals() {
  localStorage.setItem(SUBJECT_GOALS_KEY, JSON.stringify(subjectGoals));
}

function saveDailyGoal() {
  if (dailyGoal > 0) {
    localStorage.setItem(GOAL_KEY, String(dailyGoal));
  } else {
    localStorage.removeItem(GOAL_KEY);
  }
}

function saveAllData() {
  saveRecords();
  saveDailyGoal();
  saveHolidays();
  saveProfile();
  saveMockResults();
  saveTodos();
  saveSubjectGoals();
}

function setBackupStatus(message, type = "") {
  backupStatus.textContent = message;
  backupStatus.classList.toggle("success", type === "success");
  backupStatus.classList.toggle("error", type === "error");
}

function createBackupPayload() {
  return {
    app: "manabi-log",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      records,
      dailyGoal,
      holidays,
      profile,
      mockResults,
      todos,
      subjectGoals,
    },
  };
}

function exportBackup() {
  const payload = createBackupPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `manabi-log-backup-${localDateKey()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setBackupStatus("バックアップファイルを書き出しました。スマホの「ダウンロード」や「ファイル」に保存されます。", "success");
}

function readBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("invalid-backup");
  }

  const source = payload.data && typeof payload.data === "object" ? payload.data : payload;
  const hasBackupData = [
    "records",
    "dailyGoal",
    "holidays",
    "profile",
    "mockResults",
    "todos",
    "subjectGoals",
  ]
    .some((key) => Object.prototype.hasOwnProperty.call(source, key));
  if (!hasBackupData) {
    throw new Error("invalid-backup");
  }

  return {
    records: sanitizeRecords(source.records ?? []),
    dailyGoal: sanitizeDailyGoal(source.dailyGoal ?? 0),
    holidays: sanitizeHolidays(source.holidays ?? []),
    profile: sanitizeProfile(source.profile ?? {}),
    mockResults: sanitizeMockResults(source.mockResults ?? []),
    todos: sanitizeTodos(source.todos ?? []),
    subjectGoals: sanitizeSubjectGoals(source.subjectGoals ?? []),
  };
}

async function importBackup(file) {
  if (!file) return;

  try {
    const payload = readBackupPayload(JSON.parse(await file.text()));
    const ok = confirm("バックアップを復元します。今この端末に入っている記録は、選んだバックアップ内容で上書きされます。続けますか？");
    if (!ok) {
      setBackupStatus("復元をキャンセルしました。今の記録はそのままです。");
      return;
    }

    records = payload.records;
    dailyGoal = payload.dailyGoal;
    holidays = payload.holidays;
    profile = payload.profile;
    mockResults = payload.mockResults;
    todos = payload.todos;
    subjectGoals = payload.subjectGoals;
    saveAllData();

    goalHoursInput.value = dailyGoal > 0 ? Math.floor(dailyGoal / 60) : 1;
    goalMinutesInput.value = dailyGoal > 0 ? dailyGoal % 60 : 0;
    profileNameInput.value = profile.name;
    ultimateGoalInput.value = profile.goal;
    render();
    setBackupStatus("バックアップを復元しました。記録・目標・プロフィール・模試結果・やること・科目別目標を更新しました。", "success");
  } catch {
    setBackupStatus("このファイルは読み込めませんでした。まなびログのバックアップファイルを選んでください。", "error");
  } finally {
    backupFileInput.value = "";
  }
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

function weekRange(offsetWeeks = 0) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const daysFromMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysFromMonday + offsetWeeks * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end, startKey: localDateKey(start), endKey: localDateKey(end) };
}

function recordsInRange(startKey, endKey) {
  return records.filter((record) => record.date >= startKey && record.date <= endKey);
}

function minutesBySubject(sourceRecords) {
  return sourceRecords.reduce((totals, record) => {
    totals.set(record.subject, (totals.get(record.subject) ?? 0) + record.minutes);
    return totals;
  }, new Map());
}

function todayMinutesBySubject() {
  return minutesBySubject(records.filter((record) => record.date === localDateKey()));
}

function latestMockDeviationBySubject() {
  const latest = new Map();
  mockResults
    .filter((result) => Number.isFinite(Number(result.deviation)))
    .sort((a, b) => (
      a.date.localeCompare(b.date)
      || Number(a.round ?? 0) - Number(b.round ?? 0)
    ))
    .forEach((result) => {
      latest.set(result.subject, Number(result.deviation));
    });
  return latest;
}

function renderTodos() {
  const todayKey = localDateKey();
  const todaysTodos = todos.filter((todo) => todo.date === todayKey);
  const doneCount = todaysTodos.filter((todo) => todo.done).length;

  todoList.replaceChildren();
  todoEmpty.hidden = todaysTodos.length > 0;
  todoBadge.textContent = `${doneCount} / ${todaysTodos.length}`;
  if (todaysTodos.length === 0) {
    todoProgress.textContent = "今日の勝ち筋を作ろう。";
  } else if (doneCount === todaysTodos.length) {
    todoProgress.textContent = "今日のやること完了。いい流れ、そのまま積もう。";
  } else {
    todoProgress.textContent = `残り${todaysTodos.length - doneCount}個。迷う時間を減らして、上から潰そう。`;
  }

  todaysTodos.forEach((todo) => {
    const item = document.createElement("label");
    item.className = `todo-item${todo.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => {
      todos = todos.map((item) => (
        item.id === todo.id ? { ...item, done: checkbox.checked } : item
      ));
      saveTodos();
      renderTodos();
      renderWeeklyReview();
      renderWeaknessAlerts();
    });

    const text = document.createElement("span");
    text.textContent = todo.text;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "todo-delete";
    remove.setAttribute("aria-label", "やることを削除");
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      todos = todos.filter((item) => item.id !== todo.id);
      saveTodos();
      renderTodos();
      renderWeaknessAlerts();
    });

    item.append(checkbox, text, remove);
    todoList.append(item);
  });
}

function renderSubjectGoals() {
  const todayTotals = todayMinutesBySubject();
  subjectGoalList.replaceChildren();
  subjectGoalEmpty.hidden = subjectGoals.length > 0;
  subjectGoalCount.textContent = `${subjectGoals.length}科目`;

  subjectGoals.forEach((goal) => {
    const studied = todayTotals.get(goal.subject) ?? 0;
    const rate = Math.min(100, Math.floor((studied / goal.minutes) * 100));
    const row = document.createElement("div");
    row.className = "subject-goal-row";

    const heading = document.createElement("div");
    heading.className = "subject-goal-heading";
    const name = document.createElement("strong");
    name.textContent = goal.subject;
    const meta = document.createElement("span");
    meta.textContent = `${formatMinutes(studied)} / ${formatMinutes(goal.minutes)}`;
    heading.append(name, meta);

    const track = document.createElement("div");
    track.className = "subject-goal-track";
    const bar = document.createElement("div");
    bar.className = studied >= goal.minutes ? "subject-goal-bar completed" : "subject-goal-bar";
    bar.style.width = `${rate}%`;
    track.append(bar);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "subject-goal-delete";
    remove.textContent = "削除";
    remove.addEventListener("click", () => {
      subjectGoals = subjectGoals.filter((item) => item.subject !== goal.subject);
      saveSubjectGoals();
      renderSubjectGoals();
      renderWeaknessAlerts();
    });

    row.append(heading, track, remove);
    subjectGoalList.append(row);
  });
}

function renderWeeklyReview() {
  const current = weekRange(0);
  const previous = weekRange(-1);
  const currentRecords = recordsInRange(current.startKey, current.endKey);
  const previousRecords = recordsInRange(previous.startKey, previous.endKey);
  const currentTotal = currentRecords.reduce((sum, record) => sum + record.minutes, 0);
  const previousTotal = previousRecords.reduce((sum, record) => sum + record.minutes, 0);
  const delta = currentTotal - previousTotal;
  const subjectTotals = [...minutesBySubject(currentRecords).entries()]
    .sort((a, b) => b[1] - a[1]);
  const goalAchievedDays = [...new Set(currentRecords.map((record) => record.date))]
    .filter((date) => dailyGoal > 0 && currentRecords
      .filter((record) => record.date === date)
      .reduce((sum, record) => sum + record.minutes, 0) >= dailyGoal)
    .length;
  const todoWeek = todos.filter((todo) => todo.date >= current.startKey && todo.date <= current.endKey);
  const doneTodos = todoWeek.filter((todo) => todo.done).length;

  weeklyRange.textContent = `${formatShortDate(current.start)}〜${formatShortDate(current.end)}`;
  weeklySummary.textContent = `今週 ${formatMinutes(currentTotal)}・やること ${doneTodos}/${todoWeek.length}`;
  weeklyReviewGrid.replaceChildren();
  [
    ["今週", formatMinutes(currentTotal)],
    ["先週との差", delta >= 0 ? `+${formatMinutes(delta)}` : `-${formatMinutes(Math.abs(delta))}`],
    ["目標達成日", dailyGoal > 0 ? `${goalAchievedDays}日` : "未設定"],
    ["やること", `${doneTodos} / ${todoWeek.length}`],
    ["一番多い科目", subjectTotals[0] ? `${subjectTotals[0][0]} ${formatMinutes(subjectTotals[0][1])}` : "まだなし"],
  ].forEach(([label, value]) => {
    const item = document.createElement("div");
    const small = document.createElement("span");
    small.textContent = label;
    const strong = document.createElement("strong");
    strong.textContent = value;
    item.append(small, strong);
    weeklyReviewGrid.append(item);
  });

  if (currentTotal === 0) {
    weeklyAdvice.textContent = "今週はまだ記録がありません。まず1回、短くても記録を残そう。";
  } else if (delta >= 0) {
    weeklyAdvice.textContent = "先週以上に積めています。油断せず、足りない科目を1つ潰すとさらに強い。";
  } else {
    weeklyAdvice.textContent = "先週より落ちています。原因を責めるより、今日の1タスクを確実に終わらせよう。";
  }
}

function renderWeaknessAlerts() {
  const alerts = [];
  const todayTotals = todayMinutesBySubject();
  const lastTwoWeeks = weekRange(0);
  const twoWeeksStart = new Date(lastTwoWeeks.start);
  twoWeeksStart.setDate(twoWeeksStart.getDate() - 7);
  const recentRecords = recordsInRange(localDateKey(twoWeeksStart), lastTwoWeeks.endKey);
  const recentSubjectTotals = [...minutesBySubject(recentRecords).entries()]
    .sort((a, b) => a[1] - b[1]);
  const latestDeviation = latestMockDeviationBySubject();

  if (todos.filter((todo) => todo.date === localDateKey()).length === 0) {
    alerts.push(["今日のやることが未設定", "ホーム一番上で、今日絶対やるタスクを1つだけでも入れよう。"]);
  }
  if (dailyGoal === 0) {
    alerts.push(["1日の目標が未設定", "記録タブで基準時間を決めよう。基準がないと勝ち負けが見えません。"]);
  }
  if (subjectGoals.length === 0) {
    alerts.push(["科目別目標が未設定", "英語・数学など、合格に必要な科目ごとの時間配分を決めよう。"]);
  }

  subjectGoals.forEach((goal) => {
    const studied = todayTotals.get(goal.subject) ?? 0;
    if (studied < goal.minutes) {
      alerts.push([
        `${goal.subject}が今日まだ不足`,
        `あと${formatMinutes(goal.minutes - studied)}で科目別目標に届きます。`,
      ]);
    }
  });

  [...latestDeviation.entries()]
    .filter(([subject, deviation]) => subject !== "総合" && deviation < 50)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .forEach(([subject, deviation]) => {
      alerts.push([
        `${subject}の偏差値が足を引っ張り気味`,
        `最新偏差値${deviation}。次はこの科目の復習タスクを入れる価値があります。`,
      ]);
    });

  if (recentSubjectTotals.length >= 2) {
    const [weakSubject, weakMinutes] = recentSubjectTotals[0];
    const [, strongestMinutes] = recentSubjectTotals[recentSubjectTotals.length - 1];
    if (strongestMinutes >= weakMinutes * 3 && strongestMinutes >= 180) {
      alerts.push([
        `${weakSubject}の時間が少なめ`,
        `直近2週間で${formatMinutes(weakMinutes)}。得意科目だけで押し切れるか確認しよう。`,
      ]);
    }
  }

  weaknessPrimaryList.replaceChildren();
  weaknessList.replaceChildren();
  const visibleAlerts = alerts.slice(0, 4);
  if (visibleAlerts.length === 0) {
    visibleAlerts.push(["今のところ大きな警告なし", "記録・目標・模試データが揃っています。この調子で更新しよう。"]);
  }

  const createAlertItem = ([title, message]) => {
    const item = document.createElement("div");
    item.className = "weakness-item";
    const strong = document.createElement("strong");
    strong.textContent = title;
    const small = document.createElement("small");
    small.textContent = message;
    item.append(strong, small);
    return item;
  };

  weaknessPrimaryList.append(createAlertItem(visibleAlerts[0]));
  const extraAlerts = visibleAlerts.slice(1);
  weaknessMoreDetails.hidden = extraAlerts.length === 0;
  weaknessMoreSummary.textContent = `ほかの警告を見る（${extraAlerts.length}件）`;
  extraAlerts.forEach((alert) => {
    weaknessList.append(createAlertItem(alert));
  });
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

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  countdown.textContent = `あと ${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`;
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

function calculateMockBadgeStats() {
  const validResults = mockResults.filter((result) => (
    Number.isFinite(Number(result.deviation))
    && Number(result.deviation) >= 0
    && Number(result.deviation) <= 100
  ));
  const totalResults = validResults.filter((result) => result.subject === "総合");
  const subjectResults = validResults.filter((result) => result.subject !== "総合");
  const bestAnyDeviation = validResults.reduce(
    (best, result) => Math.max(best, Number(result.deviation)),
    0,
  );
  const bestTotalDeviation = totalResults.reduce(
    (best, result) => Math.max(best, Number(result.deviation)),
    0,
  );
  const bestSubjectDeviation = subjectResults.reduce(
    (best, result) => Math.max(best, Number(result.deviation)),
    0,
  );
  const subjectBestMap = subjectResults.reduce((bestMap, result) => {
    const current = bestMap.get(result.subject) ?? 0;
    bestMap.set(result.subject, Math.max(current, Number(result.deviation)));
    return bestMap;
  }, new Map());
  const totalMockNames = new Set(totalResults.map((result) => result.name));
  const subjectGroups = new Map();
  validResults.forEach((result) => {
    const key = `${result.name}__${result.subject}`;
    const results = subjectGroups.get(key) ?? [];
    results.push(result);
    subjectGroups.set(key, results);
  });

  let bestDeviationGain = 0;
  subjectGroups.forEach((results) => {
    const sorted = [...results].sort((a, b) => (
      a.date.localeCompare(b.date)
      || Number(a.round ?? 0) - Number(b.round ?? 0)
    ));
    if (sorted.length < 2) return;
    const first = Number(sorted[0].deviation);
    const last = Number(sorted[sorted.length - 1].deviation);
    bestDeviationGain = Math.max(bestDeviationGain, last - first);
  });

  return {
    resultCount: validResults.length,
    totalResultCount: totalResults.length,
    totalMockCount: totalMockNames.size,
    bestAnyDeviation,
    bestTotalDeviation,
    bestSubjectDeviation,
    subjectsOver55: [...subjectBestMap.values()].filter((value) => value >= 55).length,
    subjectsOver60: [...subjectBestMap.values()].filter((value) => value >= 60).length,
    subjectsOver65: [...subjectBestMap.values()].filter((value) => value >= 65).length,
    bestDeviationGain: Math.max(0, Math.round(bestDeviationGain * 10) / 10),
  };
}

function formatBadgeValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function badgeCategory(badge) {
  if (badge.unit.includes("偏差値") || badge.unit === "UP" || badge.unit === "件" || badge.unit === "種類" || badge.unit === "科目") {
    return "mock";
  }
  if (badge.unit.includes("連続")) return "streak";
  if (badge.unit.includes("時間")) return "time";
  if (badge.unit.includes("単語")) return "word";
  if (badge.unit.includes("レベル")) return "level";
  return "study";
}

function renderBadges(totalMinutes, longestStreak, totalWordCount, studyDayCount, currentLevel) {
  const totalHours = Math.floor(totalMinutes / 60);
  const mockStats = calculateMockBadgeStats();
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
  badges.push(
    { name: "五百時間の開拓者", icon: "🧭", value: totalHours, goal: 500, unit: "時間", level: 7 },
    { name: "千時間の執念", icon: "🔥", value: totalHours, goal: 1000, unit: "時間", level: 7 },
    { name: "二千時間の挑戦者", icon: "⚔️", value: totalHours, goal: 2000, unit: "時間", level: 7 },
    { name: "三千時間の合格圏ハンター", icon: "🏹", value: totalHours, goal: 3000, unit: "時間", level: 7 },
    { name: "四千時間の怪物", icon: "🐉", value: totalHours, goal: 4000, unit: "時間", level: 7 },
    { name: "五千時間の覇者", icon: "👑", value: totalHours, goal: 5000, unit: "時間", level: 7 },
    { name: "二百日継続の鉄人", icon: "🛡️", value: longestStreak, goal: 200, unit: "日連続", level: 7 },
    { name: "一年継続の伝説", icon: "🌅", value: longestStreak, goal: 365, unit: "日連続", level: 7 },
    { name: "二百日学習の実力者", icon: "📚", value: studyDayCount, goal: 200, unit: "日学習", level: 7 },
    { name: "一年分の積み上げ", icon: "🗓️", value: studyDayCount, goal: 365, unit: "日学習", level: 7 },
    { name: "英単語五千の武器庫", icon: "🧰", value: totalWordCount, goal: 5000, unit: "単語", level: 7 },
    { name: "英単語一万の支配者", icon: "🦁", value: totalWordCount, goal: 10000, unit: "単語", level: 7 },
    { name: "模試デビュー", icon: "📈", value: mockStats.resultCount, goal: 1, unit: "件", level: 1 },
    { name: "総合偏差値の記録者", icon: "🎯", value: mockStats.totalResultCount, goal: 1, unit: "件", level: 2 },
    { name: "模試を追う者", icon: "🔎", value: mockStats.totalMockCount, goal: 3, unit: "種類", level: 3 },
    { name: "偏差値50突破", icon: "🚪", value: mockStats.bestAnyDeviation, goal: 50, unit: "偏差値", level: 3 },
    { name: "偏差値55の壁破り", icon: "🧱", value: mockStats.bestAnyDeviation, goal: 55, unit: "偏差値", level: 4 },
    { name: "偏差値60到達", icon: "🚀", value: mockStats.bestAnyDeviation, goal: 60, unit: "偏差値", level: 5 },
    { name: "偏差値65の上位戦士", icon: "⚡", value: mockStats.bestAnyDeviation, goal: 65, unit: "偏差値", level: 6 },
    { name: "偏差値70の怪物", icon: "💎", value: mockStats.bestAnyDeviation, goal: 70, unit: "偏差値", level: 7 },
    { name: "総合55突破", icon: "🏁", value: mockStats.bestTotalDeviation, goal: 55, unit: "総合偏差値", level: 4 },
    { name: "総合60到達", icon: "🏆", value: mockStats.bestTotalDeviation, goal: 60, unit: "総合偏差値", level: 5 },
    { name: "総合65の勝負師", icon: "🥇", value: mockStats.bestTotalDeviation, goal: 65, unit: "総合偏差値", level: 6 },
    { name: "総合70の合格請負人", icon: "🌟", value: mockStats.bestTotalDeviation, goal: 70, unit: "総合偏差値", level: 7 },
    { name: "得意科目の芽", icon: "🌱", value: mockStats.subjectsOver55, goal: 1, unit: "科目", level: 3 },
    { name: "二科目エース化", icon: "🦅", value: mockStats.subjectsOver60, goal: 2, unit: "科目", level: 5 },
    { name: "三科目の柱", icon: "🏛️", value: mockStats.subjectsOver65, goal: 3, unit: "科目", level: 6 },
    { name: "偏差値+3の反撃", icon: "↗️", value: mockStats.bestDeviationGain, goal: 3, unit: "UP", level: 4 },
    { name: "偏差値+5の逆転劇", icon: "📣", value: mockStats.bestDeviationGain, goal: 5, unit: "UP", level: 5 },
    { name: "偏差値+10の覚醒", icon: "✨", value: mockStats.bestDeviationGain, goal: 10, unit: "UP", level: 7 },
  );

  badgeList.replaceChildren();
  let unlockedCount = 0;
  let visibleBadgeCount = 0;
  const unlockedBadges = [];
  badges.forEach((badge) => {
    const unlocked = badge.value >= badge.goal;
    if (unlocked) {
      unlockedCount += 1;
      unlockedBadges.push(badge);
    }

    const category = badgeCategory(badge);
    const visible = badgeFilter === "all"
      || (badgeFilter === "unlocked" && unlocked)
      || (badgeFilter === "locked" && !unlocked)
      || badgeFilter === category;
    if (!visible) return;
    visibleBadgeCount += 1;

    const item = document.createElement("div");
    item.className = `badge${unlocked ? ` unlocked level-${badge.level}` : ""}`;
    item.dataset.category = category;

    const icon = document.createElement("span");
    icon.className = "badge-icon";
    icon.textContent = unlocked ? badge.icon : "🔒";

    const name = document.createElement("strong");
    name.textContent = badge.name;

    const condition = document.createElement("small");
    condition.textContent = unlocked
      ? `${badge.goal}${badge.unit} 達成！`
      : `${formatBadgeValue(Math.min(badge.value, badge.goal))} / ${badge.goal}${badge.unit}`;

    item.append(icon, name, condition);
    badgeList.append(item);
  });
  if (visibleBadgeCount === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "この条件の称号はまだありません。";
    badgeList.append(empty);
  }
  badgeCount.textContent = `${unlockedCount} / ${badges.length}`;
  currentTitle.textContent = getLevelTitle(currentLevel);
  unlockedTitleList.replaceChildren();
  unlockedTitleCount.textContent = unlockedCount > 0 ? `${unlockedCount}個獲得` : "まだなし";
  unlockedBadges.slice(0, 18).forEach((badge) => {
    const chip = document.createElement("span");
    chip.className = `unlocked-title-chip level-${badge.level}`;
    chip.textContent = `${badge.icon} ${badge.name}`;
    unlockedTitleList.append(chip);
  });
  if (unlockedBadges.length > 18) {
    const more = document.createElement("span");
    more.className = "unlocked-title-chip more";
    more.textContent = `+${unlockedBadges.length - 18}個`;
    unlockedTitleList.append(more);
  }
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

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function createSvgElement(tagName, attributes = {}, text = "") {
  const element = document.createElementNS(SVG_NAMESPACE, tagName);
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });
  if (text !== "") element.textContent = text;
  return element;
}

function createMockLineChart(titleText, events, series, featured = false) {
  const card = document.createElement("section");
  card.className = `line-chart-card${featured ? " featured" : ""}`;
  const title = document.createElement("h4");
  title.textContent = titleText;
  card.append(title);

  const activeSeries = series.filter((item) => item.values.size > 0);
  if (activeSeries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = featured
      ? "総合偏差値は未入力です。科目名を「総合」にして追加してください。"
      : "表示できる偏差値がありません。";
    card.append(empty);
    return card;
  }

  const legend = document.createElement("div");
  legend.className = "line-chart-legend";
  activeSeries.forEach((item) => {
    const legendItem = document.createElement("span");
    const swatch = document.createElement("i");
    swatch.style.background = item.color;
    legendItem.append(swatch, document.createTextNode(item.name));
    legend.append(legendItem);
  });
  card.append(legend);

  // 6〜8回程度は一目で比較でき、それ以上だけ横スクロールさせる。
  const width = Math.max(360, events.length * 54 + 72);
  const height = featured ? 340 : 290;
  const margin = { top: 22, right: 24, bottom: 66, left: 48 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xAt = (index) => events.length === 1
    ? margin.left + plotWidth / 2
    : margin.left + (plotWidth * index) / (events.length - 1);
  const yAt = (value) => margin.top + ((100 - value) / 100) * plotHeight;

  const scroll = document.createElement("div");
  scroll.className = "line-chart-scroll";
  const svg = createSvgElement("svg", {
    class: "mock-line-svg",
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    role: "img",
    "aria-label": `${titleText}。偏差値0から100`,
  });

  for (let value = 0; value <= 100; value += 10) {
    const y = yAt(value);
    svg.append(createSvgElement("line", {
      x1: margin.left,
      y1: y,
      x2: width - margin.right,
      y2: y,
      class: value === 0 ? "chart-axis-line" : "chart-grid-line",
    }));
    svg.append(createSvgElement("text", {
      x: margin.left - 8,
      y: y + 4,
      "text-anchor": "end",
      class: "chart-axis-label",
    }, value));
  }

  events.forEach((event, index) => {
    const x = xAt(index);
    svg.append(createSvgElement("line", {
      x1: x,
      y1: margin.top,
      x2: x,
      y2: height - margin.bottom,
      class: "chart-vertical-guide",
    }));
    const label = createSvgElement("text", {
      x,
      y: height - margin.bottom + 22,
      "text-anchor": "middle",
      class: "chart-x-label",
    });
    label.append(
      createSvgElement("tspan", { x, dy: 0 }, event.round ? `第${event.round}回` : "回数未設定"),
      createSvgElement(
        "tspan",
        { x, dy: 17 },
        `${Number(event.date.slice(5, 7))}/${Number(event.date.slice(8, 10))}`,
      ),
    );
    svg.append(label);
  });

  activeSeries.forEach((item) => {
    let pathData = "";
    let drawing = false;
    events.forEach((event, index) => {
      const value = item.values.get(event.key);
      if (!Number.isFinite(value)) {
        drawing = false;
        return;
      }
      pathData += `${drawing ? "L" : "M"}${xAt(index)},${yAt(value)} `;
      drawing = true;
    });
    svg.append(createSvgElement("path", {
      d: pathData.trim(),
      stroke: item.color,
      "stroke-width": featured ? 4 : 2.8,
      class: "mock-line-path",
    }));

    events.forEach((event, index) => {
      const value = item.values.get(event.key);
      if (!Number.isFinite(value)) return;
      const point = createSvgElement("circle", {
        cx: xAt(index),
        cy: yAt(value),
        r: featured ? 5.5 : 4.5,
        fill: item.color,
        class: "mock-line-point",
      });
      point.append(createSvgElement(
        "title",
        {},
        `${item.name}・${event.round ? `第${event.round}回` : event.date}・偏差値${value}`,
      ));
      svg.append(point);
      svg.append(createSvgElement("text", {
        x: xAt(index),
        y: yAt(value) - 9,
        "text-anchor": "middle",
        fill: item.color,
        class: "chart-value-label",
      }, Number(value.toFixed(1))));
    });
  });

  scroll.append(svg);
  card.append(scroll);
  if (events.length > 4) {
    const hint = document.createElement("small");
    hint.className = "chart-scroll-hint";
    hint.textContent = "← 横にスライドして続きを見る →";
    hint.hidden = true;
    card.append(hint);
  }
  return card;
}

function updateChartScrollHints() {
  document.querySelectorAll(".line-chart-card").forEach((card) => {
    const scroll = card.querySelector(".line-chart-scroll");
    const hint = card.querySelector(".chart-scroll-hint");
    if (scroll && hint) {
      hint.hidden = scroll.scrollWidth <= scroll.clientWidth + 1;
    }
  });
}

function renderMockResults() {
  mockChart.replaceChildren();
  mockEmpty.hidden = mockResults.length > 0;
  const groups = new Map();
  mockResults.forEach((result) => {
    if (!groups.has(result.name)) groups.set(result.name, []);
    groups.get(result.name).push(result);
  });

  [...groups.entries()]
    .sort((a, b) => {
      const latest = (results) => results.reduce(
        (value, result) => result.date > value ? result.date : value,
        "",
      );
      return latest(b[1]).localeCompare(latest(a[1])) || a[0].localeCompare(b[0], "ja");
    })
    .forEach(([mockName, results], groupIndex) => {
      const details = document.createElement("details");
      details.className = "mock-series-group";
      details.open = groupIndex === 0;

      const eventMap = new Map();
      results.forEach((result) => {
        const key = `${result.round ?? "none"}\u0000${result.date}`;
        if (!eventMap.has(key)) {
          eventMap.set(key, { key, round: result.round, date: result.date });
        }
      });
      const events = [...eventMap.values()].sort(
        (a, b) => a.date.localeCompare(b.date) || (a.round ?? 999) - (b.round ?? 999),
      );

      const summary = document.createElement("summary");
      const summaryText = document.createElement("span");
      const summaryName = document.createElement("strong");
      summaryName.textContent = mockName;
      const summaryMeta = document.createElement("small");
      summaryMeta.textContent = `${events.length}回分・最新 ${events[events.length - 1].date}`;
      summaryText.append(summaryName, summaryMeta);
      summary.append(summaryText);
      details.append(summary);

      const body = document.createElement("div");
      body.className = "mock-series-body";
      const subjects = [...new Set(
        results
          .filter((result) => Number.isFinite(result.deviation))
          .map((result) => result.subject),
      )];
      const regularSubjects = subjects
        .filter((subject) => subject !== "総合")
        .sort((a, b) => a.localeCompare(b, "ja"));
      const colors = [
        "#2563eb", "#dc2626", "#16a34a", "#d97706", "#0891b2",
        "#db2777", "#7c3aed", "#65a30d", "#ea580c", "#475569",
      ];
      const colorBySubject = new Map(
        regularSubjects.map((subject, index) => [subject, colors[index % colors.length]]),
      );
      const valuesFor = (subject) => {
        const values = new Map();
        results
          .filter((result) => result.subject === subject && Number.isFinite(result.deviation))
          .forEach((result) => {
            values.set(`${result.round ?? "none"}\u0000${result.date}`, result.deviation);
          });
        return values;
      };

      body.append(createMockLineChart(
        "総合偏差値の推移",
        events,
        [{ name: "総合", color: "#7c3aed", values: valuesFor("総合") }],
        true,
      ));
      body.append(createMockLineChart(
        "全科目比較",
        events,
        regularSubjects.map((subject) => ({
          name: subject,
          color: colorBySubject.get(subject),
          values: valuesFor(subject),
        })),
      ));

      const individualHeading = document.createElement("h3");
      individualHeading.className = "individual-chart-heading";
      individualHeading.textContent = "科目別の推移";
      body.append(individualHeading);
      regularSubjects.forEach((subject) => {
        body.append(createMockLineChart(
          `${subject}の推移`,
          events,
          [{ name: subject, color: colorBySubject.get(subject), values: valuesFor(subject) }],
        ));
      });

      const dataDetails = document.createElement("details");
      dataDetails.className = "mock-data-details";
      const dataSummary = document.createElement("summary");
      dataSummary.textContent = "入力データの確認・削除";
      dataDetails.append(dataSummary);
      const dataList = document.createElement("div");
      dataList.className = "mock-data-list";
      [...results]
        .sort((a, b) => (
          a.date.localeCompare(b.date)
          || (a.round ?? 999) - (b.round ?? 999)
          || a.subject.localeCompare(b.subject, "ja")
        ))
        .forEach((result) => {
          const row = document.createElement("div");
          row.className = `mock-data-row${Number.isFinite(result.deviation) ? "" : " legacy"}`;
          const description = document.createElement("span");
          const roundLabel = result.round ? `第${result.round}回` : "回数未設定";
          description.textContent = `${roundLabel}・${result.date}・${result.subject}`;
          const value = document.createElement("strong");
          value.textContent = Number.isFinite(result.deviation)
            ? `偏差値 ${Number(result.deviation.toFixed(1))}`
            : `旧得点 ${result.score}/${result.maxScore}`;
          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "mock-delete";
          removeButton.textContent = "削除";
          removeButton.addEventListener("click", () => {
            mockResults = mockResults.filter((item) => item.id !== result.id);
            saveMockResults();
            render();
          });
          row.append(description, value, removeButton);
          dataList.append(row);
        });
      dataDetails.append(dataList);

      const removeGroupButton = document.createElement("button");
      removeGroupButton.type = "button";
      removeGroupButton.className = "delete-mock-series";
      removeGroupButton.textContent = "この模試データをすべて削除";
      removeGroupButton.addEventListener("click", () => {
        const ids = new Set(results.map((result) => result.id));
        mockResults = mockResults.filter((result) => !ids.has(result.id));
        saveMockResults();
        render();
      });
      dataDetails.append(removeGroupButton);
      body.append(dataDetails);

      details.append(body);
      mockChart.append(details);
    });
  requestAnimationFrame(updateChartScrollHints);
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
    achievementMessage.textContent = "まず今日の基準を決めよう。";
    progressBar.style.width = "0%";
    progressBar.classList.remove("completed");
    progressTrack.setAttribute("aria-valuenow", "0");
  } else if (today >= dailyGoal) {
    const rate = Math.floor((today / dailyGoal) * 100);
    goalProgress.textContent = "今日の目標達成！";
    achievementRate.textContent = `${rate}%`;
    achievementMessage.textContent = "達成。明日も積もう。";
    progressBar.style.width = "100%";
    progressBar.classList.add("completed");
    progressTrack.setAttribute("aria-valuenow", "100");
  } else {
    const rate = Math.floor((today / dailyGoal) * 100);
    goalProgress.textContent = `目標まであと${formatMinutes(dailyGoal - today)}`;
    achievementRate.textContent = `${rate}%`;
    achievementMessage.textContent = today === 0
      ? "まだ0分。今すぐ始めよう。"
      : `残り${formatMinutes(dailyGoal - today)}。今日中に潰そう。`;
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
  renderTodos();
  renderSubjectGoals();
  renderWeeklyReview();
  renderWeaknessAlerts();
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
  saveDailyGoal();
  render();
});

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) {
    alert("今日やることを入力してください。");
    return;
  }

  todos.unshift({
    id: createId(),
    text,
    date: localDateKey(),
    done: false,
  });
  saveTodos();
  todoForm.reset();
  render();
});

subjectGoalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const subject = subjectGoalNameInput.value.trim();
  const hours = Number(subjectGoalHoursInput.value);
  const minutes = Number(subjectGoalMinutesInput.value);
  const totalMinutes = hours * 60 + minutes;
  if (
    !subject
    || !Number.isInteger(hours) || hours < 0 || hours > 23
    || !Number.isInteger(minutes) || minutes < 0 || minutes > 59
    || totalMinutes < 1
  ) {
    alert("科目名と、1分以上の目標時間を入力してください。");
    return;
  }

  const existing = subjectGoals.find((goal) => goal.subject === subject);
  if (existing) {
    existing.minutes = totalMinutes;
  } else {
    subjectGoals.push({ subject, minutes: totalMinutes });
  }
  subjectGoals = sanitizeSubjectGoals(subjectGoals);
  saveSubjectGoals();
  subjectGoalNameInput.value = "";
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
  const round = Number(mockRoundInput.value);
  const date = mockDateInput.value;
  const subject = mockSubjectInput.value.trim();
  const deviation = Number(mockDeviationInput.value);
  if (
    !name || !date || !subject
    || !Number.isInteger(round) || round < 1 || round > 99
    || !Number.isFinite(deviation) || deviation < 0 || deviation > 100
  ) {
    alert("模試名・第何回・受験日・科目・偏差値を確認してください。偏差値は0〜100で入力します。");
    return;
  }

  const existing = mockResults.find(
    (result) => (
      result.name === name
      && result.round === round
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
      round,
      date,
      subject,
      deviation,
    });
  }
  saveMockResults();
  render();
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

exportBackupButton.addEventListener("click", exportBackup);

backupFileInput.addEventListener("change", () => {
  importBackup(backupFileInput.files[0]);
});

deleteAllButton.addEventListener("click", (event) => {
  event.stopPropagation();
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

badgeFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    badgeFilter = button.dataset.badgeFilter;
    badgeFilterButtons.forEach((item) => item.classList.toggle("active", item === button));
    render();
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
    if (selectedTab === "analysis") {
      requestAnimationFrame(updateChartScrollHints);
    }
  });
});

window.addEventListener("resize", updateChartScrollHints);

updateCountdown();
setInterval(updateCountdown, 1000);
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js?v=6").catch(() => {});
  });
}

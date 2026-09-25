"use strict";

const STORAGE_KEY = "study-records-v1";
const GOAL_KEY = "study-daily-goal-v1";
const HOLIDAYS_KEY = "study-holidays-v1";
const PROFILE_KEY = "study-profile-v1";
const MOCK_RESULTS_KEY = "study-mock-results-v1";
const TODOS_KEY = "study-todos-v1";
const SUBJECT_GOALS_KEY = "study-subject-goals-v1";
const ACTIVITY_OPTIONS_KEY = "study-activity-options-v1";
const MATERIAL_PLANS_KEY = "study-material-plans-v1";
const MATERIAL_TASKS_KEY = "study-material-tasks-v1";
const SCHEDULE_SETTINGS_KEY = "study-schedule-settings-v1";
const LAST_RESCHEDULE_KEY = "study-last-reschedule-v1";
const EXAM_DATE = new Date("2027-01-16T09:30:00+09:00");
const MAX_LEVEL_HOURS = 5000;
const DEFAULT_REVIEW_OFFSETS = [1, 3, 7, 14];
const DEFAULT_SCHEDULE_SETTINGS = {
  reviewOffsets: DEFAULT_REVIEW_OFFSETS,
  maxNewUnitsPerDay: 100,
  maxTotalUnitsPerDay: 150,
};
const DEFAULT_ACTIVITY_OPTIONS = [
  "東進受講",
  "復習",
  "問題演習",
  "単語",
  "長文",
  "過去問",
  "模試復習",
  "その他",
];
const SUBJECT_ACTIVITY_SEPARATOR = " :: ";

const form = document.querySelector("#studyForm");
const goalForm = document.querySelector("#goalForm");
const studyDateInput = document.querySelector("#studyDate");
const subjectInput = document.querySelector("#subject");
const activityTypeInput = document.querySelector("#activityType");
const activityOptionInput = document.querySelector("#activityOptionInput");
const addActivityOptionButton = document.querySelector("#addActivityOption");
const studyHoursInput = document.querySelector("#studyHours");
const studyMinutesInput = document.querySelector("#studyMinutes");
const goalHoursInput = document.querySelector("#goalHours");
const goalMinutesInput = document.querySelector("#goalMinutes");
const wordCountInput = document.querySelector("#wordCount");
const studyMemoInput = document.querySelector("#studyMemo");
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
const chartDetail = document.querySelector("#chartDetail");
const periodButtons = document.querySelectorAll("[data-period]");
const chartModeButtons = document.querySelectorAll("[data-chart-mode]");
const previousChartPeriodButton = document.querySelector("#previousChartPeriod");
const currentChartPeriodButton = document.querySelector("#currentChartPeriod");
const nextChartPeriodButton = document.querySelector("#nextChartPeriod");
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
const levelSummary = document.querySelector("#levelSummary");
const levelSummaryBadge = document.querySelector("#levelSummaryBadge");
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
const subjectInsightDialog = document.querySelector("#subjectInsightDialog");
const subjectInsightTitle = document.querySelector("#subjectInsightTitle");
const subjectInsightBody = document.querySelector("#subjectInsightBody");
const subjectInsightCloseButton = document.querySelector("#subjectInsightCloseButton");
const recordEditDialog = document.querySelector("#recordEditDialog");
const recordEditForm = document.querySelector("#recordEditForm");
const recordEditCloseButton = document.querySelector("#recordEditCloseButton");
const editRecordIdInput = document.querySelector("#editRecordId");
const editStudyDateInput = document.querySelector("#editStudyDate");
const editSubjectInput = document.querySelector("#editSubject");
const editActivityTypeInput = document.querySelector("#editActivityType");
const editStudyHoursInput = document.querySelector("#editStudyHours");
const editStudyMinutesInput = document.querySelector("#editStudyMinutes");
const editWordCountInput = document.querySelector("#editWordCount");
const editStudyMemoInput = document.querySelector("#editStudyMemo");
const recordStatus = document.querySelector("#recordStatus");
const recordEditStatus = document.querySelector("#recordEditStatus");
const goRecordButton = document.querySelector("#goRecordButton");
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
const todayScheduleBadge = document.querySelector("#todayScheduleBadge");
const todayScheduleList = document.querySelector("#todayScheduleList");
const todayScheduleEmpty = document.querySelector("#todayScheduleEmpty");
const goScheduleButton = document.querySelector("#goScheduleButton");
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
const recentRecordButtons = document.querySelector("#recentRecordButtons");
const templateButtons = document.querySelector("#templateButtons");
const badgeMission = document.querySelector("#badgeMission");
const requiredPace = document.querySelector("#requiredPace");
const roadmapBar = document.querySelector("#roadmapBar");
const roadmapSteps = document.querySelector("#roadmapSteps");
const paceAdvice = document.querySelector("#paceAdvice");
const rivalList = document.querySelector("#rivalList");
const monthlyRecapRange = document.querySelector("#monthlyRecapRange");
const monthlyRecap = document.querySelector("#monthlyRecap");
const bestToast = document.querySelector("#bestToast");
const bestToastMessage = document.querySelector("#bestToastMessage");
const materialPlanForm = document.querySelector("#materialPlanForm");
const materialNameInput = document.querySelector("#materialName");
const materialUnitInput = document.querySelector("#materialUnit");
const materialRangeStartInput = document.querySelector("#materialRangeStart");
const materialRangeEndInput = document.querySelector("#materialRangeEnd");
const materialStartDateInput = document.querySelector("#materialStartDate");
const materialEndDateInput = document.querySelector("#materialEndDate");
const scheduleStatus = document.querySelector("#scheduleStatus");
const manualScheduleForm = document.querySelector("#manualScheduleForm");
const manualMaterialNameInput = document.querySelector("#manualMaterialName");
const manualMaterialUnitInput = document.querySelector("#manualMaterialUnit");
const manualScheduleDateInput = document.querySelector("#manualScheduleDate");
const manualScheduleTypeInput = document.querySelector("#manualScheduleType");
const manualRangeStartInput = document.querySelector("#manualRangeStart");
const manualRangeEndInput = document.querySelector("#manualRangeEnd");
const manualScheduleFixedInput = document.querySelector("#manualScheduleFixed");
const scheduleSettingsForm = document.querySelector("#scheduleSettingsForm");
const reviewOffsetsInput = document.querySelector("#reviewOffsets");
const maxNewUnitsPerDayInput = document.querySelector("#maxNewUnitsPerDay");
const maxTotalUnitsPerDayInput = document.querySelector("#maxTotalUnitsPerDay");
const scheduleSummary = document.querySelector("#scheduleSummary");
const rescheduleButton = document.querySelector("#rescheduleButton");
const rescheduleSummary = document.querySelector("#rescheduleSummary");
const undoRescheduleButton = document.querySelector("#undoRescheduleButton");
const scheduleMaterialFilter = document.querySelector("#scheduleMaterialFilter");
const materialProgressList = document.querySelector("#materialProgressList");
const scheduleList = document.querySelector("#scheduleList");
const scheduleEmpty = document.querySelector("#scheduleEmpty");
const scheduleEditDialog = document.querySelector("#scheduleEditDialog");
const scheduleEditForm = document.querySelector("#scheduleEditForm");
const scheduleEditCloseButton = document.querySelector("#scheduleEditCloseButton");
const editScheduleIdInput = document.querySelector("#editScheduleId");
const editScheduleDateInput = document.querySelector("#editScheduleDate");
const editScheduleMaterialInput = document.querySelector("#editScheduleMaterial");
const editScheduleUnitInput = document.querySelector("#editScheduleUnit");
const editScheduleTypeInput = document.querySelector("#editScheduleType");
const editScheduleStartInput = document.querySelector("#editScheduleStart");
const editScheduleEndInput = document.querySelector("#editScheduleEnd");
const editScheduleFixedInput = document.querySelector("#editScheduleFixed");
const scheduleEditStatus = document.querySelector("#scheduleEditStatus");

let records = loadRecords();
let dailyGoal = loadDailyGoal();
let holidays = loadHolidays();
let profile = loadProfile();
let mockResults = loadMockResults();
let todos = loadTodos();
let subjectGoals = loadSubjectGoals();
let activityOptions = loadActivityOptions();
let materialPlans = loadMaterialPlans();
let materialTasks = loadMaterialTasks();
let scheduleSettings = loadScheduleSettings();
let lastReschedule = loadLastReschedule();
let visibleMonth = new Date();
let chartPeriod = "day";
let chartMode = "subject";
let chartCursorDate = new Date();
let selectedChartItem = null;
let badgeFilter = "all";
let levelUpTimer;
let bestToastTimer;
visibleMonth.setDate(1);
chartCursorDate.setHours(0, 0, 0, 0);
studyDateInput.value = localDateKey();
holidayDateInput.value = localDateKey();
mockDateInput.value = localDateKey();
materialStartDateInput.value = localDateKey();
materialEndDateInput.value = localDateKey();
manualScheduleDateInput.value = localDateKey();
reviewOffsetsInput.value = scheduleSettings.reviewOffsets.join(",");
maxNewUnitsPerDayInput.value = scheduleSettings.maxNewUnitsPerDay;
maxTotalUnitsPerDayInput.value = scheduleSettings.maxTotalUnitsPerDay;
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

let recordCommitError="";
function tryCommitRecords(nextRecords) {
  try {
    const state=StudyFlow.changeRecords(flowState(),sanitizeRecords(nextRecords),createId,localDateKey());
    saveFlowState(state);recordCommitError="";return true;
  } catch(error) { recordCommitError=error.message;return false; }
}

function setRecordStatus(message, type = "") {
  if (!recordStatus) return;
  recordStatus.textContent = message;
  recordStatus.classList.toggle("success", type === "success");
  recordStatus.classList.toggle("error", type === "error");
}

function setRecordEditStatus(message, type = "") {
  if (!recordEditStatus) return;
  recordEditStatus.textContent = message;
  recordEditStatus.classList.toggle("success", type === "success");
  recordEditStatus.classList.toggle("error", type === "error");
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

function loadActivityOptions() {
  try {
    return sanitizeActivityOptions(JSON.parse(localStorage.getItem(ACTIVITY_OPTIONS_KEY)) ?? []);
  } catch {
    return DEFAULT_ACTIVITY_OPTIONS;
  }
}

function loadMaterialPlans() {
  try {
    return sanitizeMaterialPlans(JSON.parse(localStorage.getItem(MATERIAL_PLANS_KEY)) ?? []);
  } catch {
    return [];
  }
}

function loadMaterialTasks() {
  try {
    return sanitizeMaterialTasks(JSON.parse(localStorage.getItem(MATERIAL_TASKS_KEY)) ?? []);
  } catch {
    return [];
  }
}

function loadScheduleSettings() {
  try {
    return sanitizeScheduleSettings(JSON.parse(localStorage.getItem(SCHEDULE_SETTINGS_KEY)) ?? {});
  } catch {
    return { ...DEFAULT_SCHEDULE_SETTINGS };
  }
}

function loadLastReschedule() {
  try { return sanitizeScheduleSnapshot(JSON.parse(localStorage.getItem(LAST_RESCHEDULE_KEY))); } catch { return null; }
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
    const activity = typeof record?.activity === "string" && record.activity.trim()
      ? record.activity.trim().slice(0, 24)
      : "その他";
    const memo = typeof record?.memo === "string" ? record.memo.trim().slice(0, 80) : "";
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
      activity,
      memo,
      minutes,
      wordCount,
      date: record.date,
      ...(typeof record.scheduleTaskId === "string" && record.scheduleTaskId ? {scheduleTaskId:record.scheduleTaskId, material:String(record.material||""),rangeStart:Number(record.rangeStart)||1,rangeEnd:Number(record.rangeEnd)||1,rangeUnit:String(record.rangeUnit||"項目"),studyType:record.studyType==="review"?"review":"new"} : {}),
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

function sanitizeActivityOptions(value) {
  const options = new Set(DEFAULT_ACTIVITY_OPTIONS);
  if (Array.isArray(value)) {
    value.forEach((item) => {
      const option = typeof item === "string" ? item.trim().slice(0, 24) : "";
      if (option) options.add(option);
    });
  }
  return [...options];
}

function sanitizeWeekdays(value) {
  if (!Array.isArray(value)) return [1, 2, 3, 4, 5];
  const weekdays = [...new Set(value.map(Number))]
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);
  return weekdays.length > 0 ? weekdays : [1, 2, 3, 4, 5];
}

function sanitizeReviewOffsets(value) {
  if (!Array.isArray(value)) return [...DEFAULT_REVIEW_OFFSETS];
  const offsets = [...new Set(value.map(Number))]
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= 365)
    .sort((a, b) => a - b);
  return offsets.length > 0 ? offsets : [...DEFAULT_REVIEW_OFFSETS];
}

function sanitizeRangeStartEnd(startValue, endValue) {
  const start = Number(startValue);
  const end = Number(endValue);
  if (
    !Number.isInteger(start) || !Number.isInteger(end)
    || start < 1 || end < start || end > 99999
  ) {
    return null;
  }
  return { start, end };
}

function sanitizeScheduleSettings(value) {
  const maxNewUnitsPerDay = Number(value?.maxNewUnitsPerDay);
  const maxTotalUnitsPerDay = Number(value?.maxTotalUnitsPerDay);
  return {
    reviewOffsets: sanitizeReviewOffsets(value?.reviewOffsets),
    maxNewUnitsPerDay: Number.isInteger(maxNewUnitsPerDay) && maxNewUnitsPerDay >= 1
      ? Math.min(maxNewUnitsPerDay, 9999)
      : DEFAULT_SCHEDULE_SETTINGS.maxNewUnitsPerDay,
    maxTotalUnitsPerDay: Number.isInteger(maxTotalUnitsPerDay) && maxTotalUnitsPerDay >= 1
      ? Math.min(maxTotalUnitsPerDay, 9999)
      : DEFAULT_SCHEDULE_SETTINGS.maxTotalUnitsPerDay,
  };
}

function sanitizeMaterialPlans(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((plan) => {
    const material = typeof plan?.material === "string" ? plan.material.trim().slice(0, 40) : "";
    const unit = typeof plan?.unit === "string" && plan.unit.trim()
      ? plan.unit.trim().slice(0, 12)
      : "項目";
    const range = sanitizeRangeStartEnd(plan?.start, plan?.end);
    if (!material || !range || !isDateKey(plan?.startDate) || !isDateKey(plan?.endDate)) {
      return [];
    }
    return [{
      id: String(plan.id ?? createId()),
      material,
      unit,
      start: range.start,
      end: range.end,
      startDate: plan.startDate,
      endDate: plan.endDate,
      subject: typeof plan.subject === "string" ? plan.subject.trim().slice(0,30) : "",
      weekdays: sanitizeWeekdays(plan.weekdays),
      reviewOffsets: sanitizeReviewOffsets(plan.reviewOffsets),
      reviewEnabled: plan.reviewEnabled !== false,
      mode: plan.mode === "quantity" ? "quantity" : "deadline",
      dailyQuantity: Math.max(1, Math.min(99999, Math.floor(Number(plan.dailyQuantity) || 1))),
      createdAt: typeof plan.createdAt === "string" ? plan.createdAt : new Date().toISOString(),
    }];
  });
}

function sanitizeMaterialTasks(value) {
  if (!Array.isArray(value)) return [];
  return ScheduleEngine.mergeReviews(value.flatMap((task) => {
    const material = typeof task?.material === "string" ? task.material.trim().slice(0, 40) : "";
    const unit = typeof task?.unit === "string" && task.unit.trim()
      ? task.unit.trim().slice(0, 12)
      : "項目";
    const range = sanitizeRangeStartEnd(task?.start, task?.end);
    const type = task?.type === "review" ? "review" : "new";
    if (!material || !range || !isDateKey(task?.date)) return [];
    return [{
      id: String(task.id ?? createId()),
      planId: typeof task.planId === "string" ? task.planId : "",
      recordId: typeof task.recordId === "string" ? task.recordId : "",
      subject: typeof task.subject === "string" ? task.subject.trim().slice(0,30) : "",
      sourceNewId: typeof task.sourceNewId === "string" ? task.sourceNewId : "",
      material,
      unit,
      date: task.date,
      start: range.start,
      end: range.end,
      type,
      fixed: Boolean(task.fixed),
      done: Boolean(task.done),
      manual: Boolean(task.manual),
      completedDate: task.done ? (isDateKey(task.completedDate) ? task.completedDate : task.date) : "",
      reviewOffsets: [...new Set((Array.isArray(task.reviewOffsets)?task.reviewOffsets:[task.reviewOffset]).filter(n=>Number.isInteger(n)&&n>0&&n<=365))].sort((a,b)=>a-b),
      reviewOffset: Number.isInteger(task.reviewOffset) && task.reviewOffset > 0 ? task.reviewOffset : 0,
      dueDate: isDateKey(task.dueDate) ? task.dueDate : "",
      originalDate: isDateKey(task.originalDate) ? task.originalDate : "",
      requestedDate: isDateKey(task.requestedDate) ? task.requestedDate : "",
      createdAt: typeof task.createdAt === "string" ? task.createdAt : new Date().toISOString(),
    }];
  }));
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

function saveActivityOptions() {
  localStorage.setItem(ACTIVITY_OPTIONS_KEY, JSON.stringify(activityOptions));
}

function saveMaterialPlans() {
  localStorage.setItem(MATERIAL_PLANS_KEY, JSON.stringify(materialPlans));
}

function saveMaterialTasks() {
  localStorage.setItem(MATERIAL_TASKS_KEY, JSON.stringify(materialTasks));
}

function saveScheduleSettings() {
  localStorage.setItem(SCHEDULE_SETTINGS_KEY, JSON.stringify(scheduleSettings));
}

function saveLastReschedule() {
  if (lastReschedule) {
    localStorage.setItem(LAST_RESCHEDULE_KEY, JSON.stringify(lastReschedule));
  } else {
    localStorage.removeItem(LAST_RESCHEDULE_KEY);
  }
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
  saveActivityOptions();
  saveMaterialPlans();
  saveMaterialTasks();
  saveScheduleSettings();
  saveLastReschedule();
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
      activityOptions,
      materialPlans,
      materialTasks,
      scheduleSettings,
      lastReschedule,
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
    "activityOptions",
    "materialPlans",
    "materialTasks",
    "scheduleSettings",
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
    activityOptions: sanitizeActivityOptions(source.activityOptions ?? []),
    materialPlans: sanitizeMaterialPlans(source.materialPlans ?? []),
    materialTasks: sanitizeMaterialTasks(source.materialTasks ?? []),
    scheduleSettings: sanitizeScheduleSettings(source.scheduleSettings ?? {}),
    lastReschedule: sanitizeScheduleSnapshot(source.lastReschedule),
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
    activityOptions = payload.activityOptions;
    materialPlans = payload.materialPlans;
    materialTasks = payload.materialTasks;
    scheduleSettings = payload.scheduleSettings;
    lastReschedule = payload.lastReschedule;
    saveAllData();

    goalHoursInput.value = dailyGoal > 0 ? Math.floor(dailyGoal / 60) : 1;
    goalMinutesInput.value = dailyGoal > 0 ? dailyGoal % 60 : 0;
    profileNameInput.value = profile.name;
    ultimateGoalInput.value = profile.goal;
    reviewOffsetsInput.value = scheduleSettings.reviewOffsets.join(",");
    maxNewUnitsPerDayInput.value = scheduleSettings.maxNewUnitsPerDay;
    maxTotalUnitsPerDayInput.value = scheduleSettings.maxTotalUnitsPerDay;
    render();
    setBackupStatus("バックアップを復元しました。記録・目標・プロフィール・模試結果・やること・科目別目標・教材予定を更新しました。", "success");
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

function setReadableDuration(element, text) {
  element.replaceChildren();
  text.split(/(\d+時間|\d+分)/).filter(Boolean).forEach((part) => {
    const span = document.createElement("span");
    span.className = "duration-part";
    span.textContent = part;
    element.append(span);
    if (part.endsWith("時間")) element.append(document.createElement("wbr"));
  });
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
    { level: 80, title: "本番を狙う猛者" },
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
  const cursor = new Date(chartCursorDate);
  cursor.setHours(0, 0, 0, 0);
  const start = new Date(cursor);
  const end = new Date(cursor);

  if (chartPeriod === "week") {
    const daysFromMonday = (cursor.getDay() + 6) % 7;
    start.setDate(cursor.getDate() - daysFromMonday);
    end.setDate(start.getDate() + 6);
  } else if (chartPeriod === "month") {
    start.setDate(1);
    end.setMonth(cursor.getMonth() + 1, 0);
  }
  return { start, end };
}

function moveChartPeriod(direction) {
  if (chartPeriod === "day") {
    chartCursorDate.setDate(chartCursorDate.getDate() + direction);
  } else if (chartPeriod === "week") {
    chartCursorDate.setDate(chartCursorDate.getDate() + direction * 7);
  } else {
    chartCursorDate.setMonth(chartCursorDate.getMonth() + direction);
  }
  selectedChartItem = null;
  renderSubjectChart();
  renderMonthlyRecap();
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

function minutesByActivity(sourceRecords) {
  return sourceRecords.reduce((totals, record) => {
    const activity = record.activity || "その他";
    totals.set(activity, (totals.get(activity) ?? 0) + record.minutes);
    return totals;
  }, new Map());
}

function subjectActivityKey(record) {
  return `${record.subject}${SUBJECT_ACTIVITY_SEPARATOR}${record.activity || "その他"}`;
}

function splitSubjectActivityKey(key) {
  const [subject, activity = "その他"] = key.split(SUBJECT_ACTIVITY_SEPARATOR);
  return { subject, activity };
}

function minutesBySubjectActivity(sourceRecords) {
  return sourceRecords.reduce((totals, record) => {
    const key = subjectActivityKey(record);
    totals.set(key, (totals.get(key) ?? 0) + record.minutes);
    return totals;
  }, new Map());
}

function countByActivity(sourceRecords) {
  return sourceRecords.reduce((totals, record) => {
    const activity = record.activity || "その他";
    totals.set(activity, (totals.get(activity) ?? 0) + 1);
    return totals;
  }, new Map());
}

function averageMinutes(sourceRecords) {
  if (sourceRecords.length === 0) return 0;
  return Math.round(sourceRecords.reduce((sum, record) => sum + record.minutes, 0) / sourceRecords.length);
}

function createValuePair(label, value) {
  const item = document.createElement("div");
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  const valueElement = document.createElement("strong");
  valueElement.textContent = value;
  item.append(labelElement, valueElement);
  return item;
}

function lastRecordDate(recordsForItem) {
  return recordsForItem.reduce((latest, record) => record.date > latest ? record.date : latest, "");
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

function latestMockResultBySubject() {
  const latest = new Map();
  mockResults
    .filter((result) => Number.isFinite(Number(result.deviation)))
    .sort((a, b) => (
      a.date.localeCompare(b.date)
      || Number(a.round ?? 0) - Number(b.round ?? 0)
    ))
    .forEach((result) => {
      latest.set(result.subject, {
        name: result.name,
        round: result.round,
        date: result.date,
        deviation: Number(result.deviation),
      });
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

function createScheduleItem(task, { compact = false } = {}) {
  const item = document.createElement("div");
  item.className = `schedule-item${task.done ? " done" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "schedule-check";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", `${task.material} ${formatTaskRange(task)} ${taskTypeLabel(task.type)}を完了`);
  const source=materialTasks.find(t=>t.id===task.sourceNewId);
  checkbox.disabled=Boolean(!task.done && source && !source.done);
  checkbox.addEventListener("change", () => {
    checkbox.checked=task.done;
    if(task.done) { openStudyCompletion(task, true); return; }
    openStudyCompletion(task);
  });

  const main = document.createElement("div");
  main.className = "schedule-main";
  const title = document.createElement("strong");
  title.textContent = task.material;
  const range = document.createElement("span");
  range.textContent = formatTaskRange(task);
  const meta = document.createElement("small");
  const linkedRecord=linkedStudyRecord(task);
  const labels = [
    task.date,
    task.fixed ? "固定" : "",
    task.manual ? "手動調整" : "",
  ].filter(Boolean);
  meta.textContent = compact ? [taskTypeLabel(task.type), task.fixed ? "固定" : ""].filter(Boolean).join("・") : labels.join("・");
  if(task.done) labels.push(`完了 ${task.completedDate || task.date}`);
  else if(source && !source.done) labels.push("新規学習の完了待ち");
  else if(task.date < localDateKey()) labels.push("未完了・期限超過");
  if(task.dueDate && task.dueDate!==task.date) labels.push(`基準日 ${task.dueDate} → ${task.date}`);
  else if(task.originalDate && task.originalDate!==task.date) labels.push(`移動前 ${task.originalDate} → ${task.date}`);
  if(task.fixed && ScheduleEngine.conflicts([task,...(source?[source]:[])],materialPlans,holidays).length) labels.push("固定の衝突あり・編集で調整");
  meta.textContent=labels.join("・");
  labels.push(task.done?"✓ 完了済み":"○ 未完了");
  labels.push(linkedRecord?`記録 ${linkedRecord.date}・${linkedRecord.subject}・${linkedRecord.minutes}分`:task.done?"時間未記録":"");
  if(task.type==="review"&&ScheduleEngine.reviewRounds(task).length)labels.push(`復習 ${ScheduleEngine.reviewRounds(task).join("・")}日後${ScheduleEngine.reviewRounds(task).length>1?"を1回に統合":""}`);
  meta.textContent=labels.filter(Boolean).join("・");
  main.append(title, range, meta);

  const kind = document.createElement("span");
  kind.className = `schedule-kind${task.type === "review" ? " review" : ""}`;
  kind.textContent = taskTypeLabel(task.type);

  item.append(checkbox, main, kind);

  {
    const actions = document.createElement("div");
    actions.className = "schedule-actions";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "編集";
    edit.setAttribute("aria-label", `${task.material} ${taskTypeLabel(task.type)} ${formatTaskRange(task)}を編集`);
    edit.disabled=task.done;
    edit.addEventListener("click", () => openScheduleEditDialog(task));

    const pin = document.createElement("button");
    pin.type = "button";
    pin.textContent = task.fixed ? "固定解除" : "固定";
    pin.disabled=task.done;
    pin.addEventListener("click", () => {
      openScheduleEditDialog(task);
      editScheduleFixedInput.checked=!task.fixed;
      updateTaskEditHint();
      previewTaskEdit();
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger";
    remove.textContent = "削除";
    remove.addEventListener("click", () => {
      if (task.done || task.recordId || materialTasks.some(t=>t.sourceNewId===task.id && (t.done || t.fixed || t.recordId))) { setScheduleStatus("実績・時間記録・固定された復習に紐づく予定は削除できません。", "error"); return; }
      if (!confirm("この教材予定と紐づく未完了の復習を削除しますか？")) return;
      materialTasks = materialTasks.filter((entry) => entry.id !== task.id && entry.sourceNewId !== task.id);
      saveMaterialTasks();
      render();
    });

    remove.disabled=task.done;
    if(task.done){const time=document.createElement("button");time.type="button";time.textContent=linkedRecord?"時間を修正":"時間を記録";time.addEventListener("click",()=>openStudyCompletion(task));actions.append(time);}
    if(!task.done){const finish=document.createElement("button");finish.type="button";finish.className="schedule-complete-primary";finish.textContent="完了・時間を記録";finish.disabled=checkbox.disabled;finish.addEventListener("click",()=>openStudyCompletion(task));actions.append(finish);}
    const menu=document.createElement("details");menu.className="schedule-more";
    const summary=document.createElement("summary");summary.textContent="…";summary.setAttribute("aria-label",task.material+"の管理操作");
    const content=document.createElement("div");content.append(pin,remove);
    const taskPlan=planById(task.planId);
    if(taskPlan){const editPlan=document.createElement("button");editPlan.type="button";editPlan.textContent="教材全体の範囲・計画を編集";editPlan.addEventListener("click",()=>{menu.open=false;openMaterialSettings(taskPlan);});content.append(editPlan);}
    if(task.done){const undo=document.createElement("button");undo.type="button";undo.textContent="完了を取り消す";undo.addEventListener("click",()=>openStudyCompletion(task,true));content.append(undo);}
    menu.append(summary,content);actions.append(edit,menu);
    item.append(actions);
  }

  return item;
}

function renderTodaySchedule() {
  const todayKey = localDateKey();
  const todaysTasks = materialTasks
    .filter((task) => task.date === todayKey)
    .sort((a, b) => Number(a.done) - Number(b.done) || a.material.localeCompare(b.material, "ja"));
  const doneCount = todaysTasks.filter((task) => task.done).length;

  todayScheduleList.replaceChildren();
  todayScheduleEmpty.hidden = todaysTasks.length > 0;
  todayScheduleBadge.textContent = `${doneCount} / ${todaysTasks.length}`;
  todaysTasks.forEach((task) => {
    todayScheduleList.append(createScheduleItem(task, { compact: true }));
  });
}

function renderMaterialProgress() {
  materialProgressList.replaceChildren();
  const plannedMaterials = new Set(materialPlans.map((plan) => plan.material));
  materialPlans.forEach((plan) => {
    const planTasks = tasksForPlan(plan.id).filter((task) => task.type === "new");
    const doneNew = planTasks.filter((task) => task.done).reduce((sum, task) => sum + rangeSize(task), 0);
    const total = plan.end - plan.start + 1;
    const card = document.createElement("div");
    card.className = "material-progress-card";
    const name = document.createElement("strong");
    name.textContent = plan.material;
    const progress = document.createElement("span");
    const all=tasksForPlan(plan.id),newEnd=all.filter(t=>t.type==="new").map(t=>t.completedDate||t.date).sort().at(-1)||plan.endDate;
    const reviewEnd=all.filter(t=>t.type==="review").map(t=>t.completedDate||t.date).sort().at(-1);
    progress.textContent=`${formatTaskRange(plan)} ／ ${doneNew} / ${total}${ScheduleEngine.quantityUnit(plan.unit)} 完了`;
    const dates=document.createElement("p"); dates.className="material-end-dates";
    dates.textContent=`新規終了 ${newEnd}　／　最終復習 ${reviewEnd||"なし"}${all.some(t=>t.type==="new"&&!t.done)?"（予定）":""}`;
    const settings=document.createElement("button");settings.type="button";settings.className="secondary-button compact-button";settings.textContent="範囲・計画を編集";
    settings.addEventListener("click",()=>openMaterialSettings(plan));
    card.append(name, progress, dates, settings);
    let nextRange=plan.start;
    const gaps=[];
    for(const task of [...planTasks].sort((a,b)=>a.start-b.start)) {
      if(task.start>nextRange)gaps.push({start:nextRange,end:task.start-1,unit:plan.unit});
      nextRange=Math.max(nextRange,task.end+1);
    }
    if(nextRange<=plan.end)gaps.push({start:nextRange,end:plan.end,unit:plan.unit});
    if(gaps.length) {
      const notice=document.createElement("p");notice.className="schedule-load-warning";
      notice.textContent=`未割当の範囲：${gaps.slice(0,3).map(formatTaskRange).join("、")}${gaps.length>3?" ほか":""}。各日の範囲を編集して割り当ててください。`;
      card.append(notice);
    }
    materialProgressList.append(card);
  });
  const manualMaterials = [...new Set(
    materialTasks
      .filter((task) => !plannedMaterials.has(task.material))
      .map((task) => task.material),
  )].sort((a, b) => a.localeCompare(b, "ja"));
  manualMaterials.forEach((material) => {
    const tasks = materialTasks.filter((task) => task.material === material);
    const doneCount = tasks.filter((task) => task.done).length;
    const card = document.createElement("div");
    card.className = "material-progress-card";
    const name = document.createElement("strong");
    name.textContent = material;
    const progress = document.createElement("span");
    progress.textContent = `手動予定 ${doneCount} / ${tasks.length}件 完了`;
    card.append(name, progress);
    materialProgressList.append(card);
  });
}

function renderScheduleFilter() {
  const selected = scheduleMaterialFilter.value || "all";
  const materials = [...new Set([
    ...materialPlans.map((plan) => plan.material),
    ...materialTasks.map((task) => task.material),
  ])].sort((a, b) => a.localeCompare(b, "ja"));
  scheduleMaterialFilter.replaceChildren();
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "すべての教材";
  scheduleMaterialFilter.append(allOption);
  materials.forEach((material) => {
    const option = document.createElement("option");
    option.value = material;
    option.textContent = material;
    scheduleMaterialFilter.append(option);
  });
  scheduleMaterialFilter.value = materials.includes(selected) ? selected : "all";
}

function renderSchedule() {
  renderTodaySchedule();
  renderScheduleFilter();
  renderMaterialProgress();
  renderScheduleCalendar();

  const selectedMaterial = scheduleMaterialFilter.value;
  const visibleTasks = materialTasks
    .filter((task) => (selectedMaterial === "all" || task.material === selectedMaterial) && task.date === scheduleSelectedDate)
    .sort((a, b) => (
      a.date.localeCompare(b.date)
      || Number(a.done) - Number(b.done)
      || (a.type === b.type ? 0 : a.type === "new" ? -1 : 1)
      || a.material.localeCompare(b.material, "ja")
      || a.start - b.start
    ));
  const doneCount = materialTasks.filter((task) => task.done).length;

  scheduleList.replaceChildren();
  scheduleEmpty.hidden = visibleTasks.length > 0;
  scheduleSummary.textContent = materialTasks.length === 0
    ? "予定を作るとここに表示されます。"
    : `教材${new Set(materialTasks.map((task) => task.material)).size}件・予定${doneCount}/${materialTasks.length}件完了`;
  for(const done of [false,true]){
    const group=visibleTasks.filter(t=>t.done===done);if(!group.length)continue;
    const heading=document.createElement("h4");heading.className="schedule-group-title";heading.textContent=(done?"✓ 完了済み":"○ 未完了")+" · "+group.length+"件";scheduleList.append(heading);
    group.forEach(task=>scheduleList.append(createScheduleItem(task)));
  }

  if (lastReschedule?.summary) {
    rescheduleSummary.hidden = false;
    rescheduleSummary.textContent = lastReschedule.summary;
    undoRescheduleButton.hidden = false;
    undoRescheduleButton.textContent=lastReschedule.operation==="edit"?"直前の編集を取り消す":"直前の再調整を取り消す";
  } else {
    rescheduleSummary.hidden = true;
    rescheduleSummary.textContent = "";
    undoRescheduleButton.hidden = true;
  }
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
      document.dispatchEvent(new Event("manabi:render"));
    });

    row.append(heading, track, remove);
    subjectGoalList.append(row);
  });
}

function renderActivityOptions() {
  const selected = activityTypeInput.value;
  const editSelected = editActivityTypeInput.value;
  const options = sanitizeActivityOptions([
    ...activityOptions,
    ...records.map((record) => record.activity).filter(Boolean),
  ]);
  activityTypeInput.replaceChildren();
  editActivityTypeInput.replaceChildren();
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    activityTypeInput.append(item);

    const editItem = document.createElement("option");
    editItem.value = option;
    editItem.textContent = option;
    editActivityTypeInput.append(editItem);
  });
  if (options.includes(selected)) activityTypeInput.value = selected;
  if (options.includes(editSelected)) editActivityTypeInput.value = editSelected;
}

function fillStudyForm({ subject, activity, minutes = 30, wordCount = 0, memo = "" }) {
  subjectInput.value = subject ?? "";
  studyDateInput.value = studyDateInput.value || localDateKey();
  if (activity && activityOptions.includes(activity)) {
    activityTypeInput.value = activity;
  }
  studyHoursInput.value = Math.floor(minutes / 60);
  studyMinutesInput.value = minutes % 60;
  wordCountInput.value = wordCount || "";
  studyMemoInput.value = memo || "";
  subjectInput.focus();
}

function renderQuickFillButtons() {
  recentRecordButtons.replaceChildren();
  templateButtons.replaceChildren();
  const currentSubject = subjectInput.value.trim();
  const prioritizeSubject = (items) => {
    if (!currentSubject) return items;
    return [
      ...items.filter((item) => item.subject === currentSubject),
      ...items.filter((item) => item.subject !== currentSubject),
    ];
  };

  prioritizeSubject(records).slice(0, 4).forEach((record) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${record.subject} / ${record.activity || "その他"}`;
    button.addEventListener("click", () => fillStudyForm(record));
    recentRecordButtons.append(button);
  });

  const combos = new Map();
  records.forEach((record) => {
    const key = subjectActivityKey(record);
    const current = combos.get(key) ?? {
      subject: record.subject,
      activity: record.activity || "その他",
      count: 0,
      minutes: [],
    };
    current.count += 1;
    current.minutes.push(record.minutes);
    combos.set(key, current);
  });

  [...combos.values()]
    .sort((a, b) => {
      const aPriority = currentSubject && a.subject === currentSubject ? 1 : 0;
      const bPriority = currentSubject && b.subject === currentSubject ? 1 : 0;
      return bPriority - aPriority || b.count - a.count;
    })
    .slice(0, 5)
    .forEach((combo) => {
      const average = Math.round(combo.minutes.reduce((sum, value) => sum + value, 0) / combo.minutes.length);
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${combo.subject} / ${combo.activity}`;
      button.addEventListener("click", () => fillStudyForm({
        subject: combo.subject,
        activity: combo.activity,
        minutes: average,
      }));
      templateButtons.append(button);
    });

  if (recentRecordButtons.childElementCount === 0) {
    const empty = document.createElement("small");
    empty.textContent = "まだ最近の記録がありません。";
    recentRecordButtons.append(empty);
  }
  if (templateButtons.childElementCount === 0) {
    const empty = document.createElement("small");
    empty.textContent = "記録が増えると自動で出ます。";
    templateButtons.append(empty);
  }
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
  const scheduledWeek=materialTasks.filter(task=>{const date=task.done?(task.completedDate||task.date):task.date;return date>=current.startKey&&date<=current.endKey;});
  const waitingWeek=scheduledWeek.filter(task=>!task.done&&task.sourceNewId&&!materialTasks.find(source=>source.id===task.sourceNewId)?.done);
  const todoWeek = [...todos.filter((todo) => todo.date >= current.startKey && todo.date <= current.endKey),...scheduledWeek.filter(task=>!waitingWeek.includes(task))];
  const doneTodos = todoWeek.filter((todo) => todo.done).length;

  weeklyRange.textContent = `${formatShortDate(current.start)}〜${formatShortDate(current.end)}`;
  weeklySummary.textContent = `今週 ${formatMinutes(currentTotal)}・予定とToDo ${doneTodos}/${todoWeek.length}${waitingWeek.length?`・復習の完了待ち ${waitingWeek.length}件`:''}`;
  weeklyReviewGrid.replaceChildren();
  [
    ["今週", formatMinutes(currentTotal)],
    ["先週との差", delta >= 0 ? `+${formatMinutes(delta)}` : `-${formatMinutes(Math.abs(delta))}`],
    ["目標達成日", dailyGoal > 0 ? `${goalAchievedDays}日` : "未設定"],
    ["予定とToDo", `${doneTodos} / ${todoWeek.length}`],
    ["一番多い科目", subjectTotals[0] ? `${subjectTotals[0][0]} ${formatMinutes(subjectTotals[0][1])}` : "まだなし"],
  ].forEach(([label, value]) => {
    const item = document.createElement("div");
    const small = document.createElement("span");
    small.textContent = label;
    const strong = document.createElement("strong");
    setReadableDuration(strong, value);
    item.append(small, strong);
    weeklyReviewGrid.append(item);
  });

  if (currentTotal === 0) {
    weeklyAdvice.textContent = doneTodos ? `今週は${doneTodos}件の取り組みを完了しています。学習時間は未記録です。必要なら予定から時間を追加できます。` : "今週の学習時間はまだ記録されていません。ホームや予定タブで取り組む内容を確認できます。";
  } else if (delta >= 0) {
    weeklyAdvice.textContent = "先週以上に積めています。油断せず、足りない科目を1つ潰すとさらに強い。";
  } else {
    weeklyAdvice.textContent = "先週より落ちています。原因を責めるより、今日の1タスクを確実に終わらせよう。";
  }
}

function renderPaceAndRoadmap(totalMinutes) {
  const totalHours = totalMinutes / 60;
  const remainingHours = Math.max(0, MAX_LEVEL_HOURS - totalHours);
  const rawRemainingDays = Math.ceil((EXAM_DATE.getTime() - Date.now()) / 86400000);
  const remainingDays = Math.max(1, rawRemainingDays);
  const neededPerDay = remainingHours / remainingDays;
  const studyDates = [...new Set(records.map((record) => record.date))].sort();
  const firstStudyDay = studyDates.length > 0 ? dayNumber(studyDates[0]) : dayNumber(localDateKey());
  const elapsedDays = Math.max(1, dayNumber(localDateKey()) - firstStudyDay + 1);
  const goalAchievedDays = dailyGoal > 0
    ? studyDates.filter((date) => records
      .filter((record) => record.date === date)
      .reduce((sum, record) => sum + record.minutes, 0) >= dailyGoal).length
    : 0;
  const protectionTickets = dailyGoal > 0 ? Math.floor(goalAchievedDays / 5) : 0;
  const currentPace = records.length === 0
    ? 0
    : totalHours / Math.max(1, new Set(records.map((record) => record.date)).size);

  if (rawRemainingDays <= 0) {
    requiredPace.textContent = "期限を確認";
    paceAdvice.textContent = "設定している期限を過ぎています。目標日や節目時間を見直して、次の作戦を立て直そう。";
  } else if (neededPerDay > 24) {
    requiredPace.textContent = "見直し推奨";
    paceAdvice.textContent = `節目まで残り${Math.ceil(remainingHours)}時間。この期限だと1日${neededPerDay.toFixed(1)}時間が必要なので、目標日や節目を調整しよう。`;
  } else {
    requiredPace.textContent = `目安 ${neededPerDay.toFixed(1)}時間/日`;
    paceAdvice.textContent = remainingHours <= 0
      ? "5000時間の節目に到達。ここからは時間だけでなく、復習と演習の質を上げよう。"
      : `5000時間の節目まで残り${Math.ceil(remainingHours)}時間。今の記録日ペースは約${currentPace.toFixed(1)}時間/日です。`;
  }
  roadmapBar.style.width = `${Math.min(100, (totalHours / MAX_LEVEL_HOURS) * 100)}%`;

  roadmapSteps.replaceChildren();
  [
    [500, "基礎固め"],
    [1000, "受験生化"],
    [2000, "勝負開始"],
    [3000, "応用強化"],
    [4000, "仕上げ"],
    [5000, "大きな節目"],
  ].forEach(([hours, label]) => {
    const step = document.createElement("span");
    step.className = totalHours >= hours ? "reached" : "";
    step.textContent = `${hours}h ${label}`;
    roadmapSteps.append(step);
  });

  rivalList.replaceChildren();
  [
    ["5時間ペース", 5],
    ["7時間ペース", 7],
  ].forEach(([name, pace]) => {
    const rivalHours = Math.min(MAX_LEVEL_HOURS, pace * elapsedDays);
    const diff = totalHours - rivalHours;
    rivalList.append(createValuePair(name, `${diff >= 0 ? "+" : ""}${Math.round(diff)}時間`));
  });

  rivalList.append(createValuePair("保護チケット目安", `${protectionTickets}枚`));
}

function buildBadgeDefinitions(totalMinutes, longestStreak, totalWordCount, studyDayCount, currentLevel) {
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
    { name: "本番を狙う猛者", icon: "🎯", goal: 80, level: 5 },
    { name: "限界を超える者", icon: "🌌", goal: 90, level: 6 },
    { name: "夢の目前", icon: "🌠", goal: 99, level: 6 },
    { name: "五千時間の覇者", icon: "👑", goal: 100, level: 7 },
  ].map((badge) => ({ ...badge, value: currentLevel, unit: "レベル" }));
  badges.push(...levelBadges);
  badges.push(
    { name: "五百時間の開拓者", icon: "🧭", value: totalHours, goal: 500, unit: "時間", level: 7 },
    { name: "千時間の執念", icon: "🔥", value: totalHours, goal: 1000, unit: "時間", level: 7 },
    { name: "二千時間の挑戦者", icon: "⚔️", value: totalHours, goal: 2000, unit: "時間", level: 7 },
    { name: "三千時間の応用ハンター", icon: "🏹", value: totalHours, goal: 3000, unit: "時間", level: 7 },
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
    { name: "総合70の上位ランナー", icon: "🌟", value: mockStats.bestTotalDeviation, goal: 70, unit: "総合偏差値", level: 7 },
    { name: "得意科目の芽", icon: "🌱", value: mockStats.subjectsOver55, goal: 1, unit: "科目", level: 3 },
    { name: "二科目エース化", icon: "🦅", value: mockStats.subjectsOver60, goal: 2, unit: "科目", level: 5 },
    { name: "三科目の柱", icon: "🏛️", value: mockStats.subjectsOver65, goal: 3, unit: "科目", level: 6 },
    { name: "偏差値+3の反撃", icon: "↗️", value: mockStats.bestDeviationGain, goal: 3, unit: "UP", level: 4 },
    { name: "偏差値+5の逆転劇", icon: "📣", value: mockStats.bestDeviationGain, goal: 5, unit: "UP", level: 5 },
    { name: "偏差値+10の覚醒", icon: "✨", value: mockStats.bestDeviationGain, goal: 10, unit: "UP", level: 7 },
  );
  return badges;
}

function renderBadgeMission(totalMinutes, longestStreak, totalWordCount, studyDayCount, currentLevel) {
  const candidates = buildBadgeDefinitions(totalMinutes, longestStreak, totalWordCount, studyDayCount, currentLevel)
    .filter((badge) => badge.value < badge.goal)
    .map((badge) => ({ ...badge, remaining: badge.goal - badge.value }))
    .sort((a, b) => a.remaining - b.remaining);
  const target = candidates[0];
  badgeMission.textContent = target
    ? `あと${formatBadgeValue(target.remaining)}${target.unit}で「${target.name}」`
    : "今取れる称号は取り切っています。次は5000時間の山を進めよう。";
}

function renderMonthlyRecap() {
  const { start, end } = (() => {
    const cursor = new Date(chartCursorDate);
    cursor.setDate(1);
    const end = new Date(cursor);
    end.setMonth(cursor.getMonth() + 1, 0);
    return { start: cursor, end };
  })();
  const startKey = localDateKey(start);
  const endKey = localDateKey(end);
  const monthRecords = recordsInRange(startKey, endKey);
  const total = monthRecords.reduce((sum, record) => sum + record.minutes, 0);
  const subjectTop = [...minutesBySubject(monthRecords).entries()].sort((a, b) => b[1] - a[1])[0];
  const activityTop = [...minutesBySubjectActivity(monthRecords).entries()]
    .map(([key, minutes]) => {
      const { subject, activity } = splitSubjectActivityKey(key);
      return [`${subject} / ${activity}`, minutes];
    })
    .sort((a, b) => b[1] - a[1])[0];
  const words = monthRecords.reduce((sum, record) => sum + (Number(record.wordCount) || 0), 0);
  monthlyRecapRange.textContent = `${start.getFullYear()}年${start.getMonth() + 1}月`;
  monthlyRecap.replaceChildren();
  [
    ["総勉強時間", formatMinutes(total)],
    ["一番頑張った科目", subjectTop ? `${subjectTop[0]} ${formatMinutes(subjectTop[1])}` : "まだなし"],
    ["一番多い内容", activityTop ? `${activityTop[0]} ${formatMinutes(activityTop[1])}` : "まだなし"],
    ["英単語", `${words}個`],
    ["月間称号", total >= 6000 ? "今月の継続王" : total >= 1800 ? "今月の努力家" : "ここから作る月"],
  ].forEach(([label, value]) => {
    monthlyRecap.append(createValuePair(label, value));
  });
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

  const today=localDateKey(),manualToday=todos.filter(t=>t.date===today);
  const plannedToday=materialTasks.filter(t=>t.date===today || (t.done&&t.completedDate===today));
  const readyToday=plannedToday.filter(t=>t.done||!t.sourceNewId||materialTasks.find(s=>s.id===t.sourceNewId)?.done);
  if(!manualToday.length&&!plannedToday.length) alerts.push(["今日の予定を決めよう","予定タブで教材の予定を作るか、ホームの「自分で追加すること」に追加できます。"]);
  else if(!manualToday.length&&!readyToday.length) alerts.push(["復習は新規学習の完了待ち","今日の復習予定があります。先に対応する新規学習を完了すると、実際の学習日から復習日が決まります。"]);
  else {const done=manualToday.filter(t=>t.done).length+readyToday.filter(t=>t.done).length;alerts.push([done?"今日の取り組みを進めています":"今日の予定があります",done?`完了 ${done}件。ホームや予定タブで残りの予定を確認できます。`:"ホームの「今日の予定」や「自分で追加すること」から取り組めます。"]);}
  if (dailyGoal === 0) {
    alerts.push(["1日の目標が未設定", "記録タブで基準時間を決めよう。基準がないと勝ち負けが見えません。"]);
  }
  if (subjectGoals.length === 0) {
    alerts.push(["科目別目標が未設定", "英語・数学など、合格に必要な科目ごとの時間配分を決めよう。"]);
  }

  const recentActivityTotals = minutesByActivity(recentRecords);
  const lectureMinutes = recentActivityTotals.get("東進受講") ?? 0;
  const reviewMinutes = recentActivityTotals.get("復習") ?? 0;
  const practiceMinutes = recentActivityTotals.get("問題演習") ?? 0;
  const mockReviewMinutes = recentActivityTotals.get("模試復習") ?? 0;
  if (lectureMinutes >= 180 && reviewMinutes < lectureMinutes * 0.35) {
    alerts.push([
      "東進受講に対して復習が少なめ",
      `直近2週間で受講${formatMinutes(lectureMinutes)}、復習${formatMinutes(reviewMinutes)}。受けっぱなし注意。`,
    ]);
  }
  if (lectureMinutes >= 180 && practiceMinutes < lectureMinutes * 0.25) {
    alerts.push([
      "問題演習が少なめ",
      "受講で理解したつもりになりやすいので、演習時間を今日のタスクに入れよう。",
    ]);
  }
  if (mockResults.length > 0 && mockReviewMinutes === 0) {
    alerts.push([
      "模試復習の記録がありません",
      "模試は受けた後が本番。模試復習を1つ記録すると分析が強くなります。",
    ]);
  }

  [...minutesBySubject(recentRecords).keys()]
    .map((subject) => {
      const subjectRecords = recentRecords.filter((record) => record.subject === subject);
      const totals = minutesByActivity(subjectRecords);
      return {
        subject,
        lecture: totals.get("東進受講") ?? 0,
        review: totals.get("復習") ?? 0,
      };
    })
    .filter((item) => item.lecture >= 90 && item.review < item.lecture * 0.35)
    .sort((a, b) => b.lecture - a.lecture)
    .slice(0, 2)
    .forEach((item) => {
      alerts.push([
        `${item.subject}は受講の割に復習が少ない`,
        `直近2週間で受講${formatMinutes(item.lecture)}、復習${formatMinutes(item.review)}。今日のやることに復習を入れよう。`,
      ]);
    });

  const currentWeek = weekRange(0);
  const previousWeek = weekRange(-1);
  const currentWeekRecords = recordsInRange(currentWeek.startKey, currentWeek.endKey);
  const previousWeekRecords = recordsInRange(previousWeek.startKey, previousWeek.endKey);
  const practiceSubjects = new Set([
    ...currentWeekRecords
      .filter((record) => (record.activity || "その他") === "問題演習")
      .map((record) => record.subject),
    ...previousWeekRecords
      .filter((record) => (record.activity || "その他") === "問題演習")
      .map((record) => record.subject),
  ]);
  [...practiceSubjects]
    .map((subject) => {
      const current = currentWeekRecords
        .filter((record) => record.subject === subject && (record.activity || "その他") === "問題演習")
        .reduce((sum, record) => sum + record.minutes, 0);
      const previous = previousWeekRecords
        .filter((record) => record.subject === subject && (record.activity || "その他") === "問題演習")
        .reduce((sum, record) => sum + record.minutes, 0);
      return { subject, current, previous };
    })
    .filter((item) => item.previous >= 60 && item.current < item.previous * 0.7)
    .sort((a, b) => (b.previous - b.current) - (a.previous - a.current))
    .slice(0, 2)
    .forEach((item) => {
      alerts.push([
        `${item.subject}の演習時間が先週より落ちています`,
        `先週${formatMinutes(item.previous)}→今週${formatMinutes(item.current)}。落ちた分を1セットだけ戻そう。`,
      ]);
    });

  ["単語", "過去問", "模試復習"].forEach((activity) => {
    const latest = lastRecordDate(records.filter((record) => (record.activity || "その他") === activity));
    if (latest && dayNumber(localDateKey()) - dayNumber(latest) >= 3) {
      alerts.push([
        `${activity}が空いています`,
        `最後の記録は${latest}。放置すると戻すのに時間がかかります。`,
      ]);
    }
  });
  if (records.length >= 3 && !lastRecordDate(records.filter((record) => (record.activity || "その他") === "単語"))) {
    alerts.push([
      "単語の記録がまだありません",
      "英語は毎日の小さい積み上げが効きます。単語をやった日は個数も残そう。",
    ]);
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

  [...latestMockResultBySubject().entries()]
    .filter(([subject, result]) => subject !== "総合" && result.deviation < 50)
    .map(([subject, result]) => {
      const mockDate = new Date(`${result.date}T00:00:00`);
      mockDate.setDate(mockDate.getDate() - 14);
      const studied = recordsInRange(localDateKey(mockDate), localDateKey())
        .filter((record) => record.subject === subject)
        .reduce((sum, record) => sum + record.minutes, 0);
      return { subject, result, studied };
    })
    .filter((item) => item.studied < 180)
    .sort((a, b) => a.studied - b.studied)
    .slice(0, 2)
    .forEach((item) => {
      alerts.push([
        `${item.subject}は偏差値低めなのに時間が足りない`,
        `最新偏差値${item.result.deviation}、直近の記録は${formatMinutes(item.studied)}。優先順位を上げよう。`,
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
  const rangeRecords = records.filter((record) => record.date >= startKey && record.date <= endKey);
  const totals = chartMode === "activity"
    ? minutesBySubjectActivity(rangeRecords)
    : minutesBySubject(rangeRecords);
  const items = [...totals.entries()]
    .map(([key, minutes]) => {
      if (chartMode === "activity") {
        const { subject, activity } = splitSubjectActivityKey(key);
        return {
          key,
          name: `${subject} / ${activity}`,
          subject,
          activity,
          minutes,
        };
      }
      return {
        key,
        name: key,
        subject: key,
        activity: "",
        minutes,
      };
    })
    .sort((a, b) => b.minutes - a.minutes);
  const total = items.reduce((sum, item) => sum + item.minutes, 0);
  const colors = [
    "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
    "var(--chart-6)", "var(--chart-7)", "var(--chart-8)", "var(--chart-9)", "var(--chart-10)",
  ];

  chartRange.textContent = chartPeriod === "day"
    ? `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日`
    : `${formatShortDate(start)}〜${formatShortDate(end)}・${chartMode === "activity" ? "科目×内容別" : "科目別"}`;
  chartTotal.textContent = formatMinutes(total);
  chartLegend.replaceChildren();
  chartDetail.hidden = true;
  chartDetail.replaceChildren();

  if (total === 0) {
    pieChart.style.background = "var(--border)";
    pieChart.setAttribute("aria-label", "この期間の勉強記録はありません");
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = "この期間の勉強記録はありません。";
    chartLegend.append(empty);
    return;
  }

  let accumulated = 0;
  const gradientParts = items.map((item, index) => {
    const startDegree = (accumulated / total) * 360;
    accumulated += item.minutes;
    const endDegree = (accumulated / total) * 360;
    return `${colors[index % colors.length]} ${startDegree}deg ${endDegree}deg`;
  });
  pieChart.style.background = `conic-gradient(${gradientParts.join(", ")})`;
  pieChart.setAttribute(
    "aria-label",
    items.map((item) => `${item.name} ${formatMinutes(item.minutes)}`).join("、"),
  );

  const showDetail = (item) => {
    selectedChartItem = {
      mode: chartMode,
      key: item.key,
      name: item.name,
      subject: item.subject,
      activity: item.activity,
      startKey,
      endKey,
    };
    renderChartDetail(rangeRecords);
    if (chartMode === "subject") {
      openSubjectInsightDialog(item.name, rangeRecords);
    }
  };

  items.forEach((chartItem, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "legend-item";
    item.addEventListener("click", () => showDetail(chartItem));

    const color = document.createElement("span");
    color.className = "legend-color";
    color.style.background = colors[index % colors.length];

    const label = document.createElement("span");
    label.className = "legend-subject";
    label.textContent = chartItem.name;

    const value = document.createElement("span");
    value.className = "legend-value";
    const percentage = Math.round((chartItem.minutes / total) * 100);
    value.textContent = `${formatMinutes(chartItem.minutes)}・${percentage}%`;

    item.append(color, label, value);
    chartLegend.append(item);
  });

  if (selectedChartItem?.mode === chartMode) {
    renderChartDetail(rangeRecords);
  }
}

function renderChartDetail(rangeRecords) {
  if (!selectedChartItem) return;

  const targetRecords = rangeRecords.filter((record) => (
    selectedChartItem.mode === "activity"
      ? (
        record.subject === selectedChartItem.subject
        && (record.activity || "その他") === selectedChartItem.activity
      )
      : record.subject === selectedChartItem.name
  ));
  if (targetRecords.length === 0) return;

  const total = targetRecords.reduce((sum, record) => sum + record.minutes, 0);
  const longest = Math.max(...targetRecords.map((record) => record.minutes));
  const shortest = Math.min(...targetRecords.map((record) => record.minutes));
  const wordTotal = targetRecords.reduce((sum, record) => sum + (Number(record.wordCount) || 0), 0);
  const subTotals = selectedChartItem.mode === "activity"
    ? new Map()
    : minutesByActivity(targetRecords);

  chartDetail.hidden = false;
  chartDetail.replaceChildren();

  const title = document.createElement("h3");
  title.textContent = `${selectedChartItem.name}の詳細`;
  const stats = document.createElement("div");
  stats.className = "detail-stats";
  [
    ["合計", formatMinutes(total)],
    ["記録回数", `${targetRecords.length}回`],
    ["平均", formatMinutes(averageMinutes(targetRecords))],
    ["最長", formatMinutes(longest)],
    ["最短", formatMinutes(shortest)],
    ["英単語", `${wordTotal}個`],
  ].forEach(([label, value]) => {
    stats.append(createValuePair(label, value));
  });

  const breakdown = document.createElement("div");
  breakdown.className = "detail-breakdown";
  [...subTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, minutes]) => {
      breakdown.append(createValuePair(name, formatMinutes(minutes)));
    });

  const recent = document.createElement("div");
  recent.className = "detail-records";
  [...targetRecords]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
    .forEach((record) => {
      const row = document.createElement("div");
      const memo = record.memo ? `・${record.memo}` : "";
      row.textContent = `${record.date}・${record.subject}・${record.activity || "その他"}・${formatMinutes(record.minutes)}${memo}`;
      recent.append(row);
    });

  chartDetail.append(title, stats);
  if (subTotals.size > 0) chartDetail.append(breakdown);
  chartDetail.append(recent);
}

function createInsightStat(label, value) {
  return createValuePair(label, value);
}

function subjectWarnings(subject, sourceRecords) {
  const warnings = [];
  const subjectRecords = sourceRecords.filter((record) => record.subject === subject);
  const activityTotals = minutesByActivity(subjectRecords);
  const lectureMinutes = activityTotals.get("東進受講") ?? 0;
  const reviewMinutes = activityTotals.get("復習") ?? 0;
  const practiceMinutes = activityTotals.get("問題演習") ?? 0;

  if (lectureMinutes >= 90 && reviewMinutes < lectureMinutes * 0.35) {
    warnings.push([
      "受講に対して復習が少ない",
      `受講${formatMinutes(lectureMinutes)}に対して復習${formatMinutes(reviewMinutes)}。受けっぱなしは点に変わりにくい。`,
    ]);
  }
  if (practiceMinutes === 0 && subjectRecords.reduce((sum, record) => sum + record.minutes, 0) >= 180) {
    warnings.push([
      "演習の記録が少ない",
      "インプットだけだと弱点が見えにくい。次は問題演習を1セット入れよう。",
    ]);
  }

  const latestDeviation = latestMockResultBySubject().get(subject);
  if (latestDeviation && latestDeviation.deviation < 50) {
    const mockDate = new Date(`${latestDeviation.date}T00:00:00`);
    mockDate.setDate(mockDate.getDate() - 14);
    const sinceMockRecords = recordsInRange(localDateKey(mockDate), localDateKey())
      .filter((record) => record.subject === subject);
    const sinceMockMinutes = sinceMockRecords.reduce((sum, record) => sum + record.minutes, 0);
    if (sinceMockMinutes < 180) {
      warnings.push([
        "偏差値が低いのに勉強時間が少ない",
        `${latestDeviation.name} 第${latestDeviation.round}回は偏差値${latestDeviation.deviation}。直近の${subject}は${formatMinutes(sinceMockMinutes)}なので、優先度を上げよう。`,
      ]);
    }
  }

  return warnings;
}

function openSubjectInsightDialog(subject, rangeRecords) {
  const subjectRecords = rangeRecords.filter((record) => record.subject === subject);
  if (subjectRecords.length === 0 || !subjectInsightDialog) return;

  const total = subjectRecords.reduce((sum, record) => sum + record.minutes, 0);
  const activityTotals = minutesByActivity(subjectRecords);
  const activityCounts = countByActivity(subjectRecords);
  const words = subjectRecords.reduce((sum, record) => sum + (Number(record.wordCount) || 0), 0);
  const warnings = subjectWarnings(subject, rangeRecords);

  subjectInsightTitle.textContent = `${subject}の内容別分析`;
  subjectInsightBody.replaceChildren();

  const stats = document.createElement("div");
  stats.className = "detail-stats";
  stats.append(
    createInsightStat("期間合計", formatMinutes(total)),
    createInsightStat("記録回数", `${subjectRecords.length}回`),
    createInsightStat("1回平均", formatMinutes(averageMinutes(subjectRecords))),
    createInsightStat("英単語", `${words}個`),
  );

  const activitySection = document.createElement("section");
  activitySection.className = "insight-section";
  const activityTitle = document.createElement("h3");
  activityTitle.textContent = "内容別の平均時間";
  const activityList = document.createElement("div");
  activityList.className = "activity-average-list";
  [...activityTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([activity, minutes]) => {
      const activityRecords = subjectRecords.filter((record) => (record.activity || "その他") === activity);
      const row = document.createElement("div");
      const main = document.createElement("strong");
      main.textContent = activity;
      const detail = document.createElement("span");
      detail.textContent = `${activityCounts.get(activity)}回・合計${formatMinutes(minutes)}・平均${formatMinutes(averageMinutes(activityRecords))}`;
      row.append(main, detail);
      activityList.append(row);
    });
  activitySection.append(activityTitle, activityList);

  const warningSection = document.createElement("section");
  warningSection.className = "insight-section";
  const warningTitle = document.createElement("h3");
  warningTitle.textContent = "危険サイン";
  const warningList = document.createElement("div");
  warningList.className = "insight-warning-list";
  if (warnings.length === 0) {
    const ok = document.createElement("p");
    ok.className = "empty";
    ok.textContent = "この期間では大きな危険サインはありません。記録が増えるほど分析が鋭くなります。";
    warningList.append(ok);
  } else {
    warnings.forEach(([title, message]) => {
      const item = document.createElement("div");
      const strong = document.createElement("strong");
      strong.textContent = title;
      const small = document.createElement("small");
      small.textContent = message;
      item.append(strong, small);
      warningList.append(item);
    });
  }
  warningSection.append(warningTitle, warningList);

  const recentSection = document.createElement("section");
  recentSection.className = "insight-section";
  const recentTitle = document.createElement("h3");
  recentTitle.textContent = "最近の記録";
  const recentList = document.createElement("div");
  recentList.className = "detail-records";
  [...subjectRecords]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .forEach((record) => {
      const row = document.createElement("div");
      const memo = record.memo ? `・${record.memo}` : "";
      row.textContent = `${record.date}・${record.activity || "その他"}・${formatMinutes(record.minutes)}${memo}`;
      recentList.append(row);
    });
  recentSection.append(recentTitle, recentList);

  subjectInsightBody.append(stats, activitySection, warningSection, recentSection);
  subjectInsightDialog.showModal();
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

function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateKeyFromDayNumber(day) {
  const date = new Date(day * 86400000);
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(dateKey, days) {
  return dateKeyFromDayNumber(dayNumber(dateKey) + days);
}

function rangeSize(task) {
  return Math.max(0, Number(task.end) - Number(task.start) + 1);
}

function formatTaskRange(task) { return ScheduleEngine.rangeLabel(task); }

function taskTypeLabel(type) {
  return type === "review" ? "復習" : "新規";
}

function isStudyDay(dateKey, weekdays) {
  if (holidays.includes(dateKey)) return false;
  return weekdays.includes(dateFromKey(dateKey).getDay());
}

function studyDaysBetween(startKey, endKey, weekdays) {
  const days = [];
  for (let day = dayNumber(startKey); day <= dayNumber(endKey); day += 1) {
    const dateKey = dateKeyFromDayNumber(day);
    if (isStudyDay(dateKey, weekdays)) days.push(dateKey);
  }
  return days;
}

function nextStudyDay(dateKey, weekdays, fallbackEndKey = "") {
  let day = dayNumber(dateKey);
  const endDay = fallbackEndKey ? dayNumber(fallbackEndKey) + 60 : day + 365;
  while (day <= endDay) {
    const candidate = dateKeyFromDayNumber(day);
    if (isStudyDay(candidate, weekdays)) return candidate;
    day += 1;
  }
  return dateKey;
}

function planById(planId) {
  return materialPlans.find((plan) => plan.id === planId);
}

function tasksForPlan(planId) {
  return materialTasks.filter((task) => task.planId === planId);
}

function setScheduleStatus(message, type = "") {
  if (!scheduleStatus) return;
  scheduleStatus.textContent = message;
  scheduleStatus.classList.toggle("success", type === "success");
  scheduleStatus.classList.toggle("error", type === "error");
}

function setScheduleEditStatus(message, type = "") {
  if (!scheduleEditStatus) return;
  scheduleEditStatus.textContent = message;
  scheduleEditStatus.classList.toggle("success", type === "success");
  scheduleEditStatus.classList.toggle("error", type === "error");
}

function saveScheduleSnapshot(beforeTasks, afterTasks, summary, before = scheduleState()) {
  lastReschedule={operation:"reschedule",beforeTasks:sanitizeMaterialTasks(beforeTasks),afterTasks:sanitizeMaterialTasks(afterTasks),
    beforePlans:before.plans,afterPlans:structuredClone(materialPlans),beforeHolidays:before.holidays,afterHolidays:[...holidays],summary,createdAt:new Date().toISOString()};
  saveLastReschedule();
}

function generateReviewTasks(newTask, plan) { return ScheduleEngine.reviewsFor(newTask,plan,holidays,createId); }

function generatePlanTasks(plan) {
  try { const result=ScheduleEngine.create(plan,holidays,createId); Object.assign(plan,result.plan); return {ok:true,...result}; }
  catch(error) { return {ok:false,message:error.message}; }
}

function totalUnitsByDate(tasks) {
  const totals = new Map();
  tasks.forEach((task) => {
    totals.set(task.date, (totals.get(task.date) ?? 0) + rangeSize(task));
  });
  return [...totals.entries()];
}

function redistributePlan(planId, startFromKey = localDateKey()) {
  const result=ScheduleEngine.reschedule(materialTasks, materialPlans, holidays,startFromKey,createId,planId);
  materialTasks=sanitizeMaterialTasks(result.tasks);saveMaterialTasks();return result;
}

function redistributeAllPlans(startFromKey = localDateKey(), before = scheduleState(), onlyPlanId = "") {
  const result=ScheduleEngine.reschedule(materialTasks,materialPlans,holidays,startFromKey,createId,onlyPlanId);
  materialTasks=sanitizeMaterialTasks(result.tasks); materialPlans=sanitizeMaterialPlans(result.plans);
  saveMaterialTasks();saveMaterialPlans();saveHolidays();
  const summary=[`未完了の予定を${result.moved}件再調整しました。固定・完了済みの予定は保持しました。`,...result.warnings].join(" ");
  saveScheduleSnapshot(before.tasks,materialTasks,summary,before);
  return summary;
}

function adjustReviewsForNewTask(newTask) {
  const plan=planById(newTask.planId);if(!plan||newTask.type!=="new")return;
  materialTasks=ScheduleEngine.hydrate(materialTasks,materialPlans,holidays);
  const linked=materialTasks.filter(t=>t.sourceNewId===newTask.id);
  materialTasks=sanitizeMaterialTasks(materialTasks.filter(t=>t.sourceNewId!==newTask.id).concat(ScheduleEngine.reviewsFor(newTask,plan,holidays,createId,linked)));
  saveMaterialTasks();
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
  const badges = buildBadgeDefinitions(
    totalMinutes,
    longestStreak,
    totalWordCount,
    studyDayCount,
    currentLevel,
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

    item.dataset.state = unlocked ? "unlocked" : "locked";
    item.setAttribute("aria-label", `${badge.name}：${unlocked ? "獲得済み" : "未獲得"}、${condition.textContent}`);
    const progress = document.createElement("progress");
    progress.className = "badge-progress";
    progress.max = badge.goal;
    progress.value = Math.min(badge.value, badge.goal);
    progress.setAttribute("aria-label", `${badge.name}の達成度`);
    item.append(icon, name, condition, progress);
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
      const before=scheduleState();
      holidays = holidays.filter((holiday) => holiday !== date);
      const summary = redistributeAllPlans(localDateKey(),before);
      setScheduleStatus(summary, "success");
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

const mockPageStarts=new Map();
function createMockLineChart(titleText, allEvents, series, featured=false, mockName='') {
  const card=chartNode('section','line-chart-card'+(featured?' featured':''));
  const key=mockName+' / '+titleText;
  const draw=()=>{
    card.replaceChildren(chartNode('h4','',titleText));
    const count=window.innerWidth<=560?3:6;
    const start=Math.max(0,Math.min(mockPageStarts.get(key)??Math.max(0,allEvents.length-count),Math.max(0,allEvents.length-count)));
    const events=allEvents.slice(start,start+count);
    if(!events.length)return;
    const controls=chartNode('div','chart-page-controls');
    for(const [label,next,disabled] of [['前へ',Math.max(0,start-count),start===0],['最新',Math.max(0,allEvents.length-count),start+count>=allEvents.length],['次へ',Math.min(allEvents.length-count,start+count),start+count>=allEvents.length]]){
      const button=chartNode('button','secondary-button',label);button.type='button';button.disabled=disabled;button.setAttribute('aria-label',mockName+' '+titleText+' '+label);button.onclick=()=>{mockPageStarts.set(key,next);draw();};controls.append(button);
    }
    card.append(controls,chartNode('p','chart-visible-range',events[0].date+' 〜 '+events.at(-1).date+'（'+(start+1)+'〜'+(start+events.length)+' / '+allEvents.length+'回）'));
    const active=series.filter(item=>events.some(e=>Number.isFinite(item.values.get(e.key))));
    if(!active.length){card.append(chartNode('p','chart-empty','この期間の偏差値は未登録です。'));return;}
    const legend=chartNode('div','line-chart-legend');
    for(const item of active){const label=chartNode('span'),mark=chartNode('i');mark.style.background=item.color;label.append(mark,document.createTextNode(item.name));legend.append(label);}card.append(legend);
    // The SVG uses its actual container width: no minimum width or scrollable canvas.
    const containerWidth=card._plotWidth||Math.max(180,Math.min(760,mockChart.clientWidth-50));
    const width=Math.max(160,containerWidth),height=240,margin={left:34,right:26,top:24,bottom:48};
    const plotWidth=width-margin.left-margin.right,plotHeight=height-margin.top-margin.bottom;
    const xAt=i=>events.length===1?margin.left+plotWidth/2:margin.left+i*plotWidth/(events.length-1);
    const yAt=value=>margin.top+(100-value)/100*plotHeight;
    const svg=createSvgElement('svg',{class:'mock-line-svg',viewBox:'0 0 '+width+' '+height,width:'100%',role:'group','aria-label':mockName+' '+titleText+' 偏差値0〜100'});
    for(let value=0;value<=100;value+=20){const y=yAt(value);svg.append(createSvgElement('line',{x1:margin.left,y1:y,x2:width-margin.right,y2:y,class:value?'chart-grid-line':'chart-axis-line'}),createSvgElement('text',{x:margin.left-6,y:y+4,'text-anchor':'end',class:'chart-axis-label'},value));}
    events.forEach((event,i)=>svg.append(createSvgElement('text',{x:xAt(i),y:height-24,'text-anchor':'middle',class:'chart-x-label'},Number(event.date.slice(5,7))+'/'+Number(event.date.slice(8)))));
    const detail=chartNode('p','mock-point-detail','点をタップすると模試名・受験日・偏差値を確認できます。');detail.setAttribute('aria-live','polite');
    for(const item of active){let path='',drawing=false;events.forEach((event,i)=>{const value=item.values.get(event.key);if(!Number.isFinite(value)){drawing=false;return;}path+=(drawing?'L':'M')+xAt(i)+','+yAt(value)+' ';drawing=true;});svg.append(createSvgElement('path',{d:path,stroke:item.color,'stroke-width':3,class:'mock-line-path'}));
      events.forEach((event,i)=>{const value=item.values.get(event.key);if(!Number.isFinite(value))return;
        const label=mockName+'／'+(event.round?'第'+event.round+'回':'回数未設定')+'／'+event.date+'／'+item.name+' 偏差値'+value;
        const point=createSvgElement('g',{role:'button',tabindex:0,'aria-label':label,class:'mock-point-button'});
        point.append(createSvgElement('circle',{cx:xAt(i),cy:yAt(value),r:22,fill:'transparent'}),createSvgElement('circle',{cx:xAt(i),cy:yAt(value),r:5,fill:item.color}),createSvgElement('title',{},label));
        const select=()=>{detail.textContent=label;};point.addEventListener('click',select);point.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});svg.append(point,createSvgElement('text',{x:xAt(i),y:yAt(value)-10,'text-anchor':'middle',class:'chart-value-label',fill:item.color,'pointer-events':'none'},value));
      });
    }
    const plot=chartNode('div','line-chart-scroll');plot.append(svg);card.append(plot,detail);
  };
  draw();
  // A collapsed series has no width until opened; resize then keeps labels at 13px.
  const observer=new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width>0&&Math.abs((card._plotWidth||0)-width)>1){card._plotWidth=width;draw();}});
  observer.observe(card);card.chartObserver=observer;
  return card;
}

function refreshMockChartLayout() {
  const opened = [...mockChart.querySelectorAll("details")].map((details) => details.open);
  renderMockResults();
  [...mockChart.querySelectorAll("details")].forEach((details, index) => {
    if (opened[index] !== undefined) details.open = opened[index];
  });
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
  mockChart.querySelectorAll(".line-chart-card").forEach(card=>card.chartObserver?.disconnect());
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
        "var(--chart-2)", "var(--chart-5)", "var(--chart-3)", "var(--chart-4)", "var(--chart-8)",
        "var(--chart-7)", "var(--chart-1)", "var(--chart-9)", "var(--chart-10)", "var(--chart-6)",
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
        [{ name: "総合", color: "var(--chart-1)", values: valuesFor("総合") }],
        true, mockName,
      ));
      body.append(createMockComparison(mockName,events,results,colorBySubject));

      const individualHeading = document.createElement("h3");
      individualHeading.className = "individual-chart-heading";
      individualHeading.textContent = "科目別の推移";
      body.append(individualHeading);
      regularSubjects.forEach((subject) => {
        body.append(createMockLineChart(
          `${subject}の推移`,
          events,
          [{ name: subject, color: colorBySubject.get(subject), values: valuesFor(subject) }],
          false, mockName,
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
    ? "最高レベル到達。5000時間の節目まで積み上げました。"
    : `次のレベルまで ${formatMinutes(levelInfo.remainingMinutes)}`;
  ultimateGoalLabel.textContent = `目標：${profile.goal}`;
  fiveThousandProgress.textContent =
    `${Math.floor(totalMinutes / 60)} / ${MAX_LEVEL_HOURS}時間の節目`;
  levelSummary.textContent = `${title}・累計${formatMinutes(totalMinutes)}`;
  levelSummaryBadge.textContent = `Lv.${levelInfo.level}`;

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

function showBestUpdate(message) {
  clearTimeout(bestToastTimer);
  bestToastMessage.textContent = message;
  bestToast.hidden = false;
  bestToastTimer = setTimeout(() => {
    bestToast.hidden = true;
  }, 3200);
}

function parseRecordFormValues({
  id = createId(),
  date,
  subject,
  activity,
  memo,
  hours,
  minutes,
  wordCount,
}) {
  const cleanSubject = subject.trim();
  const cleanMemo = memo.trim().slice(0, 80);
  const studyHours = Number(hours);
  const studyMinutes = Number(minutes);
  const totalMinutes = studyHours * 60 + studyMinutes;
  const words = wordCount === "" ? 0 : Number(wordCount);

  if (
    !isDateKey(date)
    || !cleanSubject
    || !activity
    || !Number.isInteger(studyHours) || studyHours < 0 || studyHours > 23
    || !Number.isInteger(studyMinutes) || studyMinutes < 0 || studyMinutes > 59
    || totalMinutes < 1
    || !Number.isInteger(words) || words < 0 || words > 10000
  ) {
    return {
      ok: false,
      message: "日付・科目・内容・勉強時間を確認してください。時間は1分以上、23時間59分以内です。",
    };
  }

  return {
    ok: true,
    record: {
      id,
      date,
      subject: cleanSubject,
      activity,
      memo: cleanMemo,
      minutes: totalMinutes,
      wordCount: words,
    },
  };
}

function parseScheduleFormValues({
  id = createId(),
  planId = "",
  sourceNewId = "",
  material,
  unit,
  date,
  type,
  start,
  end,
  fixed = false,
  done = false,
  manual = true,
  createdAt = new Date().toISOString(),
}) {
  const cleanMaterial = material.trim().slice(0, 40);
  const cleanUnit = unit.trim().slice(0, 12);
  const range = sanitizeRangeStartEnd(start, end);
  const cleanType = type === "review" ? "review" : "new";
  if (!cleanMaterial || !cleanUnit || !isDateKey(date) || !range) {
    return {
      ok: false,
      message: "教材名・日付・範囲を確認してください。範囲は 1〜800 のように数字で入れます。",
    };
  }
  return {
    ok: true,
    task: {
      id,
      planId,
      sourceNewId,
      material: cleanMaterial,
      unit: cleanUnit,
      date,
      start: range.start,
      end: range.end,
      type: cleanType,
      fixed: Boolean(fixed),
      done: Boolean(done),
      manual: Boolean(manual),
      createdAt,
    },
  };
}

function openScheduleEditDialog(task) {
  editScheduleIdInput.value = task.id;
  editScheduleDateInput.value = task.date;
  editScheduleMaterialInput.value = task.material;
  editScheduleUnitInput.value = task.unit;
  editScheduleTypeInput.value = task.type;
  editScheduleStartInput.value = task.start;
  editScheduleEndInput.value = task.end;
  editScheduleFixedInput.checked = task.fixed;
  editScheduleMaterialInput.disabled=Boolean(task.planId);
  editScheduleUnitInput.disabled=Boolean(task.planId);
  editScheduleTypeInput.disabled=true;
  initializeTaskEdit(task);
  setScheduleEditStatus("");
  scheduleEditDialog.showModal();
}

function openRecordEditDialog(record) {
  editRecordIdInput.value = record.id;
  editStudyDateInput.value = record.date;
  editSubjectInput.value = record.subject;
  editActivityTypeInput.value = record.activity || "その他";
  editStudyHoursInput.value = Math.floor(record.minutes / 60);
  editStudyMinutesInput.value = record.minutes % 60;
  editWordCountInput.value = record.wordCount || "";
  editStudyMemoInput.value = record.memo || "";
  setRecordEditStatus("");
  recordEditDialog.showModal();
}

function switchTab(selectedTab) {
  if (!["home", "schedule", "record", "analysis", "badges"].includes(selectedTab)) return;
  document.body.dataset.screen = selectedTab;
  tabButtons.forEach((item) => {
    const selected = item.dataset.tab === selectedTab;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== selectedTab;
  });
  if (selectedTab === "analysis") {
    renderStudyBars();
    refreshMockChartLayout();
    requestAnimationFrame(updateChartScrollHints);
  }
  window.scrollTo({ top: 0, behavior: "instant" });
}

function render() {
  recordList.replaceChildren();
  emptyMessage.hidden = records.length > 0;
  deleteAllButton.hidden = records.length === 0;

  for (const record of records) {
    const item = template.content.cloneNode(true);
    item.querySelector(".record-subject").textContent = `${record.subject} / ${record.activity || "その他"}`;
    item.querySelector(".record-date").textContent = record.memo
      ? `${record.date}・${record.memo}`
      : record.date;
    if(record.scheduleTaskId){const task=materialTasks.find(t=>t.id===record.scheduleTaskId);item.querySelector(".record-date").textContent+=task?task.done?"・予定完了と連動":"・予定は未完了（実績を保持）":"・予定から作成した記録";}
    const words = Number(record.wordCount) || 0;
    item.querySelector(".record-words").textContent =
      words > 0 ? `英単語 ${words}個` : "";
    item.querySelector(".record-minutes").textContent = formatMinutes(record.minutes);
    item.querySelector(".edit-button").addEventListener("click", () => {
      openRecordEditDialog(record);
    });
    item.querySelector(".delete-button").addEventListener("click", () => {
      const nextRecords = records.filter((item) => item.id !== record.id);
      if (!tryCommitRecords(nextRecords)) {
        setRecordStatus("保存できなかったため、記録を削除できませんでした。ブラウザの空き容量や設定を確認してください。", "error");
        return;
      }
      setRecordStatus("記録を削除しました。", "success");
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

  setReadableDuration(allTotal, formatMinutes(total));
  setReadableDuration(todayTotal, formatMinutes(today));
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
      ? "まずはひとつ、できることから。"
      : `あと${formatMinutes(dailyGoal - today)}。自分のペースで。`;
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
  renderActivityOptions();
  renderQuickFillButtons();
  renderPaceAndRoadmap(total);
  renderBadgeMission(total, streaks.best, totalWordCount, studyDayCount, currentLevel);
  renderMonthlyRecap();
  renderLevelAndProfile(total, streaks, unlockedBadgeCount);
  renderHolidays();
  renderMockResults();
  renderSubjectChart();
  renderCalendar();
  renderSchedule();
  renderStudyBars();
  document.dispatchEvent(new Event("manabi:render"));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const previousTotal = records.reduce((sum, record) => sum + record.minutes, 0);
  const previousLevel = calculateLevel(previousTotal).level;
  const previousBestDay = Math.max(0, ...Object.values(studyMinutesByDate()));
  const previousTodayTotal = records
    .filter((record) => record.date === localDateKey())
    .reduce((sum, record) => sum + record.minutes, 0);
  const parsed = parseRecordFormValues({
    date: studyDateInput.value,
    subject: subjectInput.value,
    activity: activityTypeInput.value,
    memo: studyMemoInput.value,
    hours: studyHoursInput.value,
    minutes: studyMinutesInput.value,
    wordCount: wordCountInput.value,
  });
  if (!parsed.ok) {
    setRecordStatus(parsed.message, "error");
    return;
  }

  const nextRecords = [parsed.record, ...records];
  if (!tryCommitRecords(nextRecords)) {
    setRecordStatus("保存できませんでした。入力内容は残しています。ブラウザの空き容量やプライベートモード設定を確認してください。", "error");
    return;
  }

  render();
  setRecordStatus("記録しました。", "success");
  const newLevel = calculateLevel(previousTotal + parsed.record.minutes).level;
  if (newLevel > previousLevel) {
    showLevelUp(newLevel);
  }
  if (parsed.record.date === localDateKey() && previousTodayTotal + parsed.record.minutes > previousBestDay) {
    showBestUpdate(`1日の最高記録 ${formatMinutes(previousTodayTotal + parsed.record.minutes)}`);
  }
  const keepActivity = parsed.record.activity;
  form.reset();
  studyDateInput.value = localDateKey();
  activityTypeInput.value = keepActivity;
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

addActivityOptionButton.addEventListener("click", () => {
  const option = activityOptionInput.value.trim().slice(0, 24);
  if (!option) {
    alert("追加する内容を入力してください。");
    return;
  }
  if (!activityOptions.includes(option)) {
    activityOptions.push(option);
    activityOptions = sanitizeActivityOptions(activityOptions);
    saveActivityOptions();
    renderActivityOptions();
  }
  activityTypeInput.value = option;
  activityOptionInput.value = "";
});

subjectInput.addEventListener("input", renderQuickFillButtons);

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

materialPlanForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const parsed=readMaterialDraft();
  if(!parsed.ok){setScheduleStatus(parsed.message,"error");return;}
  const plan=parsed.plan,generated=generatePlanTasks(plan);
  if(!generated.ok){setScheduleStatus(generated.message,"error");return;}
  materialPlans=sanitizeMaterialPlans([...materialPlans,plan]);materialTasks=sanitizeMaterialTasks([...materialTasks,...generated.tasks]);
  saveMaterialPlans();saveMaterialTasks();lastReschedule=null;saveLastReschedule();
  scheduleSelectedDate=plan.startDate;scheduleMonth=plan.startDate.slice(0,7);
  setScheduleStatus(`${plan.material}を作成しました。新規 ${generated.unitsPerDay}${ScheduleEngine.quantityUnit(plan.unit)}/日が目安です。復習は新規学習の完了日に合わせて調整します。`,"success");
  materialPlanForm.reset();materialStartDateInput.value=localDateKey();materialEndDateInput.value=localDateKey();scheduleElement("materialReviewOffsets").value=scheduleSettings.reviewOffsets.join(",");updateMaterialDraft();render();
});

manualScheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const parsed = parseScheduleFormValues({
    material: manualMaterialNameInput.value,
    unit: manualMaterialUnitInput.value,
    date: manualScheduleDateInput.value,
    type: manualScheduleTypeInput.value,
    start: manualRangeStartInput.value,
    end: manualRangeEndInput.value,
    fixed: manualScheduleFixedInput.checked,
    manual: true,
  });
  if (!parsed.ok) {
    setScheduleStatus(parsed.message, "error");
    return;
  }
  materialTasks = sanitizeMaterialTasks([parsed.task, ...materialTasks]);
  saveMaterialTasks();
  manualScheduleForm.reset();
  manualScheduleDateInput.value = localDateKey();
  manualScheduleFixedInput.checked = true;
  setScheduleStatus("手動予定を追加しました。必要なら固定を外して自動調整対象にできます。", "success");
  render();
});

scheduleSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const offsets = reviewOffsetsInput.value
    .split(/[,\s、]+/)
    .map(Number)
    .filter((value) => Number.isFinite(value));
  const maxNew = Number(maxNewUnitsPerDayInput.value);
  const maxTotal = Number(maxTotalUnitsPerDayInput.value);
  const nextSettings = sanitizeScheduleSettings({
    reviewOffsets: offsets,
    maxNewUnitsPerDay: maxNew,
    maxTotalUnitsPerDay: maxTotal,
  });
  scheduleSettings = nextSettings;
  reviewOffsetsInput.value = scheduleSettings.reviewOffsets.join(",");
  maxNewUnitsPerDayInput.value = scheduleSettings.maxNewUnitsPerDay;
  maxTotalUnitsPerDayInput.value = scheduleSettings.maxTotalUnitsPerDay;
  saveScheduleSettings();
  setScheduleStatus("新しい教材の復習間隔の初期値と、単位ごとの負担基準を保存しました。既存教材は「教材の設定」で変更できます。", "success");
});

holidayForm.addEventListener("submit", (event) => {
  event.preventDefault();const date=holidayDateInput.value;
  if(!isDateKey(date)||holidays.includes(date)){setScheduleStatus("有効な日付を選んでください。その日がすでに休日の場合は追加できません。","error");return;}
  const before=scheduleState();holidays.push(date);
  setScheduleStatus(redistributeAllPlans(localDateKey(),before),"success");render();
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
  if (subject !== "総合" && deviation < 50) {
    const shouldAddReview = confirm(`${subject}の偏差値が低めです。今日やることに「${subject} 模試復習」を追加しますか？`);
    if (shouldAddReview) {
      todos.unshift({
        id: createId(),
        text: `${subject} 模試復習`,
        date: localDateKey(),
        done: false,
      });
      saveTodos();
    }
  }
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

subjectInsightCloseButton.addEventListener("click", () => {
  subjectInsightDialog.close();
});

recordEditCloseButton.addEventListener("click", () => {
  recordEditDialog.close();
});

scheduleEditCloseButton.addEventListener("click", () => {
  scheduleEditDialog.close();
});

recordEditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const recordId = editRecordIdInput.value;
  const original = records.find((record) => record.id === recordId);
  if (!original) {
    setRecordEditStatus("編集する記録が見つかりませんでした。画面を更新して確認してください。", "error");
    return;
  }

  const parsed = parseRecordFormValues({
    id: recordId,
    date: editStudyDateInput.value,
    subject: editSubjectInput.value,
    activity: editActivityTypeInput.value,
    memo: editStudyMemoInput.value,
    hours: editStudyHoursInput.value,
    minutes: editStudyMinutesInput.value,
    wordCount: editWordCountInput.value,
  });
  if (!parsed.ok) {
    setRecordEditStatus(parsed.message, "error");
    return;
  }

  const nextRecords = records.map((record) => (
    record.id === recordId ? {...original,...parsed.record} : record
  ));
  if (!tryCommitRecords(nextRecords)) {
    setRecordEditStatus(recordCommitError || "保存できませんでした。入力内容は残しています。", "error");
    return;
  }

  render();
  setRecordStatus("記録を編集しました。", "success");
  recordEditDialog.close();
});

scheduleEditForm.addEventListener("submit", event => { event.preventDefault(); previewTaskEdit(); });

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
    if (!tryCommitRecords([])) {
      setRecordStatus("保存できなかったため、記録を削除できませんでした。ブラウザの空き容量や設定を確認してください。", "error");
      return;
    }
    setRecordStatus("すべての勉強記録を削除しました。", "success");
    render();
  }
});

goRecordButton.addEventListener("click", () => {
  switchTab("record");
  studyDateInput.value = studyDateInput.value || localDateKey();
  document.querySelector('[data-batch-minutes]')?.focus();
});

goScheduleButton.addEventListener("click", () => {
  scheduleSelectedDate=localDateKey();scheduleMonth=scheduleSelectedDate.slice(0,7);renderSchedule();
  switchTab("schedule");
});

scheduleMaterialFilter.addEventListener("change", renderSchedule);

rescheduleButton.addEventListener("click", () => {
  if (materialTasks.length === 0) {
    setScheduleStatus("再調整する教材予定がまだありません。", "error");
    return;
  }
  const summary = redistributeAllPlans(localDateKey());
  setScheduleStatus(summary, "success");
  render();
});

undoRescheduleButton.addEventListener("click", () => {
  undoScheduleChange();
});

previousMonthButton.addEventListener("click", () => {
  visibleMonth.setMonth(visibleMonth.getMonth() - 1);
  renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
  visibleMonth.setMonth(visibleMonth.getMonth() + 1);
  renderCalendar();
});

previousChartPeriodButton.addEventListener("click", () => moveChartPeriod(-1));
currentChartPeriodButton.addEventListener("click", () => {
  chartCursorDate = new Date();
  chartCursorDate.setHours(0, 0, 0, 0);
  selectedChartItem = null;
  renderSubjectChart();
  renderMonthlyRecap();
});
nextChartPeriodButton.addEventListener("click", () => moveChartPeriod(1));

periodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    chartPeriod = button.dataset.period;
    selectedChartItem = null;
    periodButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderSubjectChart();
    renderMonthlyRecap();
  });
});

chartModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    chartMode = button.dataset.chartMode;
    selectedChartItem = null;
    chartModeButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderSubjectChart();
  });
});

badgeFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    badgeFilter = button.dataset.badgeFilter;
    badgeFilterButtons.forEach((item) => { item.classList.toggle("active", item === button); item.setAttribute("aria-pressed", String(item === button)); });
    render();
  });
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.dataset.tab);
  });
});

window.addEventListener("resize", updateChartScrollHints);

updateCountdown();
setInterval(updateCountdown, 1000);
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js?v=17").catch(() => {});
  });
}

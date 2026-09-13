/* Presentation interactions. Scheduling and backup data stay in app.js. */
(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('#themeToggle');
  const themeChoices = document.querySelectorAll('[data-theme-choice]');
  const themeStatus = document.querySelector('#themeStatus');
  const settings = document.querySelector('#settingsDialog');
  const themeKey = 'study-theme-v1';
  function applyTheme(theme, persist = false) {
    theme = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101113' : '#f5f5f7';
    themeToggle.setAttribute('aria-label', `${theme === 'dark' ? 'ライト' : 'ダーク'}テーマに切り替える`);
    themeToggle.title = themeToggle.getAttribute('aria-label');
    const choice = [...themeChoices].find(button => button.dataset.themeChoice !== theme);
    themeToggle.replaceChildren(choice.querySelector('svg').cloneNode(true));
    themeChoices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
    if (persist) {
      try {
        localStorage.setItem(themeKey, theme);
        themeStatus.textContent = `${theme === 'dark' ? 'ダーク' : 'ライト'}テーマを保存しました。`;
      } catch {
        themeStatus.textContent = 'このブラウザではテーマを保存できません。現在の画面には適用しました。';
      }
    }
  }
  themeToggle.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
  themeChoices.forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.themeChoice, true)));
  window.addEventListener('storage', event => { if (event.key === themeKey) applyTheme(event.newValue); });
  document.querySelector('#settingsButton').addEventListener('click', () => settings.showModal());
  document.querySelector('#settingsCloseButton').addEventListener('click', () => settings.close());
  applyTheme(root.dataset.theme);

  // Put creation within reach even when a material has many future tasks.
  const createDetails = document.querySelector('.plan-create-details');
  const addPlan = document.createElement('button');
  addPlan.type = 'button';
  addPlan.className = 'add-plan-button';
  addPlan.textContent = '＋ 教材を追加';
  addPlan.addEventListener('click', () => {
    createDetails.open = true;
    document.querySelector('#materialName').focus();
  });
  document.querySelector('.screen-schedule .page-heading').append(addPlan);
  ['materialPlanForm', 'manualScheduleForm', 'scheduleSettingsForm'].forEach(id => {
    const planForm = document.getElementById(id);
    const feedback = document.createElement('p');
    feedback.className = 'form-status';
    feedback.setAttribute('role', 'status');
    planForm.append(feedback);
    planForm.addEventListener('submit', () => {
      const status = document.querySelector('#scheduleStatus');
      feedback.textContent = status.textContent;
      feedback.className = status.className;
    });
  });

  const dateLabel = document.querySelector('#todayDate');
  function updateDate() {
    const now = new Date();
    dateLabel.textContent = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(now);
    dateLabel.dateTime = localDateKey(now);
  }
  updateDate();
  window.addEventListener('focus', updateDate);

  const nav = document.querySelector('.app-tabs');
  const tabs = [...nav.querySelectorAll('[role="tab"]')];
  nav.addEventListener('keydown', event => {
    const current = tabs.indexOf(event.target);
    if (current < 0) return;
    const offsets = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next;
    if (event.key in offsets) next = (current + offsets[event.key] + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    switchTab(tabs[next].dataset.tab);
    tabs[next].focus();
  });
  for (const dialog of document.querySelectorAll('dialog')) {
    if (!dialog.hasAttribute('aria-label') && !dialog.hasAttribute('aria-labelledby')) {
      const title = dialog.querySelector('h2');
      title.id ||= `${dialog.id}Title`;
      dialog.setAttribute('aria-labelledby', title.id);
    }
    dialog.addEventListener('close', syncKeyboard);
  }

  const hours = document.querySelector('#studyHours');
  const minutes = document.querySelector('#studyMinutes');
  const presets = document.querySelectorAll('[data-duration]');
  function syncPresets() {
    const total = Number(hours.value) * 60 + Number(minutes.value);
    presets.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.duration) === total)));
  }
  presets.forEach(button => button.addEventListener('click', () => {
    const total = Number(button.dataset.duration);
    hours.value = Math.floor(total / 60);
    minutes.value = total % 60;
    syncPresets();
  }));
  hours.addEventListener('input', syncPresets);
  minutes.addEventListener('input', syncPresets);
  document.querySelector('#studyForm').addEventListener('reset', () => requestAnimationFrame(syncPresets));
  document.querySelectorAll('.quick-buttons').forEach(group => group.addEventListener('click', syncPresets));
  syncPresets();

  // Mobile keyboards can resize the layout viewport or only the visual viewport.
  // Keep a baseline for both models; ignore pinch zoom and restore nav on blur.
  let baselineHeight = window.innerHeight;
  function syncKeyboard() {
    const view = window.visualViewport;
    const active = document.activeElement;
    const editing = active?.matches('input:not([type="checkbox"]):not([type="file"]), textarea, select, [contenteditable="true"]');
    if (!editing) baselineHeight = window.innerHeight;
    const height = view?.height ?? window.innerHeight;
    const keyboard = window.innerWidth <= 900 && editing && (!view || view.scale === 1) && baselineHeight - height > 140;
    document.body.classList.toggle('keyboard-open', Boolean(keyboard));
  }
  window.visualViewport?.addEventListener('resize', syncKeyboard);
  window.addEventListener('resize', syncKeyboard);
  window.addEventListener('orientationchange', () => { baselineHeight = window.innerHeight; syncKeyboard(); });
  document.addEventListener('focusin', syncKeyboard);
  document.addEventListener('focusout', () => requestAnimationFrame(syncKeyboard));
  let chartWidth = window.innerWidth;
  let chartResize;
  window.addEventListener('resize', () => {
    if (chartWidth === window.innerWidth) return;
    chartWidth = window.innerWidth;
    clearTimeout(chartResize);
    chartResize = setTimeout(() => {
      if (!document.querySelector('#panel-analysis').hidden) refreshMockChartLayout();
    }, 100);
  });
})();

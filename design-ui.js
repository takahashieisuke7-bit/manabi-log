/* Presentation adapters: use the existing validation, level and storage functions. */
function parseBatchRecords({ date, rows, words, activity }) {
  const wordCount = words === '' ? 0 : Number(words);
  if (!Number.isInteger(wordCount) || wordCount < 0 || wordCount > 10000) {
    return { ok: false, message: '英単語数は0〜10000の整数で入力してください。' };
  }
  const entered = rows.filter(row => row.minutes !== '');
  if (!entered.length) return { ok: false, message: '勉強した科目に、1分以上の時間を入力してください。' };
  const englishIndex = entered.findIndex(row => row.subject.trim() === '英語');
  if (wordCount && englishIndex < 0) {
    return { ok: false, message: '英単語数を残すには「英語」の学習時間も入力してください。詳しく記録から別の科目にも登録できます。' };
  }
  const parsed = entered.map((row, index) => {
    const duration = Number(row.minutes);
    if (!Number.isInteger(duration) || duration < 1 || duration > 1439) {
      return { ok: false, message: `${row.subject || '各科目'}の時間は1〜1439分の整数で入力してください。` };
    }
    return parseRecordFormValues({ date, subject: row.subject, activity, memo: '',
      hours: Math.floor(duration / 60), minutes: duration % 60,
      wordCount: index === englishIndex ? wordCount : 0 });
  });
  const invalid = parsed.find(result => !result.ok);
  return invalid || { ok: true, records: parsed.map(result => result.record) };
}

(() => {
  const byId = id => document.getElementById(id);
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const batchForm = byId('batchForm');
  const batchRows = byId('batchRows');
  const batchStatus = byId('batchStatus');
  const batchActivity = byId('batchActivity');
  let rowSequence = 0;
  function refreshBatchTotal() {
    const total = [...batchRows.querySelectorAll('[data-batch-minutes]')].reduce((sum, input) => {
      const value = Number(input.value);
      return sum + (Number.isInteger(value) && value > 0 && value < 1440 ? value : 0);
    }, 0);
    byId('batchTotal').textContent = formatMinutes(total);
  }
  function addBatchRow(subject = '') {
    const index = ++rowSequence;
    const row = node('div', 'batch-row');
    const name = node('input');
    name.value = subject;
    name.maxLength = 30;
    name.placeholder = '科目名';
    name.dataset.batchSubject = '';
    name.setAttribute('aria-label', `科目${index}`);
    name.setAttribute('list', 'subjectOptions');
    const unit = node('div', 'unit-input');
    const minutes = node('input');
    minutes.type = 'number'; minutes.min = '1'; minutes.max = '1439'; minutes.step = '1';
    minutes.inputMode = 'numeric'; minutes.placeholder = '0'; minutes.dataset.batchMinutes = '';
    const updateLabel = () => minutes.setAttribute('aria-label', `${name.value || '科目' + index}の学習時間（分）`);
    updateLabel(); name.addEventListener('input', updateLabel);
    const remove = node('button', 'batch-remove', '×');
    remove.type = 'button'; remove.setAttribute('aria-label', `科目${index}の入力欄を削除`);
    remove.addEventListener('click', () => { row.remove(); refreshBatchTotal(); });
    unit.append(minutes, node('span', '', '分'));
    row.append(name, unit, remove); batchRows.append(row);
    return name;
  }
  function updateActivityChoices() {
    const selected = batchActivity.value;
    const values = [...new Set([...activityOptions, 'その他'])];
    batchActivity.replaceChildren(...values.map(value => {
      const option = node('option', '', value); option.value = value; return option;
    }));
    batchActivity.value = values.includes(selected) ? selected : 'その他';
    byId('batchActivitySummary').textContent = batchActivity.value;
  }
  function renderHomeGoals() {
    const totals = todayMinutesBySubject();
    const host = byId('homeSubjectGoals'); host.replaceChildren();
    for (const goal of subjectGoals) {
      const studied = totals.get(goal.subject) || 0;
      const complete = studied >= goal.minutes;
      const row = node('div', 'home-goal' + (complete ? ' is-complete' : ''));
      const label = node('div', 'home-goal-label');
      label.append(node('strong', '', goal.subject), node('span', '', `${studied} / ${goal.minutes}分`));
      const track = node('div', 'subject-goal-track');
      track.setAttribute('role', 'progressbar');
      track.setAttribute('aria-label', `${goal.subject}の目標達成率`);
      track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', '100');
      track.setAttribute('aria-valuenow', String(Math.min(100, Math.floor(studied / goal.minutes * 100))));
      const bar = node('div', 'subject-goal-bar' + (complete ? ' completed' : ''));
      bar.style.width = `${Math.min(100, studied / goal.minutes * 100)}%`; track.append(bar);
      row.append(label, track, node('small', 'home-goal-remaining', complete ? '✓ 達成' : `あと${formatMinutes(goal.minutes - studied)}`));
      host.append(row);
    }
  }
  function renderGrowth() {
    const total = records.reduce((sum, record) => sum + record.minutes, 0);
    const info = calculateLevel(total);
    byId('xpPercent').textContent = info.level === 100 ? 'MAX' : `${Math.floor(info.progress)}%`;
    byId('todayGoalTarget').textContent = dailyGoal ? `/ ${formatMinutes(dailyGoal)}` : '';
    byId('editTodayGoal').textContent = dailyGoal ? '目標を変更' : '今日の目標を決める';
    const days = Math.max(0, Math.floor((EXAM_DATE.getTime() - Date.now()) / 86400000));
    byId('countdownDays').textContent = EXAM_DATE.getTime() <= Date.now() ? '当日' : `あと ${days}日`;
    // Find the next existing title. No new thresholds or achievement rules.
    let next = info.level + 1;
    while (next <= 100 && getLevelTitle(next) === getLevelTitle(info.level)) next++;
    const titleTrack = byId('titleProgress');
    if (next <= 100) {
      const threshold = Math.ceil(MAX_LEVEL_HOURS * ((next - 1) / 99) ** 2 * 60);
      let start = info.level;
      while (start > 1 && getLevelTitle(start - 1) === getLevelTitle(info.level)) start--;
      const startMinutes = MAX_LEVEL_HOURS * ((start - 1) / 99) ** 2 * 60;
      const progress = Math.max(0, Math.min(100, (total - startMinutes) / (threshold - startMinutes) * 100));
      byId('nextTitleText').textContent = `次の称号「${getLevelTitle(next)}」まで ${formatMinutes(Math.max(0, threshold - total))}`;
      byId('titleProgressBar').style.width = progress + '%';
      titleTrack.setAttribute('aria-valuenow', String(Math.floor(progress)));
    } else {
      byId('nextTitleText').textContent = '最高の称号に到達しました';
      byId('titleProgressBar').style.width = '100%'; titleTrack.setAttribute('aria-valuenow', '100');
    }
  }
  function refreshDesign() {
    renderHomeGoals(); renderGrowth(); updateActivityChoices();
  }
  byId('batchDate').value = localDateKey();
  const subjects = [...new Set([...subjectGoals.map(goal => goal.subject), ...records.slice(0, 12).map(record => record.subject), '英語', '数学', '国語'])];
  subjects.slice(0, 5).forEach(addBatchRow);
  byId('batchAddSubject').addEventListener('click', () => addBatchRow().focus());
  batchForm.addEventListener('input', refreshBatchTotal);
  batchActivity.addEventListener('change', () => { byId('batchActivitySummary').textContent = batchActivity.value; });
  batchForm.addEventListener('submit', event => {
    event.preventDefault();
    const values = { date: byId('batchDate').value, words: byId('batchWords').value, activity: batchActivity.value,
      rows: [...batchRows.children].map(row => ({ subject: row.querySelector('[data-batch-subject]').value, minutes: row.querySelector('[data-batch-minutes]').value })) };
    const parsed = parseBatchRecords(values);
    const fail = message => { batchStatus.textContent = message; batchStatus.className = 'form-status error'; };
    if (!parsed.ok) { fail(parsed.message); return; }
    const before = records.reduce((sum, record) => sum + record.minutes, 0);
    const previousBest = Math.max(0, ...Object.values(studyMinutesByDate()));
    const previousToday = records.filter(record => record.date === localDateKey()).reduce((sum, record) => sum + record.minutes, 0);
    // Commit once; the existing transaction also maintains linked schedule data.
    if (!tryCommitRecords([...parsed.records, ...records])) {
      fail('保存できませんでした。入力は残しています。' + recordCommitError); return;
    }
    const added = parsed.records.reduce((sum, record) => sum + record.minutes, 0);
    render();
    batchStatus.className = 'form-status success';
    batchStatus.textContent = `${parsed.records.length}科目・${formatMinutes(added)}を保存しました。`;
    for (const input of batchRows.querySelectorAll('[data-batch-minutes]')) input.value = '';
    byId('batchWords').value = ''; refreshBatchTotal();
    if (calculateLevel(before + added).level > calculateLevel(before).level) showLevelUp(calculateLevel(before + added).level);
    if (values.date === localDateKey() && previousToday + added > previousBest) showBestUpdate(`1日の最高記録 ${formatMinutes(previousToday + added)}`);
  });
  byId('editTodayGoal').addEventListener('click', () => {
    switchTab('record'); byId('goalHours').focus();
  });
  byId('addActivityOption').addEventListener('click', updateActivityChoices);
  document.querySelectorAll('[data-badge-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));
  document.addEventListener('manabi:render', refreshDesign);
  window.addEventListener('focus', renderGrowth);
  refreshDesign();
})();

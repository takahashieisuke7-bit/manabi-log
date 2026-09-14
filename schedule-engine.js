/* Scheduling calculations are independent of the DOM and storage. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ScheduleEngine = factory();
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";
  const DAY = 86400000;
  const defaults = [1, 3, 7, 14];
  const size = t => t.end - t.start + 1;
  const add = (date, days) => new Date(Date.parse(date + "T00:00:00Z") + days * DAY).toISOString().slice(0, 10);
  const quantityUnit = unit => ({単語番号:"語",単語:"語",語:"語",問題番号:"問",問題:"問",問:"問"}[unit] || unit);
  const rangeLabel = t => `${t.start}〜${t.end}${["単語番号","単語","語","問題番号","問題","問"].includes(t.unit) ? "番" : t.unit}（${size(t)}${quantityUnit(t.unit)}）`;
  const offsets = p => p.reviewEnabled === false ? [] : (p.reviewOffsets || defaults);
  const studyDay = (date, plan, holidays) => !holidays.includes(date) && (plan.weekdays || [0,1,2,3,4,5,6]).includes(new Date(date + "T00:00:00Z").getUTCDay());
  function next(date, plan, holidays) {
    for (let i = 0; i < 3660; i++, date = add(date, 1)) if (studyDay(date, plan, holidays)) return date;
    throw new Error("10年以内に学習できる日がありません。曜日と休日を見直してください。");
  }
  function datesBetween(start, end, plan, holidays) {
    if (Date.parse(end) - Date.parse(start) > 3660 * DAY) throw new Error("開始日から10年以内の終了日を指定してください。");
    const dates = [];
    for (let d = start; d <= end; d = add(d, 1)) if (studyDay(d, plan, holidays)) dates.push(d);
    return dates;
  }
  function allocate(plan, holidays, ranges, startDate, makeId, previous = [], reservedTasks = []) {
    const total = ranges.reduce((sum, r) => sum + size(r), 0);
    if (!total) return [];
    const dates = plan.mode === "quantity" ? [] : datesBetween(startDate, plan.endDate, plan, holidays);
    if (plan.mode !== "quantity" && !dates.length) throw new Error(`${plan.material}：終了日までに学習できる日がありません。終了日か曜日を見直してください。`);
    const reserved = new Map();
    for (const task of reservedTasks) reserved.set(task.date,(reserved.get(task.date)||0)+size(task));
    const reservedTotal = dates.reduce((sum,date)=>sum+(reserved.get(date)||0),0);
    const amount = plan.mode === "quantity" ? plan.dailyQuantity : Math.ceil((total + reservedTotal) / dates.length);
    if (!Number.isInteger(amount) || amount < 1) throw new Error("1日の量は1以上の整数で指定してください。");
    if (Math.ceil(total / amount) * (offsets(plan).length + 1) > 20000) throw new Error("予定が2万件を超えます。1日の量を増やすか範囲を分けてください。");
    const result = [];
    let date = add(startDate,-1), dateIndex = -1, left = 0;
    function advance() {
      for (let i=0;i<3660;i++) {
        date = plan.mode === "quantity" ? next(add(date,1),plan,holidays) : dates[++dateIndex];
        if (!date) throw new Error("固定予定を除く残りの日程に割り振れません。終了日を延ばしてください。");
        left = Math.max(0,amount-(reserved.get(date)||0));
        if (left) return;
      }
      throw new Error("日程が10年を超えます。1日の量を見直してください。");
    }
    for (const r of ranges) {
      for (let cursor = r.start; cursor <= r.end;) {
        if (!left) advance();
        const end = Math.min(r.end, cursor + left - 1);
        const old = previous.find(t => t.start === cursor && t.end === end);
        result.push({...old, id:old?.id || makeId(), planId:plan.id, sourceNewId:"", material:plan.material, unit:plan.unit,
          date, start:cursor, end, type:"new", fixed:false, done:false, manual:false,
          originalDate:old?.originalDate || old?.date || date, completedDate:"", createdAt:old?.createdAt || new Date().toISOString()});
        left -= end - cursor + 1;
        cursor = end + 1;
      }
    }
    return result;
  }
  // Legacy reviews did not save their offset. Infer it once, without changing IDs or dates.
  function hydrate(tasks, plans, holidays) {
    const result = tasks.map(t => ({...t, completedDate:t.done ? (t.completedDate || t.date) : ""}));
    for (const source of result.filter(t => t.type === "new")) {
      const plan = plans.find(p => p.id === source.planId);
      if (!plan) continue;
      const linked = result.filter(t => t.sourceNewId === source.id).sort((a,b) => a.date.localeCompare(b.date));
      const remaining = offsets(plan).filter(o => !linked.some(t => t.reviewOffset === o));
      for (const review of linked.filter(t => !t.reviewOffset)) {
        let index = remaining.findIndex(o => next(add(source.date, o), plan, holidays) === review.date);
        if (index < 0) index = 0;
        review.reviewOffset = remaining.splice(index, 1)[0] || Math.max(1, Math.round((Date.parse(review.date) - Date.parse(source.date)) / DAY));
      }
    }
    return result;
  }
  function reviewsFor(source, plan, holidays, makeId, existing = []) {
    const result = [];
    for (const offset of offsets(plan)) {
      const old = existing.find(t => t.reviewOffset === offset);
      if (old?.done || old?.fixed) { result.push({...old}); continue; }
      const due = add(source.completedDate || source.date, offset);
      const requested = old?.requestedDate || due;
      result.push({...old, id:old?.id || makeId(), planId:plan.id, sourceNewId:source.id,
        material:old?.manual ? old.material : source.material, unit:old?.manual ? old.unit : source.unit,
        start:old?.manual ? old.start : source.start, end:old?.manual ? old.end : source.end,
        date:next(requested, plan, holidays), dueDate:due, originalDate:old?.date || due, reviewOffset:offset,
        type:"review", fixed:false, done:false, completedDate:"", manual:old?.manual || false,
        createdAt:old?.createdAt || new Date().toISOString()});
    }
    // Never drop a completed or pinned review when offsets are changed.
    result.push(...existing.filter(t => !result.some(r => r.id === t.id) && (t.done || t.fixed)));
    return result;
  }
  function create(plan, holidays, makeId) {
    const fresh = allocate(plan, holidays, [{start:plan.start,end:plan.end}], plan.startDate, makeId);
    const updated = {...plan, endDate:plan.mode === "quantity" ? fresh.at(-1).date : plan.endDate};
    return {plan:updated, tasks:[...fresh, ...fresh.flatMap(t => reviewsFor(t,updated,holidays,makeId))], unitsPerDay:Math.max(...fresh.map(size))};
  }
  function conflicts(tasks, plans, holidays) {
    return tasks.filter(t => {
      if (!t.fixed || t.done) return false;
      const p = plans.find(p => p.id === t.planId) || {};
      const source = tasks.find(s => s.id === t.sourceNewId);
      return !studyDay(t.date, p, holidays) || (source && t.type === "review" && t.date < add(source.completedDate || source.date, t.reviewOffset || 1));
    });
  }
  function reschedule(tasks, plans, holidays, today, makeId, onlyPlanId = "") {
    let result = hydrate(tasks, plans, holidays);
    const updatedPlans = plans.map(p => ({...p}));
    const warnings = [];
    for (const plan of updatedPlans) {
      if (onlyPlanId && plan.id !== onlyPlanId) continue;
      const group = result.filter(t => t.planId === plan.id);
      // A pinned or completed review retains its source and range.
      const protectedSources = new Set(group.filter(t => t.type === "review" && (t.done || t.fixed)).map(t => t.sourceNewId));
      const movable = group.filter(t => t.type === "new" && !t.done && !t.fixed && !t.manual && !protectedSources.has(t.id)).sort((a,b)=>a.start-b.start);
      result = result.map(t => t.planId === plan.id && t.type === "new" && !t.done && !t.fixed && (t.manual || protectedSources.has(t.id))
        ? {...t,originalDate:t.originalDate||t.date,date:next(t.date<today?today:t.date,plan,holidays)} : t);
      if (movable.length) {
        try {
          const ranges = [];
          for (const t of movable) {
            if (ranges.length && t.start === ranges.at(-1).end + 1) ranges.at(-1).end = t.end;
            else ranges.push({start:t.start,end:t.end});
          }
          const reserved=result.filter(t=>t.planId===plan.id && t.type==="new" && !movable.some(m=>m.id===t.id));
          const fresh = allocate(plan,holidays,ranges,[today,plan.startDate].sort().at(-1),makeId,movable,reserved);
          const ids = new Set(movable.map(t=>t.id));
          result = result.filter(t=>!ids.has(t.id));
          const surviving = new Set(fresh.map(t=>t.id));
          result = result.filter(t=>!ids.has(t.sourceNewId) || surviving.has(t.sourceNewId) || t.done || t.fixed);
          result.push(...fresh);
        } catch (error) { warnings.push(error.message); }
      }
      // Move manual new work only off holidays; never rebalance its edited range.
      result = result.map(t => t.planId === plan.id && t.type === "new" && !t.done && !t.fixed && (t.manual || protectedSources.has(t.id))
        ? {...t, originalDate:t.originalDate || t.date, date:next(t.date < today ? today : t.date,plan,holidays)} : t);
      const newWork = result.filter(t=>t.planId===plan.id && t.type==="new");
      for (const source of newWork) {
        const existing = result.filter(t=>t.sourceNewId===source.id);
        const reviews = reviewsFor(source,plan,holidays,makeId,existing).map(t => {
          if (!t.done && !t.fixed && source.done && t.date < today) return {...t, originalDate:t.date,date:next(today,plan,holidays)};
          return t;
        });
        result = result.filter(t=>t.sourceNewId!==source.id).concat(reviews);
      }
      if (plan.mode === "quantity" && newWork.length) plan.endDate = newWork.map(t=>t.date).sort().at(-1);
    }
    result = result.map(t => {
      if (onlyPlanId || t.done || t.fixed || (t.planId && plans.some(p=>p.id===t.planId))) return t;
      return {...t,originalDate:t.originalDate || t.date,date:next(t.date < today ? today : t.date,{},holidays)};
    });
    const collisions = conflicts(result,plans,holidays);
    if (collisions.length) warnings.push(`固定予定${collisions.length}件が休日・復習基準日と衝突しています。日付は保持しました。詳細から編集できます。`);
    const moved = result.filter(t => {const old=tasks.find(o=>o.id===t.id);return !old || old.date!==t.date || old.start!==t.start || old.end!==t.end;}).length;
    return {tasks:result,plans:updatedPlans,warnings,moved};
  }
  function complete(tasks, plans, holidays, id, date, makeId) {
    let result = hydrate(tasks,plans,holidays);
    const target = result.find(t=>t.id===id);
    if (!target) throw new Error("予定が見つかりません。");
    const source = result.find(t=>t.id===target.sourceNewId);
    if (date && source && (!source.done || date < source.completedDate)) throw new Error("先に新規学習を完了してください。復習完了日は学習完了日以降にします。");
    if (!date && result.some(t=>t.sourceNewId===id && t.done)) throw new Error("完了済みの復習があります。先に復習の完了を取り消してください。");
    target.done = Boolean(date); target.completedDate = date || "";
    const plan = plans.find(p=>p.id===target.planId);
    if (target.type === "new" && plan) {
      const existing = result.filter(t=>t.sourceNewId===id).map(t=>({...t,requestedDate:""}));
      result = result.filter(t=>t.sourceNewId!==id).concat(reviewsFor(target,plan,holidays,makeId,existing));
    }
    return result;
  }
  function totals(tasks) {
    const output = {new:{}, review:{}};
    for (const t of tasks) {const unit=quantityUnit(t.unit);output[t.type][unit]=(output[t.type][unit]||0)+size(t);}
    return output;
  }
  return {add,next,studyDay,create,reschedule,complete,hydrate,reviewsFor,conflicts,totals,quantityUnit,rangeLabel,size};
});

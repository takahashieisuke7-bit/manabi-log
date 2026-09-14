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
      // Keep the user's target date; the actual completion date is derived from tasks.
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
  const overlaps = (a,b) => a.start<=b.end && b.start<=a.end;
  const changedTask = (a,b) => !a || !b || ["date","start","end","fixed","type","material","unit","done","completedDate"].some(k=>a[k]!==b[k]);
  function difference(before,after) {
    const old=new Map(before.map(t=>[t.id,t])), fresh=new Map(after.map(t=>[t.id,t]));
    return [...new Set([...old.keys(),...fresh.keys()])].flatMap(id=>changedTask(old.get(id),fresh.get(id))?[{before:old.get(id)||null,after:fresh.get(id)||null}]:[]);
  }
  function syncSource(tasks,source,plan,holidays,makeId) {
    const linked=tasks.filter(t=>t.sourceNewId===source.id).map(t=>t.done||t.fixed?t:{...t,manual:false,requestedDate:""});
    return tasks.filter(t=>t.sourceNewId!==source.id).concat(reviewsFor(source,plan,holidays,makeId,linked));
  }
  function validateRange(task) {
    if(!Number.isInteger(task.start)||!Number.isInteger(task.end)||task.start<1||task.end<task.start||task.end>99999)throw new Error("範囲は1〜99999の整数で、終了を開始以上にしてください。");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(task.date)||!Number.isFinite(Date.parse(task.date)))throw new Error("実施日を入力してください。");
  }
  function resultForEdit(before,tasks,plans,holidays,notes=[]) {
    const collisions=conflicts(tasks,plans,holidays);
    if(collisions.length) notes.push(`固定を維持するため、休日・復習基準日との衝突が${collisions.length}件残ります：${collisions.map(t=>`${t.date} ${t.material} ${rangeLabel(t)}`).join("、")}`);
    return {tasks,plans,holidays:[...holidays],changes:difference(before,tasks),notes};
  }
  function editTask(tasks,plans,holidays,id,changes,options,makeId) {
    let result=hydrate(tasks,plans,holidays);
    const original=result.find(t=>t.id===id);
    if(!original||original.done)throw new Error("完了済みの実績は変更できません。");
    const plan=plans.find(p=>p.id===original.planId), updatedPlans=plans.map(p=>({...p}));
    const target={...original,date:changes.date,start:Number(changes.start),end:Number(changes.end),fixed:Boolean(changes.fixed)};
    if(!plan){target.material=String(changes.material??original.material).trim().slice(0,40);target.unit=String(changes.unit??original.unit).trim().slice(0,12);if(!target.material||!target.unit)throw new Error("教材名と単位を入力してください。");}
    validateRange(target);
    const rangeChanged=target.start!==original.start||target.end!==original.end;
    let dayChanged=target.date!==original.date;
    const notes=[];
    // Pin-only edits do not move dates, ranges or dependent work.
    if(!rangeChanged&&!dayChanged) return resultForEdit(tasks,result.map(t=>t.id===id?target:t),updatedPlans,holidays);
    target.manual=true; target.originalDate=original.date;
    if(!studyDay(target.date,plan||{},holidays)) {
      if(options.holiday==="keep")notes.push(`${target.date}は休日・学習曜日外ですが、この予定は指定日を維持します。`);
      else {target.date=next(target.date,plan||{},holidays);notes.push(`休日・学習曜日外のため、実施日を${changes.date}から${target.date}へ移します。`);}
      dayChanged=target.date!==original.date;
    }
    const fixedOnDate=date=>result.filter(t=>t.id!==id&&t.sourceNewId!==id&&t.fixed&&!t.done&&t.date===date);
    if(fixedOnDate(target.date).length) {
      if(options.fixedDate==="next") {
        const beforeDate=target.date;
        for(let i=0;fixedOnDate(target.date).length;i++) {
          if(i>3660)throw new Error("固定予定を避けられる日が見つかりません。指定日での併存を選ぶか、日付を見直してください。");
          target.date=next(add(target.date,1),plan||{},holidays);
        }
        dayChanged=target.date!==original.date;
        notes.push(`同日の固定予定を保護して、${beforeDate}から${target.date}へ移します。`);
      } else notes.push(`${target.date}の固定予定は変更せず、この予定を同じ日に追加します。日別の合計量を確認してください。`);
    }
    if(target.type==="review") {
      const source=result.find(t=>t.id===target.sourceNewId);
      if(source && (target.start<source.start||target.end>source.end))throw new Error("復習範囲は、対応する新規学習の範囲内で指定してください。");
      if(source && target.date<(source.completedDate||source.date))throw new Error("復習日は、対応する新規学習の日以降にしてください。");
      target.requestedDate=target.date;
      return resultForEdit(tasks,result.map(t=>t.id===id?target:t),updatedPlans,holidays,notes);
    }
    if(!plan) {
      if(rangeChanged) {
        if(result.some(t=>t.id!==id&&t.type==="new"&&t.material===target.material&&t.unit===target.unit&&overlaps(t,target)))throw new Error("同じ教材の予定と範囲が重なります。範囲を見直してください。");
        const rest=[];
        if(target.start>original.start)rest.push([original.start,Math.min(original.end,target.start-1)]);
        if(target.end<original.end)rest.push([Math.max(original.start,target.end+1),original.end]);
        for(const [start,end] of rest)result.push({...original,id:makeId(),date:next(add(target.date,1),{},holidays),start,end,fixed:false,manual:true,originalDate:original.date});
        if(rest.length)notes.push("手動予定の残りの範囲を、翌学習日の新しい手動予定として残します。");
      }
      return resultForEdit(tasks,result.map(t=>t.id===id?target:t),updatedPlans,holidays,notes);
    }
    if(target.start<plan.start||target.end>plan.end)throw new Error(`教材全体の範囲（${plan.start}〜${plan.end}）内で指定してください。`);
    const linked=result.filter(t=>t.sourceNewId===id);
    if(rangeChanged&&linked.some(t=>t.done))throw new Error("完了済みの復習があるため、この新規学習の範囲は変更できません。日付のみの変更は可能です。");
    if(rangeChanged&&linked.some(t=>t.fixed)) {
      if(options.fixed!=="release")throw new Error("この範囲には固定された復習があります。「衝突する未完了の固定を解除して調整」を選ぶか、範囲を戻してください。");
      result=result.map(t=>t.sourceNewId===id&&!t.done?{...t,fixed:false}:t);
      notes.push("範囲に紐づく未完了の固定復習を解除して調整します。");
    }
    if(rangeChanged) {
      const others=result.filter(t=>t.planId===plan.id&&t.type==="new"&&t.id!==id);
      for(const t of others.filter(t=>overlaps(t,target))) {
        if(t.done||result.some(r=>r.sourceNewId===t.id&&r.done))throw new Error("完了済みの学習・復習範囲と重なるため変更できません。入力範囲を見直してください。");
        if(t.start<original.start)throw new Error("前の予定と重なっています。先に前の予定を編集してください。");
        if(t.fixed||result.some(r=>r.sourceNewId===t.id&&r.fixed)) {
          if(options.fixed!=="release")throw new Error("後続の固定予定と範囲が重なります。固定を維持して範囲を戻すか、衝突する未完了の固定を解除してください。");
          result=result.map(r=>(r.id===t.id||r.sourceNewId===t.id)&&!r.done?{...r,fixed:false}:r);
          notes.push(`${t.date} ${rangeLabel(t)}に関する未完了の固定を解除します。`);
        }
      }
      const protectedSources=new Set(result.filter(t=>t.done||t.fixed).map(t=>t.sourceNewId));
      const movable=result.filter(t=>t.planId===plan.id&&t.type==="new"&&t.id!==id&&t.start>=original.start&&!t.done&&!t.fixed&&!protectedSources.has(t.id));
      const ids=new Set(movable.map(t=>t.id));
      const retained=result.filter(t=>t.planId===plan.id&&t.type==="new"&&t.id!==id&&!ids.has(t.id));
      const reserved=[...retained,target];
      const remaining=[];let begin=null;
      for(let n=Math.min(original.start,target.start);n<=plan.end;n++) {
        const free=!reserved.some(t=>t.start<=n&&n<=t.end);
        if(free&&begin===null)begin=n;
        if(begin!==null&&(!free||n===plan.end)){remaining.push({start:begin,end:free?n:n-1});begin=null;}
      }
      let allocationPlan=plan;
      if(options.extend)allocationPlan={...plan,mode:"quantity",dailyQuantity:plan.mode==="quantity"?plan.dailyQuantity:Math.max(1,size(original))};
      const fresh=allocate(allocationPlan,holidays,remaining,add(target.date,1),makeId,movable,reserved);
      result=result.filter(t=>!ids.has(t.id)&&!ids.has(t.sourceNewId));
      result.push(...fresh);
      // Reuse review identity where the new source range stayed the same.
      for(const t of fresh) {
        const oldReviews=tasks.filter(r=>r.sourceNewId===t.id);
        result.push(...oldReviews);
        result=syncSource(result,t,plan,holidays,makeId);
      }
      if(options.extend&&fresh.length) {
        const editedPlan=updatedPlans.find(p=>p.id===plan.id);
        editedPlan.endDate=[editedPlan.endDate,...fresh.map(t=>t.date),target.date].sort().at(-1);
        if(editedPlan.endDate!==plan.endDate)notes.push(`残りの範囲を保つため、新規終了目標日を${plan.endDate}から${editedPlan.endDate}へ延ばします。`);
      }
      notes.push("変更した範囲の残りと後続の未完了範囲を、翌学習日以降へ重複なく再配分します。");
    }
    result=result.map(t=>t.id===id?target:t);
    if(options.fixed==="release"&&dayChanged) {
      result=result.map(t=>t.sourceNewId===id&&t.fixed&&!t.done?{...t,fixed:false}:t);
    }
    result=syncSource(result,target,plan,holidays,makeId);
    if(target.date>plan.endDate)notes.push(`変更した新規学習日は終了目標日（${plan.endDate}）を過ぎています。`);
    return resultForEdit(tasks,result,updatedPlans,holidays,notes);
  }
  function editPlan(tasks,plans,holidays,id,changes,options,makeId,today) {
    const original=plans.find(p=>p.id===id);if(!original)throw new Error("教材が見つかりません。");
    const plan={...original,...changes};
    if(!plan.weekdays.length)throw new Error("勉強する曜日を1つ以上選んでください。");
    if(!Number.isInteger(plan.dailyQuantity)||plan.dailyQuantity<1||plan.dailyQuantity>99999)throw new Error("1日の量は1〜99999で指定してください。");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(plan.endDate)||plan.endDate<plan.startDate)throw new Error("終了目標日は開始日以降にしてください。");
    const updatedPlans=plans.map(p=>p.id===id?plan:{...p});
    let result=hydrate(tasks,plans,holidays);const notes=[];
    if(options.fixed==="release") {
      const conflicting=new Set(conflicts(result,updatedPlans,holidays).filter(t=>t.planId===id).map(t=>t.id));
      result=result.map(t=>conflicting.has(t.id)&&!t.done?{...t,fixed:false}:t);
      if(conflicting.size)notes.push(`休日・曜日と衝突する未完了の固定${conflicting.size}件を解除して調整します。`);
    }
    const protectedSources=new Set(result.filter(t=>t.done||t.fixed).map(t=>t.sourceNewId));
    const movable=result.filter(t=>t.planId===id&&t.type==="new"&&!t.done&&!t.fixed&&!protectedSources.has(t.id));
    const ids=new Set(movable.map(t=>t.id));
    const reserved=result.filter(t=>t.planId===id&&t.type==="new"&&!ids.has(t.id));
    const ranges=[];let begin=null;
    for(let n=plan.start;n<=plan.end;n++) {
      const free=!reserved.some(t=>t.start<=n&&n<=t.end);
      if(free&&begin===null)begin=n;
      if(begin!==null&&(!free||n===plan.end)){ranges.push({start:begin,end:free?n:n-1});begin=null;}
    }
    const fresh=allocate(plan,holidays,ranges,[today,plan.startDate].sort().at(-1),makeId,movable,reserved);
    result=result.filter(t=>!ids.has(t.id)&&!ids.has(t.sourceNewId)).concat(fresh);
    for(const source of result.filter(t=>t.planId===id&&t.type==="new")) {
      if(ids.has(source.id))result.push(...tasks.filter(r=>r.sourceNewId===source.id));
      result=syncSource(result,source,plan,holidays,makeId);
    }
    if(plan.mode==="quantity"&&fresh.length) {
      const calculated=result.filter(t=>t.planId===id&&t.type==="new").map(t=>t.date).sort().at(-1);
      notes.push(`1日の量を優先：新規終了予定 ${calculated}（終了目標 ${plan.endDate}）。${calculated>plan.endDate?"終了目標を超えます。期限を優先する場合は配分の基準を変更してください。":""}`);
    }
    return resultForEdit(tasks,result,updatedPlans,holidays,notes);
  }
  return {add,next,studyDay,create,reschedule,complete,hydrate,reviewsFor,conflicts,totals,quantityUnit,rangeLabel,size,editTask,editPlan,difference};
});

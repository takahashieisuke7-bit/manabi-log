"use strict";
let scheduleSelectedDate = new Date().toLocaleDateString("sv-SE");
let scheduleMonth = scheduleSelectedDate.slice(0,7);
let scheduleView = "week";
let completionTaskId = "", editingPlanId = "";
const scheduleElement = id => document.getElementById(id);
function scheduleState() {return {tasks:structuredClone(materialTasks),plans:structuredClone(materialPlans),holidays:[...holidays]};}
function sanitizeScheduleSnapshot(value) {
  if(!value || typeof value!=="object")return null;
  return {beforeTasks:sanitizeMaterialTasks(value.beforeTasks),afterTasks:sanitizeMaterialTasks(value.afterTasks),
    ...(Array.isArray(value.beforePlans)?{beforePlans:sanitizeMaterialPlans(value.beforePlans),afterPlans:sanitizeMaterialPlans(value.afterPlans)}:{}),
    ...(Array.isArray(value.beforeHolidays)?{beforeHolidays:sanitizeHolidays(value.beforeHolidays),afterHolidays:sanitizeHolidays(value.afterHolidays)}:{}),
    operation:value.operation==="edit"?"edit":"reschedule",
    summary:typeof value.summary==="string"?value.summary.slice(0,2000):"",createdAt:value.createdAt||new Date().toISOString()};
}
function parseOffsets(text) {
  const values=text.trim().split(/[,、\s]+/).map(Number);
  if(!values.length||values.length>12||values.some(n=>!Number.isInteger(n)||n<1||n>365))throw new Error("復習間隔は1〜365の日数を、カンマで区切って12回まで指定してください。");
  return [...new Set(values)].sort((a,b)=>a-b);
}
function readMaterialDraft() {
  try {
    const range=sanitizeRangeStartEnd(materialRangeStartInput.value,materialRangeEndInput.value);
    const weekdays=[...document.querySelectorAll("input[name='materialWeekday']:checked")].map(el=>Number(el.value));
    const mode=scheduleElement("materialMode").value,quantity=Number(scheduleElement("materialDailyQuantity").value);
    const enabled=scheduleElement("materialReviewEnabled").checked;
    if(!materialNameInput.value.trim()||!range||!isDateKey(materialStartDateInput.value)||!weekdays.length)throw new Error("教材名・範囲・開始日・学習する曜日を入力してください。");
    if(mode==="deadline"&&(!isDateKey(materialEndDateInput.value)||materialEndDateInput.value<materialStartDateInput.value))throw new Error("終えたい日は開始日以降にしてください。");
    if(mode==="quantity"&&(!Number.isInteger(quantity)||quantity<1||quantity>99999))throw new Error("1日の量は1〜99999の整数で指定してください。");
    return {ok:true,plan:{id:createId(),subject:scheduleElement("materialSubject").value.trim(),material:materialNameInput.value.trim(),unit:materialUnitInput.value,...range,startDate:materialStartDateInput.value,
      endDate:mode==="deadline"?materialEndDateInput.value:materialStartDateInput.value,weekdays,mode,dailyQuantity:quantity,
      reviewEnabled:enabled,reviewOffsets:enabled?parseOffsets(scheduleElement("materialReviewOffsets").value):[1,3,7,14],createdAt:new Date().toISOString()}};
  }catch(error){return {ok:false,message:error.message};}
}
function formatScheduleTotals(tasks) {
  const totals=ScheduleEngine.totals(tasks);
  return ["new","review"].map(type=>`${taskTypeLabel(type)} ${Object.entries(totals[type]).map(([u,n])=>`${n}${u}`).join("・")||"なし"}`).join(" ／ ");
}
function updateMaterialDraft() {
  const quantity=scheduleElement("materialMode").value==="quantity";
  scheduleElement("materialDeadlineField").hidden=quantity;materialEndDateInput.disabled=quantity;
  scheduleElement("materialQuantityField").hidden=!quantity;scheduleElement("materialDailyQuantity").disabled=!quantity;
  scheduleElement("materialQuantityUnit").textContent=ScheduleEngine.quantityUnit(materialUnitInput.value)+" / 日";
  scheduleElement("materialReviewOffsets").disabled=!scheduleElement("materialReviewEnabled").checked;
  const parsed=readMaterialDraft(),preview=scheduleElement("materialDraftPreview");
  if(!parsed.ok){preview.textContent="入力すると、新規学習の終了日・最終復習日・負担の目安が表示されます。";return;}
  try {
    let index=0;const result=ScheduleEngine.create(parsed.plan,holidays,()=>`preview-${index++}`);
    const newEnd=result.tasks.filter(t=>t.type==="new").map(t=>t.date).sort().at(-1);
    const reviewEnd=result.tasks.filter(t=>t.type==="review").map(t=>t.date).sort().at(-1);
    const totals=new Map();for(const t of result.tasks)totals.set(t.date,(totals.get(t.date)||0)+rangeSize(t));
    const peak=Math.max(...totals.values());
    preview.textContent=`新規終了 ${newEnd} ／ 最終復習 ${reviewEnd||"なし"}。新規 ${result.unitsPerDay}${ScheduleEngine.quantityUnit(parsed.plan.unit)}/日、復習込みの最大 ${peak}${ScheduleEngine.quantityUnit(parsed.plan.unit)}/日（この教材）。${peak>scheduleSettings.maxTotalUnitsPerDay?" 負担基準を超える日があります。量や終了日を見直せます。":""}`;
  }catch(error){preview.textContent=error.message;}
}
function scheduleCalendarDates(selected,month,view) {
  const date=new Date((view==='week'?selected:month+'-01')+'T12:00:00');
  const count=view==='week'?7:new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
  if(view==='week')date.setDate(date.getDate()-date.getDay());
  return Array.from({length:count},(_,i)=>{const day=new Date(date);day.setDate(day.getDate()+i);return day.toLocaleDateString('sv-SE');});
}
function renderScheduleCalendar() {
  const selected=scheduleMaterialFilter.value||"all";
  const tasks=materialTasks.filter(t=>selected==="all"||t.material===selected);
  const plans=materialPlans.filter(p=>selected==="all"||p.material===selected);
  const grid=scheduleElement("scheduleMonthGrid");grid.replaceChildren();
  const date=new Date(`${scheduleMonth}-01T12:00:00`);
  grid.classList.toggle("is-week",scheduleView==="week");
  grid.setAttribute("aria-label",scheduleView==="week"?"学習予定の週カレンダー":"学習予定の月カレンダー");
  document.querySelectorAll("[data-schedule-view]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.scheduleView===scheduleView)));
  scheduleElement("schedulePrevMonth").setAttribute("aria-label",scheduleView==="week"?"予定の前の週":"予定の前の月");
  scheduleElement("scheduleNextMonth").setAttribute("aria-label",scheduleView==="week"?"予定の次の週":"予定の次の月");
  scheduleElement("scheduleMonthTitle").textContent=`${date.getFullYear()}年 ${date.getMonth()+1}月`;
  for(const day of ["日","月","火","水","木","金","土"]){const el=document.createElement("span");el.className="schedule-weekday";el.textContent=day;grid.append(el);}
  const keys=scheduleCalendarDates(scheduleSelectedDate,scheduleMonth,scheduleView);
  if(scheduleView==='month')for(let i=0;i<date.getDay();i++){const el=document.createElement('span');el.className='schedule-blank';grid.append(el);}
  else scheduleElement('scheduleMonthTitle').textContent=`${keys[0].slice(5).replace('-','/')} 〜 ${keys.at(-1).slice(5).replace('-','/')}`;
  const byDate=new Map();for(const t of tasks){if(!byDate.has(t.date))byDate.set(t.date,[]);byDate.get(t.date).push(t);}
  for(const key of keys) {
    const day=Number(key.slice(8)),daily=byDate.get(key)||[];
    const holiday=holidays.includes(key),off=holiday||(plans.length>0&&plans.every(p=>!ScheduleEngine.studyDay(key,p,holidays)));
    const button=document.createElement("button");button.type="button";button.className=`schedule-date${off?" is-holiday":""}${key===localDateKey()?" is-today":""}`;
    button.setAttribute("aria-pressed",String(key===scheduleSelectedDate));
    button.setAttribute("aria-label",`${key}${off?" 休み":""} ${daily.length}件 完了${daily.filter(t=>t.done).length}件 ${formatScheduleTotals(daily)} ${daily.slice(0,2).map(t=>t.material).join("・")}`);
    const number=document.createElement("span");number.className="date-number";number.textContent=day;button.append(number);
    if(off){const mark=document.createElement("span");mark.className="date-off";mark.textContent="休";button.append(mark);}
    if(daily.length){const count=document.createElement('span');count.className='date-count';count.textContent=daily.every(t=>t.done)?'✓':`${daily.length}件`;button.append(count);}
    button.addEventListener("click",()=>{scheduleSelectedDate=key;scheduleMonth=key.slice(0,7);renderSchedule();});grid.append(button);
  }
  const selectedTasks=byDate.get(scheduleSelectedDate)||[];
  scheduleElement("scheduleDayTitle").textContent=`${scheduleSelectedDate.replaceAll("-","/")}（${"日月火水木金土"[new Date(scheduleSelectedDate+"T12:00:00").getDay()]}）${scheduleSelectedDate===localDateKey()?" 今日":""}の予定`;
  scheduleElement("scheduleSelectedLabel").textContent="選択中："+scheduleSelectedDate.replaceAll("-","/")+(scheduleSelectedDate===localDateKey()?" 今日":"");
  scheduleElement("scheduleDayHoliday").textContent=holidays.includes(scheduleSelectedDate)?"休日を解除":"休日にする";
  const totalBox=scheduleElement("scheduleDayTotals");totalBox.replaceChildren();
  const totals=ScheduleEngine.totals(selectedTasks);
  for(const type of ["new","review"]){const block=document.createElement("div"),heading=document.createElement("span"),value=document.createElement("strong");heading.textContent=taskTypeLabel(type);value.textContent=Object.entries(totals[type]).map(([u,n])=>`${n}${u}`).join("・")||"予定なし";block.append(heading,value);totalBox.append(block);}
  const load=Object.keys({...totals.new,...totals.review}).filter(u=>(totals.new[u]||0)+(totals.review[u]||0)>scheduleSettings.maxTotalUnitsPerDay||(totals.new[u]||0)>scheduleSettings.maxNewUnitsPerDay);
  if(load.length){const note=document.createElement("p");note.className="schedule-load-warning";note.textContent=`負担基準を超えています：${load.join("・")}。日付や範囲を編集して調整できます。`;totalBox.append(note);}
  const overdue=tasks.filter(t=>!t.done&&t.date<localDateKey()),collisions=ScheduleEngine.conflicts(tasks,materialPlans,holidays);
  const attention=scheduleElement("scheduleAttention");attention.replaceChildren();attention.hidden=!overdue.length&&!collisions.length;
  if(overdue.length){const p=document.createElement("p");p.textContent=`期限を過ぎた未完了 ${overdue.length}件（復習 ${overdue.filter(t=>t.type==="review").length}件）。予定は残っています。日付を選んで編集するか、未完了を再調整できます。`;attention.append(p);const show=document.createElement("button");show.type="button";show.className="secondary-button";show.textContent="最も古い未完了の日へ";show.addEventListener("click",()=>{scheduleSelectedDate=overdue.map(t=>t.date).sort()[0];scheduleMonth=scheduleSelectedDate.slice(0,7);renderSchedule();});attention.append(show);}
  if(collisions.length){const p=document.createElement("p");p.textContent=`固定予定の衝突 ${collisions.length}件。日付は保持しています。`;attention.append(p);for(const task of collisions){const button=document.createElement("button");button.type="button";button.className="secondary-button";button.textContent=`${task.date} ${task.material} ${taskTypeLabel(task.type)}を確認`;button.addEventListener("click",()=>openScheduleEditDialog(task));attention.append(button);}}
}
function openMaterialSettings(plan) { initializePlanEdit(plan); }
document.addEventListener("DOMContentLoaded",()=>{
  materialPlanForm.addEventListener("input",updateMaterialDraft);materialPlanForm.addEventListener("change",updateMaterialDraft);
  scheduleElement("materialReviewOffsets").value=scheduleSettings.reviewOffsets.join(",");updateMaterialDraft();
  document.querySelectorAll('[data-schedule-view]').forEach(button=>button.addEventListener('click',()=>{scheduleView=button.dataset.scheduleView;renderSchedule();}));
  for(const [id,delta] of [['schedulePrevMonth',-1],['scheduleNextMonth',1]])scheduleElement(id).addEventListener('click',()=>{
    const d=new Date((scheduleView==='week'?scheduleSelectedDate:scheduleMonth+'-01')+'T12:00:00');
    if(scheduleView==='week')d.setDate(d.getDate()+7*delta);else d.setMonth(d.getMonth()+delta);
    scheduleSelectedDate=d.toLocaleDateString('sv-SE');scheduleMonth=scheduleSelectedDate.slice(0,7);renderSchedule();
  });
  scheduleElement('scheduleGoToday').addEventListener('click',()=>{scheduleMaterialFilter.value='all';scheduleSelectedDate=localDateKey();scheduleMonth=scheduleSelectedDate.slice(0,7);renderSchedule();});
  scheduleElement("scheduleDayHoliday").addEventListener("click",()=>{const before=scheduleState();holidays=holidays.includes(scheduleSelectedDate)?holidays.filter(d=>d!==scheduleSelectedDate):[...holidays,scheduleSelectedDate];setScheduleStatus(redistributeAllPlans(localDateKey(),before),"success");render();});
  scheduleElement("scheduleCompletionClose").addEventListener("click",()=>scheduleElement("scheduleCompletionDialog").close());
  scheduleElement("materialSettingsClose").addEventListener("click",()=>scheduleElement("materialSettingsDialog").close());
  scheduleElement("materialSettingsForm").addEventListener("submit",event=>{event.preventDefault();previewPlanEdit();});
});

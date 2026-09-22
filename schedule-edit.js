"use strict";
let pendingScheduleEdit = null;
const scheduleFingerprint = state => JSON.stringify([state.tasks,state.plans,state.holidays]);

function initializeTaskEdit(task) {
  scheduleEditDialog.classList.toggle("is-linked",Boolean(task.planId));
  scheduleElement("editScheduleContext").textContent=`${task.material}｜${taskTypeLabel(task.type)}`;
  scheduleElement("editConflictDetails").open=false;
  scheduleElement("editHolidayChoice").value="next";
  scheduleElement("editFixedChoice").value="keep";
  scheduleElement("editFixedDateChoice").value="keep";
  scheduleElement("editExtendDeadline").checked=false;
  scheduleElement("editExtendDeadline").disabled=task.type!=="new"||!task.planId;
  updateTaskEditHint();
}
function updateTaskEditHint() {
  const task=materialTasks.find(t=>t.id===editScheduleIdInput.value);if(!task)return;
  const start=Number(editScheduleStartInput.value),end=Number(editScheduleEndInput.value);
  scheduleElement("editScheduleQuantity").textContent=`${taskTypeLabel(task.type)}｜予定量 ${Number.isInteger(start)&&Number.isInteger(end)&&end>=start?end-start+1:"—"}${ScheduleEngine.quantityUnit(task.unit)}（範囲から自動計算）`;
  const linked=task.type==="new"&&(start!==task.start||end!==task.end||editScheduleDateInput.value!==task.date);
  scheduleElement("editScheduleImpact").textContent=linked?"後続の予定・復習にも影響する変更です。次の画面で再配分と移動を確認します。":"この予定だけの変更です。次の画面で内容を確認します。";
}
function initializePlanEdit(plan) {
  editingPlanId=plan.id;scheduleElement("materialSettingsTitle").textContent=`${plan.material}の計画を編集`;
  scheduleElement("planSubject").value=plan.subject||"";
  scheduleElement("planMode").value=plan.mode;
  scheduleElement("planEndDate").value=plan.endDate;
  scheduleElement("planDailyQuantity").value=plan.mode==="quantity"?plan.dailyQuantity:Math.max(1,...tasksForPlan(plan.id).filter(t=>t.type==="new"&&!t.done).map(rangeSize));
  scheduleElement("planReviewEnabled").checked=plan.reviewEnabled!==false;
  scheduleElement("planReviewOffsets").value=plan.reviewOffsets.join(",");
  scheduleElement("planFixedChoice").value="keep";
  document.querySelectorAll("input[name='planWeekday']").forEach(el=>el.checked=plan.weekdays.includes(Number(el.value)));
  scheduleElement("materialSettingsStatus").textContent="";updatePlanModeHint();
  scheduleElement("materialSettingsDialog").showModal();
}
function updatePlanModeHint() {
  const quantity=scheduleElement("planMode").value==="quantity";
  scheduleElement("planModeHelp").textContent=quantity?"1日の量で割り振り、終了予定日と目標日を比較します。目標を超える場合は確認画面でお知らせします。":"終了目標日までの学習日数から1日の量を自動計算します。入力した量で進める場合は「1日の量を優先する」を選んでください。";
  scheduleElement("planReviewOffsets").disabled=!scheduleElement("planReviewEnabled").checked;
}
function previewTaskEdit() {
  try {
    const before=scheduleState();
    const result=ScheduleEngine.editTask(before.tasks,before.plans,before.holidays,editScheduleIdInput.value,
      {date:editScheduleDateInput.value,start:Number(editScheduleStartInput.value),end:Number(editScheduleEndInput.value),fixed:editScheduleFixedInput.checked,material:editScheduleMaterialInput.value,unit:editScheduleUnitInput.value},
      {holiday:scheduleElement("editHolidayChoice").value,fixed:scheduleElement("editFixedChoice").value,fixedDate:scheduleElement("editFixedDateChoice").value,extend:scheduleElement("editExtendDeadline").checked},createId);
    showSchedulePreview(before,result,"scheduleEditDialog",editScheduleIdInput.value);
  }catch(error){setScheduleEditStatus(error.message,"error");if(/固定|期限|終了日/.test(error.message))scheduleElement("editConflictDetails").open=true;}
}
function previewPlanEdit() {
  try {
    const before=scheduleState(),enabled=scheduleElement("planReviewEnabled").checked;
    const old=planById(editingPlanId);
    const changes={subject:scheduleElement("planSubject").value.trim(),mode:scheduleElement("planMode").value,dailyQuantity:Number(scheduleElement("planDailyQuantity").value),endDate:scheduleElement("planEndDate").value,
      weekdays:[...document.querySelectorAll("input[name='planWeekday']:checked")].map(el=>Number(el.value)),reviewEnabled:enabled,
      reviewOffsets:enabled?parseOffsets(scheduleElement("planReviewOffsets").value):old.reviewOffsets};
    const result=ScheduleEngine.editPlan(before.tasks,before.plans,before.holidays,editingPlanId,changes,{fixed:scheduleElement("planFixedChoice").value},createId,localDateKey());
    showSchedulePreview(before,result,"materialSettingsDialog","",editingPlanId);
  }catch(error){scheduleElement("materialSettingsStatus").textContent=error.message;}
}
function describeEditTask(task) {
  if(!task)return "なし";
  return `${task.date}｜${task.material}｜${taskTypeLabel(task.type)} ${formatTaskRange(task)}｜${task.fixed?"固定":"固定なし"}${task.done?"・完了済み":""}`;
}
function describePlanSettings(plan) {
  return `科目 ${plan.subject||"未設定"}／${plan.mode==="quantity"?`1日${plan.dailyQuantity}${ScheduleEngine.quantityUnit(plan.unit)}を優先`:"終了目標日を優先"}／終了目標 ${plan.endDate}／曜日 ${plan.weekdays.map(d=>"日月火水木金土"[d]).join("・")}／${plan.reviewEnabled?`復習 ${plan.reviewOffsets.join("・")}日後`:"復習なし"}`;
}
function showSchedulePreview(before,result,editorId,taskId,planId="") {
  pendingScheduleEdit={before,result,editorId,taskId,planId};
  const indirect=Boolean(planId)||result.changes.some(c=>(c.after||c.before).id!==taskId);
  scheduleElement("scheduleChangeScope").textContent=indirect?"後続の予定・復習にも影響する変更です。まだ保存していません。":"この予定だけの変更です。まだ保存していません。";
  const settings=scheduleElement("scheduleChangeSettings");settings.replaceChildren();
  if(planId) {
    const old=before.plans.find(p=>p.id===planId),fresh=result.plans.find(p=>p.id===planId);
    const heading=document.createElement("h3");heading.textContent=old.material;
    const oldText=document.createElement("p"),newText=document.createElement("p");oldText.textContent="変更前："+describePlanSettings(old);newText.textContent="変更後："+describePlanSettings(fresh);settings.append(heading,oldText,newText);
  }
  const notes=scheduleElement("scheduleChangeNotes");notes.replaceChildren();
  for(const note of result.notes){const p=document.createElement("p");p.textContent=note;notes.append(p);}
  const affected=new Set(result.changes.map(c=>(c.after||c.before).planId).filter(Boolean));
  for(const id of affected){const plan=result.plans.find(p=>p.id===id);if(!plan)continue;
    const tasks=result.tasks.filter(t=>t.planId===id),newEnd=tasks.filter(t=>t.type==="new").map(t=>t.completedDate||t.date).sort().at(-1),reviewEnd=tasks.filter(t=>t.type==="review").map(t=>t.completedDate||t.date).sort().at(-1);
    const p=document.createElement("p");p.textContent=`${plan.material}：新規終了 ${newEnd||"なし"} ／ 最終復習 ${reviewEnd||"なし"}。終了目標 ${plan.endDate}${newEnd>plan.endDate?" を超えます。量または終了目標日の見直しもできます。":"。"}`;notes.append(p);
  }
  scheduleElement("scheduleChangeCounts").textContent=`変更 ${result.changes.filter(c=>c.before&&c.after).length}件・追加 ${result.changes.filter(c=>!c.before).length}件・再配分などで置き換え ${result.changes.filter(c=>!c.after).length}件。固定解除も以下に表示します。`;
  const list=scheduleElement("scheduleChangeList");list.replaceChildren();
  for(const change of result.changes){const row=document.createElement("div");row.className="schedule-change-row";
    const old=document.createElement("p"),fresh=document.createElement("p");old.textContent="変更前："+describeEditTask(change.before);fresh.textContent="変更後："+describeEditTask(change.after);row.append(old,fresh);list.append(row);}
  if(!result.changes.length){const p=document.createElement("p");p.textContent="予定の日付・範囲・固定状態の変更はありません。教材設定の変更がある場合は、その設定のみ保存します。";list.append(p);}
  scheduleElement("scheduleChangeStatus").textContent="";
  scheduleElement(editorId).close();scheduleElement("scheduleChangeDialog").showModal();
}
function persistScheduleEditState(tasks,plans,days,snapshot) {
  const updates=[[MATERIAL_TASKS_KEY,tasks],[MATERIAL_PLANS_KEY,plans],[HOLIDAYS_KEY,days],[LAST_RESCHEDULE_KEY,snapshot]];
  const previous=[];
  try {
    for(const [key] of updates)previous.push([key,localStorage.getItem(key)]);
    for(const [key,value] of updates)localStorage.setItem(key,JSON.stringify(value));
  }catch(error) {
    let restored=true;
    for(const [key,value] of previous)try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{restored=false;}
    throw new Error(restored?"保存できませんでした。変更前の予定を保持しています。ブラウザの空き容量を確認してください。":"保存に失敗し、元の保存状態にも戻せませんでした。画面を閉じずにバックアップを保存してください。");
  }
}
function undoScheduleChange() {
  if(!lastReschedule)return;
  if(JSON.stringify(sanitizeMaterialTasks(materialTasks))!==JSON.stringify(lastReschedule.afterTasks)
    || (lastReschedule.afterPlans&&JSON.stringify(materialPlans)!==JSON.stringify(lastReschedule.afterPlans))
    || (lastReschedule.afterHolidays&&JSON.stringify(holidays)!==JSON.stringify(lastReschedule.afterHolidays))) {
    setScheduleStatus("直前の変更後に予定・実績・休日が更新されたため、取り消せません。現在の変更を保持しました。","error");return;
  }
  const tasks=sanitizeMaterialTasks(lastReschedule.beforeTasks),plans=lastReschedule.beforePlans||materialPlans,days=lastReschedule.beforeHolidays||holidays;
  try{persistScheduleEditState(tasks,plans,days,null);}catch(error){setScheduleStatus(error.message,"error");return;}
  materialTasks=tasks;materialPlans=plans;holidays=days;lastReschedule=null;
  setScheduleStatus("直前の変更を取り消しました。予定・休日・教材設定を元に戻しました。","success");render();
}
function commitScheduleEdit() {
  const draft=pendingScheduleEdit;if(!draft)return;
  if(scheduleFingerprint(scheduleState())!==scheduleFingerprint(draft.before)) {
    scheduleElement("scheduleChangeStatus").textContent="確認中に予定が変更されました。入力に戻り、最新の予定で再確認してください。";return;
  }
  const tasks=sanitizeMaterialTasks(draft.result.tasks),plans=sanitizeMaterialPlans(draft.result.plans),days=[...draft.result.holidays];
  const snapshot={operation:"edit",beforeTasks:draft.before.tasks,afterTasks:tasks,beforePlans:draft.before.plans,afterPlans:plans,
    beforeHolidays:draft.before.holidays,afterHolidays:days,summary:`編集を保存しました。予定の変更・追加・置き換え ${draft.result.changes.length}件。`,createdAt:new Date().toISOString()};
  try{persistScheduleEditState(tasks,plans,days,snapshot);}catch(error){scheduleElement("scheduleChangeStatus").textContent=error.message;return;}
  materialTasks=tasks;materialPlans=plans;holidays=days;lastReschedule=snapshot;
  if(draft.taskId){scheduleSelectedDate=tasks.find(t=>t.id===draft.taskId)?.date||scheduleSelectedDate;scheduleMonth=scheduleSelectedDate.slice(0,7);}
  pendingScheduleEdit=null;scheduleElement("scheduleChangeDialog").close();setScheduleStatus(snapshot.summary,"success");render();
}
document.addEventListener("DOMContentLoaded",()=>{
  scheduleEditForm.addEventListener("input",updateTaskEditHint);
  scheduleElement("scheduleEditCancel").addEventListener("click",()=>scheduleEditDialog.close());
  scheduleElement("materialSettingsCancel").addEventListener("click",()=>scheduleElement("materialSettingsDialog").close());
  scheduleElement("materialSettingsForm").addEventListener("input",updatePlanModeHint);
  for(const id of ["scheduleChangeClose","scheduleChangeCancel"])scheduleElement(id).addEventListener("click",()=>scheduleElement("scheduleChangeDialog").close());
  scheduleElement("scheduleChangeBack").addEventListener("click",()=>{const editor=pendingScheduleEdit?.editorId;scheduleElement("scheduleChangeDialog").close();if(editor)scheduleElement(editor).showModal();});
  scheduleElement("scheduleChangeDialog").addEventListener("close",()=>{pendingScheduleEdit=null;});
  scheduleElement("scheduleChangeSave").addEventListener("click",commitScheduleEdit);
});

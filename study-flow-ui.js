'use strict';
let completionMode='finish',completionBaseline='',completionStorageBaseline='',completionSaving=false;
const flowStorageFingerprint=()=>JSON.stringify([STORAGE_KEY,MATERIAL_TASKS_KEY,MATERIAL_PLANS_KEY,HOLIDAYS_KEY].map(key=>localStorage.getItem(key)));
const flowState=()=>({records, tasks:materialTasks,plans:materialPlans,holidays});
const flowFingerprint=()=>JSON.stringify(flowState());
function saveFlowState(state){
  const clean={records:sanitizeRecords(state.records),tasks:sanitizeMaterialTasks(state.tasks),plans:sanitizeMaterialPlans(state.plans)};
  StudyFlow.persist(localStorage,[[STORAGE_KEY,clean.records],[MATERIAL_TASKS_KEY,clean.tasks],[MATERIAL_PLANS_KEY,clean.plans]]);
  records=clean.records;materialTasks=clean.tasks;materialPlans=clean.plans;
}
function linkedStudyRecord(task){return StudyFlow.linked(records,task);}
function openStudyCompletion(task,undo=false){
  completionTaskId=task.id;completionMode=undo?'undo':'finish';completionBaseline=flowFingerprint();completionStorageBaseline=flowStorageFingerprint();
  const record=linkedStudyRecord(task),plan=planById(task.planId),subject=plan?.subject||task.subject||(!task.planId?materialTasks.find(t=>!t.planId&&t.material===task.material&&t.subject)?.subject:'')||'';
  scheduleElement('scheduleCompletionTitle').textContent=undo?'完了を取り消す':task.done?'学習時間を記録・修正':'学習を完了・記録';
  scheduleElement('scheduleCompletionLabel').textContent=`${task.material}／${taskTypeLabel(task.type)}／${formatTaskRange(task)}`;
  scheduleElement('completionFields').hidden=undo;
  scheduleElement('completionUndoFields').hidden=!undo;
  scheduleElement('completionRecordNote').textContent=record?`記録済み ${record.minutes}分${undo?'':'（同じ記録を更新）'}`:task.done?'完了済み・時間未記録':'';
  const date=scheduleElement('scheduleCompletedDate');date.value=record?.date||(task.done?task.completedDate:localDateKey());date.max=localDateKey();
  date.min=materialTasks.find(t=>t.id===task.sourceNewId)?.completedDate||'';
  scheduleElement('completionDateDetails').open=false;
  scheduleElement('completionDateLabel').textContent=date.value===localDateKey()?'今日':date.value;
  scheduleElement('completionMinutes').value=record?.minutes||'';
  syncCompletionPresets();
  scheduleElement('completionSubject').value=subject||record?.subject||'';
  scheduleElement('completionSubject').disabled=Boolean(subject);
  scheduleElement('completionSubjectChoice').hidden=Boolean(subject||record?.subject);
  scheduleElement('completionSubjectDisplay').textContent=subject||record?.subject||'科目未設定';
  scheduleElement('completionSubjectHint').hidden=Boolean(subject);
  scheduleElement('completionSubjectHint').textContent=subject?'教材に設定された科目を使用します。教材の設定から変更できます。':'科目を選ぶと、この教材の次回の記録にも使います。';
  scheduleElement('completionWithoutTime').hidden=Boolean(record)||undo;
  scheduleElement('completionSave').hidden=undo;
  scheduleElement('completionSave').textContent=record?(task.done?'学習記録を更新':'既存の記録を更新して完了'):'時間を記録して完了';
  scheduleElement('completionKeepRecord').hidden=!record;
  scheduleElement('completionDeleteRecord').textContent=record?'記録も削除して取り消す':'完了を取り消す';
  scheduleElement('completionUndoNote').textContent=record?`${record.date}の${record.minutes}分を実績として残すか、削除するか選んでください。残した記録は再完了時も再利用します。`:'時間の記録はありません。予定を未完了に戻します。';
  scheduleElement('scheduleCompletionStatus').textContent='';scheduleElement('scheduleCompletionDialog').showModal();
}
function submitStudyCompletion(action){
  if(completionSaving)return;
  try{
    if(flowFingerprint()!==completionBaseline||flowStorageFingerprint()!==completionStorageBaseline)throw Error('入力中に予定または記録が更新されました。一度閉じて、画面を再読み込みしてから開き直してください。');
    completionSaving=true;
    const state=action==='keep'||action==='delete'?StudyFlow.undo(flowState(),completionTaskId,action==='keep',createId):
      StudyFlow.finish(flowState(),completionTaskId,{withTime:action==='time',date:scheduleElement('scheduleCompletedDate').value,minutes:scheduleElement('completionMinutes').value,subject:scheduleElement('completionSubject').value},createId,localDateKey());
    saveFlowState(state);completionBaseline=flowFingerprint();
    scheduleElement('scheduleCompletionDialog').close();completionTaskId='';
    setScheduleStatus(action==='keep'?'完了を取り消しました。学習記録は実績として残しました。':action==='delete'?'完了と紐づく学習記録を取り消しました。':action==='time'?'予定の完了と学習記録を保存しました。':'時間を記録せず完了しました。','success');render();
  }catch(error){scheduleElement('scheduleCompletionStatus').textContent=error.message;}
  finally{completionSaving=false;}
}
function syncCompletionPresets(){
  document.querySelectorAll('[data-completion-minutes]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.completionMinutes)===Number(scheduleElement('completionMinutes').value))));
}
document.addEventListener('DOMContentLoaded',()=>{
  scheduleElement('scheduleCompletionForm').addEventListener('submit',e=>{e.preventDefault();submitStudyCompletion('time');});
  for(const [id,action] of [['completionWithoutTime','none'],['completionKeepRecord','keep'],['completionDeleteRecord','delete']])scheduleElement(id).addEventListener('click',()=>submitStudyCompletion(action));
  document.querySelectorAll('[data-completion-minutes]').forEach(button=>button.addEventListener('click',()=>{scheduleElement('completionMinutes').value=button.dataset.completionMinutes;syncCompletionPresets();}));
  scheduleElement('completionMinutes').addEventListener('input',syncCompletionPresets);
  scheduleElement('scheduleCompletedDate').addEventListener('change',()=>{const date=scheduleElement('scheduleCompletedDate');scheduleElement('completionDateLabel').textContent=date.value===localDateKey()?'今日':date.value;});
  scheduleElement('completionCancel').addEventListener('click',()=>scheduleElement('scheduleCompletionDialog').close());
});

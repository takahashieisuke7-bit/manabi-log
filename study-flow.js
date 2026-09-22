(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./schedule-engine.js'));else root.StudyFlow=factory(root.ScheduleEngine);})(typeof globalThis==='object'?globalThis:this,function(E){
  'use strict';
  const copy=s=>structuredClone(s);
  const linked=(records,task)=>records.find(r=>r.scheduleTaskId===task.id)||records.find(r=>r.id===task.recordId);
  function align(state){
    const s=copy(state);
    s.tasks.forEach(t=>{t.recordId=linked(s.records,t)?.id||'';});
    return s;
  }
  function validateDate(date,today){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||date>today)throw Error('学習日は今日以前の日付を指定してください。');}
  function validateCompletedChildren(s,task,date){if(s.tasks.some(t=>t.sourceNewId===task.id&&t.done&&(t.completedDate||t.date)<date))throw Error('完了済みの復習より後の日には変更できません。復習の実績日を確認してください。');}
  function finish(state,id,values,makeId,today){
    const s=align(state),task=s.tasks.find(t=>t.id===id);if(!task)throw Error('予定が見つかりません。');
    const old=linked(s.records,task),plan=s.plans.find(p=>p.id===task.planId);
    const date=values.date;validateDate(date,today);validateCompletedChildren(s,task,date);
    if(!values.withTime&&old)throw Error('この予定には学習記録があります。既存の記録を更新するか、記録画面から削除してください。');
    if(values.withTime){
      const inherited=!task.planId?s.tasks.find(t=>!t.planId&&t.material===task.material&&t.subject)?.subject:'';
      const minutes=Number(values.minutes),subject=String(plan?.subject||task.subject||inherited||values.subject||old?.subject||'').trim().slice(0,30);
      if(!subject)throw Error('科目を選んでください。');
      if(!Number.isInteger(minutes)||minutes<1||minutes>1439)throw Error('実際に使った時間を1〜1439分で入力してください。');
      const record={...old,id:old?.id||makeId(),scheduleTaskId:id,material:task.material,rangeStart:task.start,rangeEnd:task.end,rangeUnit:task.unit,studyType:task.type,
        subject,date,minutes,wordCount:old?.wordCount||0,activity:old?.activity||(task.type==='review'?'復習':'教材学習'),memo:old?.memo||`${task.material}／${task.type==='review'?'復習':'新規'}／${E.rangeLabel(task)}`};
      s.records=old?s.records.map(r=>r.id===old.id?record:r):[record,...s.records];task.recordId=record.id;
      if(plan)plan.subject=subject;
      else s.tasks.filter(t=>!t.planId&&t.material===task.material).forEach(t=>t.subject=subject);
    }
    if(!task.done||task.completedDate!==date)s.tasks=E.complete(s.tasks,s.plans,s.holidays,id,date,makeId);
    return align(s);
  }
  function undo(state,id,keepRecord,makeId){
    const s=align(state),task=s.tasks.find(t=>t.id===id);if(!task)throw Error('予定が見つかりません。');
    s.tasks=E.complete(s.tasks,s.plans,s.holidays,id,'',makeId);
    if(!keepRecord){const old=linked(s.records,task);if(old)s.records=s.records.filter(r=>r.id!==old.id);}
    return align(s);
  }
  function changeRecords(state,nextRecords,makeId,today){
    const s=align(state),oldRecords=s.records;s.records=copy(nextRecords);
    const seen=new Set();
    for(const record of s.records){
      if(record.scheduleTaskId){if(seen.has(record.scheduleTaskId))throw Error('同じ予定の学習記録が重複しています。');seen.add(record.scheduleTaskId);}
      const task=s.tasks.find(t=>t.id===record.scheduleTaskId||t.recordId===record.id);if(!task)continue;
      const old=oldRecords.find(r=>r.id===record.id);
      if(task.done&&old&&old.date!==record.date){validateDate(record.date,today);validateCompletedChildren(s,task,record.date);s.tasks=E.complete(s.tasks,s.plans,s.holidays,task.id,record.date,makeId);}
      if(old&&old.subject!==record.subject){const plan=s.plans.find(p=>p.id===task.planId);if(plan)plan.subject=record.subject;else s.tasks.filter(t=>!t.planId&&t.material===task.material).forEach(t=>t.subject=record.subject);}
    }
    return align(s);
  }
  function persist(storage,entries){
    const before=entries.map(([key])=>[key,storage.getItem(key)]);
    try{for(const [key,value] of entries)storage.setItem(key,JSON.stringify(value));}
    catch(error){let restored=true;for(const [key,value] of before)try{value===null?storage.removeItem(key):storage.setItem(key,value);}catch{restored=false;}
      throw Error(restored?'保存できませんでした。予定と記録は変更前の状態です。空き容量を確認してください。':'保存状態を復元できませんでした。画面を閉じずにバックアップを保存してください。');}
  }
  return {linked,align,finish,undo,changeRecords,persist};
});

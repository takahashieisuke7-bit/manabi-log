'use strict';
// Stable visual identity, independent of time range, ranking and registered subjects.
function subjectChartColor(subject) {
  const name=String(subject).trim().normalize('NFKC');
  const known=['英語','数学','国語','物理','化学','生物','日本史','世界史','地理','情報'];
  let index=known.indexOf(name);
  if(index<0){let hash=2166136261;for(const char of name)hash=Math.imul(hash^char.codePointAt(0),16777619);index=(hash>>>0)%10;}
  return `var(--chart-${index+1})`;
}
let studyBarsMode='day',studyBarsShift=0,studyBarsSelection='';
const chartNode=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
function studySubjectColors(){return new Map([...new Set(records.map(r=>r.subject))].sort((a,b)=>a.localeCompare(b,'ja')).map(s=>[s,subjectChartColor(s)]));}
function renderStudyBars(){
  const host=document.getElementById('studyBars');if(!host)return;
  const count=studyBarsMode==='day'?7:studyBarsMode==='week'?4:6;
  const anchor=records.map(r=>r.date).sort().at(-1)||localDateKey();
  const buckets=StudyAnalysis.buckets(records,studyBarsMode,anchor,studyBarsShift,count),colors=studySubjectColors();
  document.getElementById('studyBarsNext').disabled=studyBarsShift>=0;
  document.getElementById('studyBarsRange').textContent=`${buckets[0].start} 〜 ${buckets.at(-1).end}（${studyBarsMode==='day'?'日別・7日間':studyBarsMode==='week'?'週別・月曜始まり・4週間':'月別・6か月'}）`;
  document.getElementById('studyBarsSummary').textContent=`期間合計 ${formatMinutes(buckets.reduce((n,b)=>n+b.total,0))}`;
  document.querySelectorAll('[data-study-period]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.studyPeriod===studyBarsMode));b.classList.toggle('active',b.dataset.studyPeriod===studyBarsMode);});
  host.replaceChildren();const max=StudyAnalysis.axisMaximum(records,studyBarsMode);
  const axis=chartNode('div','study-bar-axis');for(const n of [max,max/2,0])axis.append(chartNode('span','',`${Number(n.toFixed(1))}分`));host.append(axis);
  const scroll=chartNode('div','study-bars-scroll'),plot=chartNode('div','study-bar-plot');plot.style.setProperty('--bar-count',buckets.length);
  for(const bucket of buckets){
    const button=chartNode('button','study-bar-button');button.type='button';button.setAttribute('aria-label',`${bucket.start}${bucket.end!==bucket.start?'〜'+bucket.end:''} 合計${bucket.total}分 ${Object.entries(bucket.subjects).map(([s,m])=>s+' '+m+'分').join('・')||'記録なし'}`);button.setAttribute('aria-pressed',String(studyBarsSelection===bucket.start));
    const column=chartNode('div','study-bar-column'),stack=chartNode('div','study-bar-stack');stack.style.height=`${bucket.total/max*100}%`;
    for(const [subject,color] of colors){const amount=bucket.subjects[subject];if(!amount)continue;const segment=chartNode('span','study-bar-segment');segment.style.background=color;segment.style.flex=String(amount);segment.title=`${subject} ${amount}分`;stack.append(segment);}
    const label=chartNode('span','study-bar-label');
    if(studyBarsMode==='day'){const [month,day]=bucket.label.split('/');label.append(chartNode('span','day-month',month+'/'),chartNode('span','day-number',day));}
    else label.textContent=bucket.label;
    column.append(stack);button.append(chartNode('span','study-bar-total',''),column,label);
    button.addEventListener('click',()=>{studyBarsSelection=bucket.start;renderStudyBars();document.getElementById('studyBarsDetail').scrollIntoView({block:'nearest'});});plot.append(button);
  }
  scroll.append(plot);host.append(scroll);
  const legend=document.getElementById('studyBarsLegend');legend.replaceChildren();
  for(const [subject,color] of colors){if(!buckets.some(b=>b.subjects[subject]))continue;const label=chartNode('span','study-subject-legend'),mark=chartNode('i');mark.style.background=color;label.append(mark,document.createTextNode(subject));legend.append(label);}
  const detail=document.getElementById('studyBarsDetail');detail.replaceChildren();const selected=buckets.find(b=>b.start===studyBarsSelection);detail.hidden=!selected;
  if(selected){
    detail.append(chartNode('h3','',`${selected.start}${selected.end!==selected.start?' 〜 '+selected.end:''} · 合計 ${formatMinutes(selected.total)}`));
    for(const [subject,amount] of Object.entries(selected.subjects))detail.append(chartNode('p','',`${subject}：${formatMinutes(amount)}`));
    if(!selected.records.length)detail.append(chartNode('p','','この期間の記録はありません（0分）。'));
    const list=chartNode('div','study-period-records');for(const record of [...selected.records].sort((a,b)=>a.date.localeCompare(b.date))){const row=chartNode('div','study-period-record');row.append(chartNode('span','',`${record.date}／${record.subject}／${record.minutes}分／${record.memo||record.activity}`));const edit=chartNode('button','secondary-button','記録を編集');edit.type='button';edit.addEventListener('click',()=>openRecordEditDialog(record));row.append(edit);list.append(row);}detail.append(list);
  }
}
function createMockComparison(name,events,results,colorBySubject){
  const wrap=chartNode('section','mock-comparison');wrap.append(chartNode('h3','','同じ回の科目別比較（偏差値）'));
  const label=chartNode('label','','比較する回'),select=chartNode('select');select.setAttribute('aria-label',name+'の比較する回');
  events.forEach(event=>{const option=chartNode('option','',`${event.round?'第'+event.round+'回':'回数未設定'}・${event.date}`);option.value=event.key;select.append(option);});select.value=events.at(-1).key;label.append(select);wrap.append(label);
  const chart=chartNode('div','mock-comparison-bars');wrap.append(chart,chartNode('p','setting-note','棒の長さは偏差値0〜100。総合は科目と分けて表示します。'));
  const draw=()=>{chart.replaceChildren();const items=results.filter(r=>`${r.round??'none'}\u0000${r.date}`===select.value&&Number.isFinite(r.deviation)).sort((a,b)=>(a.subject==='総合')-(b.subject==='総合')||a.subject.localeCompare(b.subject,'ja'));
    if(!items.length)chart.append(chartNode('p','','この回の偏差値は未登録です。'));
    for(const result of items){const row=chartNode('div','mock-comparison-row'+(result.subject==='総合'?' total':'')),track=chartNode('div','mock-comparison-track'),bar=chartNode('span');bar.style.width=result.deviation+'%';bar.style.background=colorBySubject.get(result.subject)||'var(--chart-1)';track.append(bar);row.append(chartNode('span','',result.subject),track,chartNode('strong','',String(result.deviation)));chart.append(row);}
  };select.addEventListener('change',draw);draw();return wrap;
}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-study-period]').forEach(button=>button.addEventListener('click',()=>{studyBarsMode=button.dataset.studyPeriod;studyBarsShift=0;studyBarsSelection='';renderStudyBars();}));
  for(const [id,delta] of [['studyBarsPrevious',-1],['studyBarsNext',1],['studyBarsToday',0]])document.getElementById(id).addEventListener('click',()=>{studyBarsShift=delta?Math.min(0,studyBarsShift+delta):0;studyBarsSelection='';renderStudyBars();});
});

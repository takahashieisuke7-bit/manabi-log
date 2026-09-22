(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.StudyAnalysis=factory();})(typeof globalThis==='object'?globalThis:this,function(){
  const key=d=>d.toISOString().slice(0,10),day=s=>new Date(s+'T00:00:00Z');
  const add=(s,n)=>{const d=day(s);d.setUTCDate(d.getUTCDate()+n);return key(d);};
  function buckets(records,mode,today,shift=0,limit){
    const count=limit||(mode==='day'?7:mode==='week'?8:12),anchor=day(today),output=[];
    if(mode==='day')anchor.setUTCDate(anchor.getUTCDate()+shift*count-(count-1));
    if(mode==='week')anchor.setUTCDate(anchor.getUTCDate()-((anchor.getUTCDay()+6)%7)+(shift*count-(count-1))*7);
    if(mode==='month'){anchor.setUTCDate(1);anchor.setUTCMonth(anchor.getUTCMonth()+shift*count-(count-1));}
    for(let i=0;i<count;i++){
      const start=key(anchor);let end;
      if(mode==='month'){anchor.setUTCMonth(anchor.getUTCMonth()+1);end=add(key(anchor),-1);}else{end=add(start,mode==='week'?6:0);anchor.setUTCDate(anchor.getUTCDate()+(mode==='week'?7:1));}
      const list=records.filter(r=>r.date>=start&&r.date<=end),totals=new Map();for(const r of list)totals.set(r.subject,(totals.get(r.subject)||0)+r.minutes);
      const subjects=Object.fromEntries(totals);
      output.push({start,end,label:mode==='month'?`${Number(start.slice(5,7))}月`:`${Number(start.slice(5,7))}/${Number(start.slice(8))}`,records:list,subjects,total:list.reduce((n,r)=>n+r.minutes,0)});
    }return output;
  }
  // One scale per aggregation mode, across every period page; zero always stays visible.
  function axisMaximum(records,mode){
    const totals=new Map();for(const r of records){let period=r.date;
      if(mode==='month')period=period.slice(0,7);
      if(mode==='week')period=add(period,-((day(period).getUTCDay()+6)%7));
      totals.set(period,(totals.get(period)||0)+r.minutes);
    }
    return Math.max(60,Math.ceil(Math.max(0,...totals.values())/60)*60);
  }
  return {buckets,axisMaximum};
});

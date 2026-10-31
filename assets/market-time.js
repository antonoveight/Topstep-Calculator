/* Civil-time projections: each event uses the offset at its own instant. */
const MarketTime=(()=>{
    const formats=new Map(),NY='America/New_York';
    function parts(date,zone){
        if(!formats.has(zone))formats.set(zone,new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}));
        const p={};for(const item of formats.get(zone).formatToParts(new Date(date)))if(item.type!=='literal')p[item.type]=Number(item.value);
        return p;
    }
    const stamp=p=>Date.UTC(p.year,p.month-1,p.day,p.hour||0,p.minute||0,p.second||0);
    function offset(date,zone){return stamp(parts(date,zone))-Math.floor(Number(new Date(date))/1000)*1000;}
    function addDay(p,n){const d=new Date(Date.UTC(p.year,p.month-1,p.day+n));return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};}
    function wall(p,zone){
        const desired=stamp(p);let guess=desired;
        for(let i=0;i<6;i++){const next=desired-offset(guess,zone);if(next===guess)break;guess=next;}
        return stamp(parts(guess,zone))===desired?new Date(guess):null; // Skip nonexistent spring-forward times.
    }
    function minute(date,zone){const p=parts(date,zone);return p.hour*60+p.minute+p.second/60;}
    function atMinute(day,min,zone){const d=addDay(day,Math.floor(min/1440)),m=((min%1440)+1440)%1440;return wall({...d,hour:Math.floor(m/60),minute:Math.floor(m%60),second:Math.round((m%1)*60)},zone);}
    function dayBounds(refDate,zone){const p=parts(refDate,zone);return {date:p,start:wall({...p,hour:0,minute:0,second:0},zone),end:wall({...addDay(p,1),hour:0},zone)};}
    function projectNY(startMinute,endMinute,zone,refDate=new Date()){
        const day=dayBounds(refDate,zone),nyDate=parts(day.start,NY),events=[],intervals=[];
        const end=endMinute<=startMinute?endMinute+1440:endMinute;
        for(let delta=-1;delta<=2;delta++){
            const d=addDay(nyDate,delta),start=atMinute(d,startMinute,NY),finish=atMinute(d,end,NY);
            if(!start||!finish||finish<=day.start||start>=day.end)continue;
            const a=Math.max(Number(start),Number(day.start)),b=Math.min(Number(finish),Number(day.end));
            const from=a===Number(day.start)?0:minute(a,zone),to=b===Number(day.end)?1440:minute(b,zone);
            if(to>from)intervals.push({start:from,end:to});
            events.push({start,finish});
        }
        intervals.sort((a,b)=>a.start-b.start);
        const anchor=events.find(e=>e.start>=day.start&&e.start<day.end)||events[0];
        return {startMin:anchor?minute(anchor.start,zone):null,endMin:anchor?minute(anchor.finish,zone):null,durationMin:end-startMinute,intervals,events};
    }
    function selectedInstant(minuteOfDay,zone,refDate=new Date()){return atMinute(parts(refDate,zone),minuteOfDay,zone);}
    function key(date,zone){const p=parts(date,zone);return `${p.year}-${p.month}-${p.day}`;}
    return {NY,parts,wall,offset,addDay,atMinute,minute,dayBounds,projectNY,selectedInstant,key};
})();
if(typeof window!=='undefined')window.MarketTime=MarketTime;
if(typeof module!=='undefined')module.exports=MarketTime;

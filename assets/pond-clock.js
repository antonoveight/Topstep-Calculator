/* Display time in Vietnam; the optional activity windows come from the project's schedule cards. */
const PondClock=(()=>{
    const vn=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
    const ct=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',timeZoneName:'shortOffset'});
    const palettes={
        morning:{brightness:.96,saturation:.8,sepia:.04,night:0,mist:.11},
        noon:{brightness:1.08,saturation:.92,sepia:0,night:0,mist:0},
        afternoon:{brightness:1,saturation:1,sepia:.07,night:0,mist:0},
        evening:{brightness:.56,saturation:.64,sepia:0,night:1,mist:0}
    };
    const labels={morning:'Buổi sáng',noon:'Buổi trưa',afternoon:'Buổi chiều',evening:'Buổi tối'};
    function normalizeMode(mode) {return Object.hasOwn(palettes,mode)?mode:'auto';}
    function contains(minute,start,end) {
        start=((start%1440)+1440)%1440;end=((end%1440)+1440)%1440;
        return start<=end?minute>=start && minute<end:minute>=start || minute<end;
    }
    function context(now=new Date(),mode='auto',windows=[]) {
        mode=normalizeMode(mode);
        const parts=Object.fromEntries(vn.formatToParts(now).map(p=>[p.type,p.value]));
        const hour=Number(parts.hour),minute=Number(parts.minute),total=hour*60+minute;
        const natural=hour>=5 && hour<10?'morning':hour>=10 && hour<14?'noon':hour>=14 && hour<18?'afternoon':'evening';
        const part=mode==='auto'?natural:mode;
        const winter=ct.formatToParts(now).some(p=>p.type==='timeZoneName' && p.value==='GMT-6');
        const activity=windows.find(w=>{
            const shift=w.usShift && winter?60:0;
            return contains(total,w.start+shift,w.end+(w.startOnly?0:shift));
        });
        return {mode,part,preview:mode!=='auto',hour,minute,total,winter,
            clockText:parts.hour+':'+parts.minute,label:labels[part],palette:palettes[part],
            activity:activity?{label:activity.label,active:activity.active}: {label:'Giữa các khung giờ',active:false}};
    }
    return {context,normalizeMode,palettes,labels,contains};
})();
if(typeof module!=='undefined' && module.exports) module.exports=PondClock;

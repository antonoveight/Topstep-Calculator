/* One project schedule, taken from section 7 of trading_playbook.md. */
const PondSchedule=(()=>{
    const windows=[
        {id:'morning',start:465,end:600,label:'Khung sáng',active:true,usShift:false,setups:[1,2],symbols:['MGC','MNQ']},
        {id:'noon',start:630,end:810,label:'Nghỉ trưa',active:false},
        {id:'afternoon',start:840,end:960,label:'Khung chiều · MGC',active:true,setups:[1,3],symbols:['MGC']},
        {id:'break',start:990,end:1170,label:'Nghỉ chiều',active:false},
        {id:'us',start:1215,end:1350,label:'Khung Mỹ',active:true,usShift:true,setups:[1,2,4],symbols:['MGC','MNQ']},
        {id:'night',start:1350,end:465,label:'Nghỉ đêm',active:false,usShift:true,startOnly:true}
    ];
    function format(minute){return String(Math.floor(minute/60)%24).padStart(2,'0')+':'+String(minute%60).padStart(2,'0');}
    function effective(now=new Date()) {
        const winter=PondClock.context(now).winter;
        return windows.map(w=>{const shift=w.usShift&&winter?60:0;return {...w,start:w.start+shift,end:w.end+(w.startOnly?0:shift)};});
    }
    function describeSetup(setup,now=new Date()) {
        return effective(now).filter(w=>w.active&&w.setups.includes(Number(setup))).map(w=>format(w.start)+'–'+format(w.end)).join(' · ');
    }
    function selected(id,now=new Date()){return effective(now).find(w=>w.id===id&&w.active)||effective(now).find(w=>w.active);}
    return {windows,effective,describeSetup,selected,format};
})();
if(typeof module!=='undefined')module.exports=PondSchedule;

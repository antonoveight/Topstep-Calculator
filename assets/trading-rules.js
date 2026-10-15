/* Shared account configuration and pure ledger calculations. */
(function(root) {
const accounts = {
            "50": {
                title: "$50K Buying Power",
                stdFee: "$49 / tháng",
                noActFee: "$85 / tháng",
                originalNoActFee: "$95",
                discount: "-$10",
                stdActivation: "+ $149 Phí kích hoạt",
                noActActivation: "Miễn 100% Phí kích hoạt ($0)",
                target: "$3,000",
                targetVal: 3000,
                consistencyPct: 55,
                consistencyRatio: 0.55,
                mll: "$2,000",
                mllVal: 2000,
                mllLock: "Khóa tại $50K",
                dll: "$1,000",
                dllVal: 1000,
                resetFee: "$85",
                rebillCredit: "Bao gồm (Credit hàng tháng)",
                initialBal: 50000,
                contracts: "5 Minis / 50 Micros",
                maxMicros: 50,
                safeProfit: "≤ $1,649 / ngày",
                combineMllText: "Khóa tại $50,000",
                xfaStdCap: "$2,000",
                xfaConCap: "$3,000",
                xfaStdCapVal: 2000,
                xfaConCapVal: 3000
            },
            "100": {
                title: "$100K Buying Power [Recommended]",
                stdFee: "$99 / tháng",
                noActFee: "$129 / tháng",
                originalNoActFee: "$149",
                discount: "-$20",
                stdActivation: "+ $149 Phí kích hoạt",
                noActActivation: "Miễn 100% Phí kích hoạt ($0)",
                target: "$6,000",
                targetVal: 6000,
                consistencyPct: 55,
                consistencyRatio: 0.55,
                mll: "$3,000",
                mllVal: 3000,
                mllLock: "Khóa tại $100K",
                dll: "$2,000",
                dllVal: 2000,
                resetFee: "$129",
                rebillCredit: "Bao gồm (Credit hàng tháng)",
                initialBal: 100000,
                contracts: "10 Minis / 100 Micros",
                maxMicros: 100,
                safeProfit: "≤ $3,299 / ngày",
                combineMllText: "Khóa tại $100,000",
                xfaStdCap: "$3,000",
                xfaConCap: "$4,000",
                xfaStdCapVal: 3000,
                xfaConCapVal: 4000
            },
            "150": {
                title: "$150K Buying Power",
                stdFee: "$199 / tháng",
                noActFee: "$199 / tháng",
                originalNoActFee: "$229",
                discount: "-$30",
                stdActivation: "+ $149 Phí kích hoạt",
                noActActivation: "Miễn 100% Phí kích hoạt ($0)",
                target: "$9,000",
                targetVal: 9000,
                consistencyPct: 55,
                consistencyRatio: 0.55,
                mll: "$4,500",
                mllVal: 4500,
                mllLock: "Khóa tại $150K",
                dll: "$3,000",
                dllVal: 3000,
                resetFee: "$199",
                rebillCredit: "Bao gồm (Credit hàng tháng)",
                initialBal: 150000,
                contracts: "15 Minis / 150 Micros",
                maxMicros: 150,
                safeProfit: "≤ $4,949 / ngày",
                combineMllText: "Khóa tại $150,000",
                xfaStdCap: "$5,000",
                xfaConCap: "$6,000",
                xfaStdCapVal: 5000,
                xfaConCapVal: 6000
            }
        };


const policy = Object.freeze({checkedOn:'2026-10-15', standardDays:5, winningDay:150,
    consistencyDays:3, consistencyRatio:0.4, minimumPayout:125, payoutFraction:0.5,
    sources:[['MLL','https://help.topstep.com/en/articles/8284204-what-is-the-maximum-loss-limit'],
    ['Payout','https://help.topstep.com/en/articles/8284233-topstep-payout-policy'],
    ['Scaling','https://help.topstep.com/en/articles/8284223-what-is-the-scaling-plan'],
    ['DLL','https://help.topstep.com/en/articles/10490293-daily-loss-limit-in-the-trading-combine-and-express-funded-account']]});
function rules(acc) {
    const base=accounts[acc.size];
    return {...base, initialBal:acc.stage==='xfa'?0:base.initialBal};
}
function ledger(acc, asOf='9999-12-31') {
    const data=rules(acc), entries=(acc.stage==='xfa'?acc.xfaJournalEntries:acc.journalEntries)||[];
    const payouts=acc.stage==='xfa'?(acc.payoutHistory||[]).filter(p=>p.date<=asOf):[];
    const daily={}, closed={};
    entries.filter(e=>e.date<=asOf).forEach(e=>{daily[e.date]=(daily[e.date]||0)+e.pnl;closed[e.date]=(closed[e.date]??true)&&e.closed!==false;});
    let balance=data.initialBal, mll=balance-data.mllVal, breached=false;
    const rows={};
    [...new Set([...Object.keys(daily),...payouts.map(p=>p.date)])].sort().forEach(date=>{
        balance+=daily[date]||0;
        if(balance<=mll) breached=true;
        if(closed[date]!==false) mll=Math.max(mll,Math.min(data.initialBal,balance-data.mllVal));
        payouts.filter(p=>p.date===date).forEach(p=>{balance-=p.amount;mll=0;});
        if(balance<=mll) breached=true;
        rows[date]={balance,mll,buffer:balance-mll,closed:closed[date]!==false};
    });
    return {daily,closed,rows,balance,mll,breached};
}
function payout(acc,asOf) {
    const book=ledger(acc,asOf), data=rules(acc);
    const lastDate=(acc.payoutHistory||[]).filter(p=>p.date<=asOf).map(p=>p.date).sort().at(-1)||'';
    const cycle=Object.entries(book.daily).filter(([date])=>date>lastDate&&book.closed[date]!==false);
    const profit=cycle.reduce((n,[,p])=>n+p,0), winningDays=cycle.filter(([,p])=>p>=policy.winningDay).length;
    const bestPct=profit>0?Math.max(0,...cycle.map(([,p])=>p))/profit:0;
    const cap=(acc.xfaPath==='consistency_payout'?data.xfaConCapVal:data.xfaStdCapVal)*(acc.payoutCapDoubled===true?2:1);
    const maxAllowed=Math.max(0,Math.min(cap,Math.floor(book.balance*100*policy.payoutFraction)/100));
    const standard=acc.xfaPath!=='consistency_payout';
    const ready=standard?winningDays>=policy.standardDays&&(!lastDate||profit>=.01):cycle.length>=policy.consistencyDays&&profit>0&&bestPct<=policy.consistencyRatio;
    const pending=Object.values(book.closed).some(value=>value===false);
    const eligible=acc.stage==='xfa'&&acc.status!=='archived'&&!book.breached&&!pending&&ready&&maxAllowed>=policy.minimumPayout;
    const progress=standard?`${winningDays}/${policy.standardDays} ngày thắng ≥ $${policy.winningDay}`:`${cycle.length}/${policy.consistencyDays} ngày · Consistency ${(bestPct*100).toFixed(1)}% ≤ 40%`;
    return {ledger:book,profit,winningDays,tradingDays:cycle.length,bestPct,maxAllowed,eligible,progress};
}
root.TradingRules={accounts,policy,rules,ledger,payout};
if(typeof module!=='undefined') module.exports=root.TradingRules;
})(typeof window!=='undefined'?window:globalThis);

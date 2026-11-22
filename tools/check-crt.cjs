// Current pure CRT checks; removed-model tests are historical, not part of this runner.
const {execFileSync}=require('node:child_process');
const tests=['indicator-contract','crt-context','pure-crt','crt-liquidity','crt-time','bias-context','model-context-priority','htf-cluster-groups','half-tiny-markers','indicator-no-fibo','candle-close-times','crt-replay-audit'];
for(const name of tests)execFileSync(process.execPath,['tests/'+name+'.cjs'],{stdio:'inherit'});
console.log('PASS all '+tests.length+' current pure-CRT suites. Pine chart/Replay remains separate.');

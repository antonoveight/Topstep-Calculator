// Current pure CRT checks; removed-model tests are historical, not part of this runner.
const {execFileSync}=require('node:child_process');
// R1/manual-zone studies and the former universal-MPS-gate fixtures describe
// superseded schema 2/3. Schema 4 is checked by actual-source branch/key traces.
const tests=['indicator-contract','crt-context','pure-crt','crt-liquidity','crt-time','bias-context','model-context-priority','htf-cluster-groups','half-tiny-markers','indicator-no-fibo','candle-close-times','crt-replay-audit','early-c2-pure','early-c2-renewal','crt-early-handoff','early-mps-chronology','setup-lifecycle','parent-range','larger-htf-view','htf-countdown','dual-htf-channel','crt-smt','crt-mps-drawing','crt-mps-structure','crt-local-key','crt-fractal-workflow','crt-cross-market-audit','crt-weekly-and-counter','crt-static-requests','crt-key-scan-equivalence','crt-session-clock','crt-entry-call-equivalence','crt-compact-export','crt-lean-renderer'];
for(const name of tests)execFileSync(process.execPath,['tests/'+name+'.cjs'],{stdio:'inherit'});
console.log('PASS all '+tests.length+' current pure-CRT suites. Pine chart/Replay remains separate.');

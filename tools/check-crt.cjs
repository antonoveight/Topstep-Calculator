// Stops on first failure. Does not imply Pine compilation or market validation.
const {execFileSync}=require('node:child_process');
const tests=['indicator-contract','crt-v1','crt-counter-bias','ob-timeframe-roles','bias-context','egf-internal-references','model-context-priority','htf-cluster-groups','signal-density-audit','day-trading-settings','half-tiny-markers'];
for(const name of tests)execFileSync(process.execPath,['tests/'+name+'.cjs'],{stdio:'inherit'});
console.log('PASS all '+tests.length+' CRT V1 check suites. Chart/Replay remains separate.');

// Local browser regression suite; external CDN/API calls are isolated by tests.
// This does not run Pine or replay financial market data.
const {execFileSync}=require('node:child_process');
const tests=['crt-time-browser','htf-framework','liquidity-guide','pond-model','pond-outcomes','pond-manual','pond-public','pond-studio','pond-behavior','pond-fullscreen','pond-wide-controls','review','workspace'];
for(const name of tests)execFileSync(process.execPath,['tests/'+name+'.cjs'],{stdio:'inherit'});
console.log('PASS all '+tests.length+' CRT web suites. Pine chart/Replay is separate.');

const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
fs.copyFileSync(path.join(root,'indicators/funded-angler-v6.pine'),path.join(root,'chibao.txt'));
console.log('Synchronized chibao.txt from indicators/funded-angler-v6.pine');

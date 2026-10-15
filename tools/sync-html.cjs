const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
fs.copyFileSync(path.join(root,'index.html'),path.join(root,'topstep.html'));
console.log('Synchronized topstep.html from index.html');

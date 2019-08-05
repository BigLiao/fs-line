const FSLine = require('../src/fsline');
const path = require('path');

const exampleFile = path.resolve(__dirname, './readme.md');
const fsLine = new FSLine();
fsLine.open(exampleFile);
fsLine.on('line', (line, next) => {
    setTimeout(() => {
        next(line + '111')
    }, 1);
});
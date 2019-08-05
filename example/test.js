const FSLine = require('../src/fsline');
const path = require('path');

const exampleFile = path.resolve(__dirname, './readme.md');
const fsLine = new FSLine();
fsLine.open(exampleFile);
let lineCount = 0;
fsLine.on('line', (line, next) => {
    console.log('%d: %s', ++lineCount, line);
    if (/\{\{(\d)+\}\}/.test(line)) {
        line = line.replace(/\{\{(\d)+\}\}/, function(str, count) {
            return '{{' + (parseInt(count) + 1) + '}}';
        });
        next(line);
    } else {
        next();
    }
});
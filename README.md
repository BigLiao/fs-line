# fs-line
A Node.js module for reading files line by line.

## Features
- Read file line by line, synchronously or asynchronously.
- Using `Stream`, can handler big file without put it in memory.
- Transform line string while reading.

## Installation
```sh
npm install fs-line
```

## Usage
Read and console each line:
```javascript
const FsLine = require('fs-line');

const fsLine = new FsLine();
fsLine.open(FILE_PATH);
let lineCount = 0;
fsLine.on('line', (line, next) => {
    console.log('%d: %s', ++lineCount, line);
    next();
});
```
Or asynchronously:
```javascript
const FsLine = require('fs-line');

const fsLine = new FsLine();
fsLine.open(FILE_PATH);
let lineCount = 0;
fsLine.on('line', (line, next) => {
    console.log('%d: %s', ++lineCount, line);
    setTimeout(next, 1000)
});
```
Remember to call `next` to read next line.

The `next` function can pass a input string as a **replacement** for current line:
```javascript
const FsLine = require('fs-line');

const fsLine = new FsLine();
fsLine.open(FILE_PATH);
let lineCount = 0;
fsLine.on('line', (line, next) => {
    const newLine = transform(line);
    next(newLine);
});
```

## API

### Class: FsLine([options])
Create a `fsline` instance.
```javascript
const FsLine = require('fs-line');
const fsline = new FsLine();
```

`options`: object, with following defaults:
```javascript
{
    encoding: 'utf8',
    separator: '\n',
}
```
You can change the separator such as `'\r\n'`.

### Event: 'line'
Emit when a line is readed, first argument is the line string, and the second argument is `next` function call to read next line.
```javascript
fsline.on('line', function(line, next) {
    // do some thing...
    next();
})
```
If a argument is passed to `next` function, then this line will be changed to the input argument:
```javascript
fsline.on('line', function(line, next) {
    // do some thing...
    next('===>' + line);
})
```

### Event: 'end'
All data is readed.

### Method: fsline.open(file)
Open a file, and begin to read.

`file` \<sting>: the file path

### Method: fsline.close()
Close the file, end the read stream.

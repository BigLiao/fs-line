const fs = require('fs');
const Buffer = require('buffer').Buffer;

fs.open('./file.txt','r', (err, fd) => {
    console.log('open: ', fd);
    const buf = Buffer.alloc(10);
    fs.readFile(fd, {
        encoding: 'utf8',
        flag: 'r'
    }, function(err, data) {
        console.log(data);
    })
})
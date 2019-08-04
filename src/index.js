const fs = require('fs');
const EventEmitter = require('events');
const Buffer = require('buffer').Buffer;

class BufferQueue {
    constructor() {
        this.MAX_SIZE = 1024; // 1kb
        this.buffer = Buffer.alloc(this.MAX_SIZE);
        this.head = 0;
        this.tail = 0;
    }
    push(a) {
        if (this.head + 1 % this.MAX_SIZE === this.tail) {
            throw Error('Buffer queue overflow!');
        }
        this.buffer[this.head] = typeof a === 'string' ? a.charCodeAt(0) : a;
        this.head = (this.head + 1) % this.MAX_SIZE;
    }
    pop() {
        if (this.head === this.tail) {
            return null;
        } else {
            const result = this.buffer[this.tail];
            this.tail = (this.tail + 1) % this.MAX_SIZE;
            return result;
        }
    }
    getRemainSize() {
        if (this.head === this.tail) {
            return 0;
        } else if (this.head > this.tail) {
            return this.head - this.tail;
        } else {
            return this.tail - this.head - 1;
        }
    }
    readByte(fd, index, callback) {
        if (this.head + 1 % this.MAX_SIZE === this.tail) {
            throw Error('Buffer queue overflow!');
        }
        fs.read(fd, this.buffer, this.head, 1, index, (err, bytesRead, buf) => {
            const byte = buf[this.head];
            this.head = (this.head + 1) % this.MAX_SIZE;
            callback(err, byte);
        });
    }
    readString(str,) {
        const len = str.length;
        const remainSize = this.getRemainSize();
        if (len > remainSize) {
            throw Error('Buffer overflow!');
        }
        this.buffer.write(str, 'utf8');
    }
    getString() {
        let result;
        if (this.head === this.tail) {
            result = '';
        } else if (this.head > this.tail) {
            result = this.buffer.toString('utf8', this.tail, this.head);
        } else {
            result = this.buffer.toString('utf8', this.tail) + this.buffer.toString('utf8', 0, this.head);
        }
        this.head = this.tail;
        return result;
    }
}
const queue = new BufferQueue();

class ReadLine extends EventEmitter {
    constructor() {
        super();
        this.fd = null;
        this.readPosition = 0;
        this.quque = queue;
        
    }
    open(file) {
        if (this.fd !== null) {
            fs.close(this.fd);
        }
        this.fd = fs.openSync(file, 'r+');
        this.readPosition = 0;
        this.stats = fs.fstatSync(this.fd);
        this.size = this.stats.size;
        this.readline();
    }
    readline() {
        if (this.fd === null) {
            throw Error('No file to read!');
        }
        const loop = () => {
            this.quque.readByte(this.fd, this.readPosition, (err, byte) => {
                if (err) throw err;
                this.readPosition++;
                if (this.readPosition === this.size) {
                    this.emit('end', this.quque.getString());
                } else if (byte === 10) {
                    // '\n'换行，暂未考虑'\n\r'
                    this.emit('line', this.quque.getString(), loop);
                } else if (byte === 0) {
                    this.emit('line', this.quque.getString());
                    this.emit('end');
                } else {
                    loop();
                }
            });
        }
        loop();
    }
    ready() {
        
    }
}

const readline = new ReadLine();
readline.open('./file.txt');
readline.on('line', (line, next) => {
    console.log('line: ', line);
    next();
})

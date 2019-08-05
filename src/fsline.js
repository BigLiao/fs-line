const fs = require('fs');
const EventEmitter = require('events');

class FSLine extends EventEmitter {
    constructor(config) {
        super();
        this.config = Object.assign({
            encoding: 'utf8',
            separator: '\n'
        }, config);

        this.file = null;
        this.readStream = null;
        this.lineList = [];
    }
    /*
    ** 打开文件流
    */
    open(file) {
        if (this.readStream) this.readStream.close();
        this.file = file;
        this.readStream = fs.createReadStream(file, {
            encoding: this.config.encoding,
        });
        this.writeStream = fs.createWriteStream(file + '.rp', {
            encoding: this.config.encoding,
        });
        this.readStream.on('data', (chulk) => {
            this.readStream.pause();
            const lastLine = this.lineList.length ? this.lineList[0] : '';
            this.lineList = (lastLine + chulk).split(this.config.separator);
            let previousLine = '';
            const next = (input) => {
                const toWrite = input || previousLine;
                this.writeLine(toWrite);
                previousLine = this.readLine(next);
            }
            previousLine = this.readLine(next);
        });
        this.readStream.on('end', () => {
            const lastLine = this.lineList[0];
            this.emit('line', lastLine, (input) => {
                const toWrite = input || lastLine;
                this.writeStream.end(toWrite, this.config.encoding, () => {
                    fs.unlinkSync(this.file);
                    fs.renameSync(this.file + '.rp', this.file);
                    this.emit('end');
                });
            })
        });
    }
    close() {
        this.readStream.destroy();
        this.writeStream.destroy();
        this.file = null;
        this.readStream = null;
        this.lineList = [];
    }
    /**
     * 读取行
     */
    readLine(next) {
        // last item is not a line
        if (this.lineList.length > 1) {
            const line = this.lineList.shift();
            this.emit('line', line, next);
            return line;
        } else {
            this.readStream.resume();
            return null;
        }
        
    }
    /**
     * 写入行
     */
    writeLine(line) {
        this.writeStream.write(line + this.config.separator, this.config.encoding)
    }
}

module.exports = FSLine;

const fs = require('fs');

const readStream = fs.createReadStream('./files/data.txt', {
    encoding: 'utf-8',  // 文件内容的编码方式，默认是 null，null 表示的是 buffer
    flags: 'r',  // 操作方式是只读
    highWaterMark: 3,  // 一次读取的数据量，单位是字节，默认是64k
    autoClose: true,  // 读取完成是否自动关闭流
    start: 0,  // 读取的起始位置
    end: 9,  // 读取的结束位置，包括9这个位置
});

readStream.on('open', () => {
    console.log('open');
})
readStream.on('data', (chunk) => {
    console.log(chunk);
    readStream.pause();
})

let timer = setTimeout(() => {
    readStream.resume();
}, 1000);

if (timer) {
    setTimeout(() => {
        readStream.resume();
    }, 2000);
}


readStream.on('end', () => {
    console.log('end');
})

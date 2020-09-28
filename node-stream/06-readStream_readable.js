const fs = require('fs');

const readStream = fs.createReadStream('./files/data.txt', {
    encoding: 'utf-8',  // 文件内容的编码方式，默认是 null，null 表示的是 buffer
    flags: 'r',  // 操作方式是只读
    highWaterMark: 3,  // 一次读取的数据量，单位是字节，默认是64k
});

readStream.on('readable', () => {
    console.log('begin');

    let ret = readStream.read(9);

    console.log('result', ret);

})



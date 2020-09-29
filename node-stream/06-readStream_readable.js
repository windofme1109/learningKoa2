const fs = require('fs');

const readStream = fs.createReadStream('./files/data.txt', {
    encoding: 'utf-8',  // 文件内容的编码方式，默认是 null，null 表示的是 buffer
    flags: 'r',  // 操作方式是只读
    highWaterMark: 3,  // 一次读取的数据量，单位是字节，默认是64k
});

readStream.on('readable', () => {
    console.log('begin');

    let ret;

    // 使用 read() 处理数据时， while 循环是必需的
    // 只有在 readable.read() 返回 null 之后，才会触发 readable 事件
    // 每一次循环完成，必须手动调用 read()，去获取缓冲区中的数据
    // 缓冲区中的数据被清空后，触发 readable 事件
    while (null !== (ret = readStream.read(1))) {
        console.log('result', ret);
    }


})



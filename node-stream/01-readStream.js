/**
 * Node中的流（Stream）
 *
 */

/**
 *
 * 读取流
 *
 */

const fs = require('fs');

// 以流的方式，读取一个文件
// 创建读取流，第一个参数是path，第二个参数是option，可以配置encoding等
// const readStream = fs.createReadStream('./files/data.txt', {encoding: 'utf-8'});
const readStream = fs.createReadStream('./files/data.txt', {
    encoding: 'utf-8',  // 文件内容的编码方式，默认是 null，null 表示的是 buffer
    flags: 'r',  // 操作方式是只读
    highWaterMark: 3,  // 一次读取的数据量，单位是字节，默认是64k
    autoClose: true,  // 读取完成是否自动关闭流
    start: 0,  // 读取的起始位置
    end: 9,  // 读取的结束位置，包括9这个位置
});

// 接收数据
let str = '';
// 记录总次数
let count = 0;

readStream.on('open', () => {
    console.log('open');
})

// 监听data事件，一块数据从源头（source）流向消费者，就会触发data事件
readStream.on('data', (chunk) => {
    console.log(chunk);
    str += chunk;
    count++;
})


// 监听error事件，在从流中获取数据时，发生异常时触发这个事件
readStream.on('error', function (error) {
    console.log(error);
})

// 监听end事件，当流中没有数据可以被消费的时候，就会触发这个事件
readStream.on('end', (chunk) => {
    // console.log(str);
    // console.log(count);
    console.log('end');
})

// 流或者底层资源文件关闭后，这里就是data.txt这个文件关闭后，触发close事件
readStream.on('close', function () {
    console.log('close');
})
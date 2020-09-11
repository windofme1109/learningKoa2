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
const readStream = fs.createReadStream('./files/data.txt', {encoding: 'utf-8'});

// 接收数据
let str = '';
// 记录总次数
let count = 0;

// 监听data事件，一块数据从源头（source）流向消费者，就会触发data事件
readStream.on('data', (chunk) => {
    str += chunk;
    count++;
})

// 监听end事件，当流中没有数据可以被消费的时候，就会触发这个事件
readStream.on('end', (chunk) => {
    // console.log(str);
    console.log(count);
})

// 监听error事件，在从流中获取数据时，发生异常时触发这个事件
readStream.on('error', function (error) {
    console.log(error);
})

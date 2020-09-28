/**
 * Node中的流（Stream）
 *
 */

/**
 *
 * 写入流
 *
 */
const fs = require('fs');
// 以流的方式，写入一个文件
// 创建一个写入流，第一个参数是path，第二个参数option，可以指定编码等
const writeStream = fs.createWriteStream('./files/output.txt', {
    encoding: 'utf-8',  // 默认是 utf-8
    flags: 'w',  // 文件操作方式是写入
    // mode: 0o666,  //
    autoClose: true,
    highWaterMark: 3,  // 默认是16k，单位是字节
    start: 0  // 起始位置
});

let content = '这是一个测试文件\n';
let str = '';

for (let i = 0; i < 10000; i++) {
    str += content;
}

// for (let i = 0; i < 4; i++) {
//     let flag = writeStream.write(i + '', function () {
//         console.log('数据被刷新了');
//     });
//     console.log(flag);
// }

let count = 0;
// 写入数据，write()方法将数据写入流中
// 第一个参数是要写入的数据，第二参数是编码，如果写入的数据是字符串，默认是utf-8
// 第三个参数是回调函数，当数据块被刷新（数据被处理或者数据全部写入流中）的时候被调用
writeStream.write(str, function () {
    console.log('数据被刷新了');
    count++;
});



writeStream.on('open', () => {
    console.log('open');
})

// 标记文件末尾
// 调用这个方法表示数据已经写入完毕（没有数据可以被写入到流中）
writeStream.end();

// finish事件，当end()方法被调用后，会触发finish事件
writeStream.on('finish', function () {
    console.log('写入完成');
    console.log(count);
})

// 流或者底层资源文件关闭后，这里就是output.txt这个文件关闭后，触发 close 事件
writeStream.on('close', function () {
    console.log('close');

})
writeStream.on('error', function (error) {
    console.log(error);

})


console.log('程序执行完毕');

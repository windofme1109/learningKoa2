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
    highWaterMark: 3,  // 默认是16看、，单位是字节
    start: 0  // 起始位置
});

let content = '这是一个测试文件\n';
let str = '';

let i = 8;

function write() {
    let flag = true;
    while (i > 0 && flag) {
        flag = writeStream.write(i + '', () => {});
        i--;
        console.log(flag);
    }

    if (i <= 0) {
        writeStream.end('ok');
    }
}

write();

// drain只有当缓存区充满后 ，并且被消费后触发
writeStream.on('drain', () => {
    console.log('drain');
    write();
})



writeStream.on('open', () => {
    console.log('open');
})
// finish事件，当end()方法被调用后，会触发finish事件
writeStream.on('finish', function () {
    console.log('写入完成');
    // console.log(count);
})

// 流或者底层资源文件关闭后，这里就是output.txt这个文件关闭后，触发 close 事件
writeStream.on('close', function () {
    console.log('close');

})
writeStream.on('error', function (error) {
    console.log(error);

})


// console.log('程序执行完毕');

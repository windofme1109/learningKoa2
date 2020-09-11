/**
 * Node中的流（Stream）
 *
 */

/**
 *
 * pipe
 * 一个Readable流可以和一个Writable流串起来，所有的数据自动从Readable流进入Writable流，这种操作叫pipe
 *
 * 可以使用pipe操作实现文件的复制
 */

const fs = require('fs');
// 创建一个可读流
// const readStream = fs.createReadStream('./files/0002.jpg');
const readStream = fs.createReadStream('./files/0001.jpg');

// 创建一个可写流
// const writeStream = fs.createWriteStream('./0002-copy.jpg');
const writeStream = fs.createWriteStream('./0001-copy.jpg');

// pipe()接收一个可写流作为参数
// 调用可读流的pipe()方法，数据自动从可读流中流入可写流中
// 实现可读流到可写流的转换
// pipe()的返回值是一个可写流（就是接收的参数，可读流的目的地）
// 如果返回值是双向流或者是转换流，可以实现pipe()方法的链式调用
readStream.pipe(writeStream);

// 默认情况下，当可读流结束（触发end事件）时，可写流会自动调用end()方法，此时可写流不会写入任何数据
// 如果不想自动调用end()方法，可以在pipe()方法中，配置第二个参数：{end: false}

readStream.on('end', function () {
    console.log('拷贝完成');
})
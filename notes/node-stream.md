## Node中的流（Streams）

### 1. 参考资料
- [Node.js Stream(流)](https://juejin.im/post/6844903583477923848)
- [Node.js 可读流和可写流](https://juejin.im/post/6844903588649500679)
- [Node.js 中的一股清流：理解 Stream（流）的基本概念](https://juejin.im/post/6844904014975500301)
- [你应该知道的Node.js流](https://juejin.im/post/6844903590859898887)
- [一文搞定 Node.js 流 （Stream）](https://juejin.im/post/6854573219060400141)
- [Stream | Node.js v12.18.4 Documentation](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html)
### 1. 流（Streams）的说明

1. 流（Streams），流指的是一组有方向的、有起点和终点的一种传输数据的方式。字符串、数组、二进制数据等，都可以以流的方式进行传输。

2. Node 中许多 API 都实现了流，如下图所示：

   ![](./img/node-stream.png)
   
3. 流的特点在于，不会一次性将所有的数据读入内存，而一块一块的读，一块一块的进行处理。这种处理方式，使得我们在处理大文件的时候，非常高效。
   
4. 所有的流都是 EventEmitter 的实例。他们在数据可读或者可写的时候发出事件。然而，我们也可以简单的通过 pipe() 方法来使用流数据。

### 2. 可读流（Readable Streams）

1. 可读流分为两种模式：

   - `flowing` 模式：可读流自动(不断的) 从底层读取数据（直到读取完毕），并通过 `EventEmitter` 接口的事件尽快将数据提供给应用
   
   - `paused` 模式：必须显示调用 `stream.read()` 方法来从流中读取数据片段

2. `flowing` 模式

   - 所有初始工作模式为 `paused` 的可读流，可以通过下面三种途径切换到 `flowing` 模式
     - 监听 `data` 事件
     - 调用 `stream.resume()` 
     - 调用 `strean.pipe()` 将数据发送到Writable

   - 从流中读取数据：
   
     ```javascript
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
        
        // 流或者底层资源文件关闭后，这里就是1.txt这个文件关闭后，触发close事件
        readStream.on('close', function () {
            console.log('close');
        })
     ```
   - 输出：
     ```javascript
        open
        123
        456
        789
        0
        end
        close
     ```
     
     1. `createReadStream()` 创建可读流实例，会打开文件，触发 open 事件（并不是创建每个流都会触发 open 事件），不会将文件中的内容输出（因为处于‘暂停模式’，没有事件消费）。此时将数据存储到缓冲器 buffer 中，buffer 的大小取决于  highWaterMark 设置的值，当读取的数据量达到 highWaterMark 设定的阈值时，流就会暂停从底层资源中读取数据，直到 buffer 中的数据被消费。
     
     2. 一块数据从源头（source）流向消费者，就会触发data事件。readStream 可以理解为消费者，当消费者监听 data 事件，可读流从暂停模式切换到flowing模式，不断向消费者提供数据，直到文件中的数据被读取完毕。
    
     3. 当我们监听 data 事件时，数据会源源不断从缓冲区中被读取出来。回调函数接收的参数就是每一读取的数据。可读流每次读取 highWaterMark 个数据，交给消费者，所以先打印123，再打印456 ... ...
     
     4. 当读完文件，也就是数据被完全消费后，触发end事件
     
     5. 流或者底层资源文件关闭后，这里就是data.txt 这个文件关闭后，触发 close 事件
     
     6. error 事件通常会在底层系统内部出错从而不能产生数据，或当流的实现试图传递错误数据时发生。

 
     
### 4. 可写流（Writable Streams）

### 4. 管道（Pipe）

### 5. 双向流（Duplex Streams）

### 6. 转换流（Transform Streams）

### 7. 操作流的常见 API
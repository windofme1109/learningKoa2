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
        
        // 流或者底层资源文件关闭后，这里就是 data.txt 这个文件关闭后，触发 close 事件
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

3. 模式切换
   - 调用 pause() 由 flowing 切换到 pause 模式，用 resume() 方法进行恢复为 flowing 模式。
   - 示例：
     ```javascript
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
        
        setTimeout(() => {
            readStream.resume();
        }, 1000); 
        
        readStream.on('end', () => {
            console.log('end');
        })
     ``` 
     输出：
     ```javascript
        open
        123
        456
     ```
     1. 监听 data 事件，可读流处于flowing 状态，在回调函数内部，调用了 pause() 方法，然后 暂停 data 事件的触发，此时为 pause 模式。
     
     2. 设置了一个定时器，定时器的处理函数内部调用 resume() 方法，可以恢复 data 事件的触发，由 pause 模式切换到 flowing 模式。
     
     3. 1s 后，切换流到flowing模式，data事件触发，但又遇到pause(),所以暂停了输出，此时并没有resume()方法来进行模式的转换，所以只打印到6。
     4. 可读流中还有数据未被消费，但是此时是 pause 状态，所以，不会调用 end() 方法。
     
     **注意**: 如果可读流切换到 flowing 模式，且没有消费者处理流中的数据，这些数据将会丢失。 比如， 调用了可读流的 resume() 方法却没有监听 data 事件，或是取消了 data 事件监听，就有可能出现这种情况。

4. readable  
   - readable 事件将在流中有数据可供读取时触发
   
   - 当我们创建可读流时，就会先把缓存区填满（highWaterMark为指定的单次缓存区大小），等待消费
   
   - 如果缓存区被清空（消费）后，会触发 readable 事件
   
   - 当到达流数据尾部时，readable 事件也会触发，触发顺序在end事件之前
   -  如果同时监听 readable 和 data，则优先触发 readable 事件。 只有在调用 read() 时才会触发 data 事件。
   - 示例代码：
     ```javascript
        const fs = require('fs');
        
        const readStream = fs.createReadStream('./files/data.txt', {
            encoding: 'utf-8',  // 文件内容的编码方式，默认是 null，null 表示的是 buffer
            flags: 'r',  // 操作方式是只读
            highWaterMark: 2,  // 一次读取的数据量，单位是字节，默认是64k
        });
        
        readStream.on('readable', () => {
            console.log('begin');    
            let ret = readStream.read(2); 
            console.log('result', ret);
        })
     ```
     输出：
     ```javascript
        begin
        result 12
        begin
        result 34
        begin
        result 56
        begin
        result 78
        begin
        result 90
        begin
        result null
     ```

5. read(size)
   - 该方法从内部缓冲区中收取并返回一些数据,如果没有可读数据，返回null
   - size 是可选的，指定要读取 size 个字节，如果没有指定，内部缓冲区所包含的所有数据将返回
   - 如果 size 字节不可读，返回 null，如果此时流没有结束(除非流已经结束)，会将所有保留在内部缓冲区的数据将被返回。比如：文件中有 1 个可读字节，但是指定size 为 2，这时调用 read(2) 会返回 null,如果流没有结束，那么会再次触发 readable 事件，将已经读到内部缓冲区中的那一个字节也返回。
   - read() 方法只应该在 pause 模式下的可读流上运行，在流动模式下，read会自动调用，直到内部缓冲区数据完全耗尽。
   
6. **一般来说，我们不使用 readable 事件和read() 方法，使用pipe()或 data 事件代替**。
 
### 4. 可写流（Writable Streams）

1. 可写流是对数据写入目的地（destination）的一种抽象。

2. 基本用法：
   ```javascript
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
      
      for (let i = 0; i < 4; i++) {
          let flag = writeStream.write(i + '');
      
          console.log(flag);
      }
      // 标记文件末尾
      // 调用这个方法表示数据已经写入完毕（没有数据可以被写入到流中）
      writeStream.end('ok');
      
      writeStream.on('open', () => {
          console.log('open');
      })
      // finish事件，当end()方法被调用后，会触发finish事件
      writeStream.on('finish', function () {
          console.log('finish');
      })
      
      writeStream.on('error', function (error) {
          console.log(error);
      
      })
   ```
   输出：
   ```javascript
      true
      true
      false
      false
      open
      finish
   ```
   说明：
   1. output.txt 中的内容是：0123ok
   
   2. createWriteStream() 创建一个可写流，会默认会打开文件，但是不会触发 open 事件。
   
   3. 可写流通过反复调用 write(chunk) 方法将数据写入内部缓冲器。写入的数据 chunk 必须是字符串或者buffer。  
   write()是个异步方法，但有返回值。这个返回值 flag 的含义表示能否继续写入，而不是文件是否写入。  
   缓冲器总大小 < highWaterMark 时，可以继续写入，flag为true； 一旦内部缓冲器大小达到或超过highWaterMark，flag返回false。  
   **注意**，即使 flag 为 false，写入的内容也不会丢失。此时向流中写入数据的操作会停止，直到触发 drain 事件后，写入过程才会恢复。
   
   4. 我们在创建可读流的过程中指定的 highWaterMark 是 3，调用 write() 时一次写入了一个字节，写入的多少由传入 wrire() 的数据决定。当调用第三次 write() 方法时，缓冲器中的数据大小达到 3 这个阈值，开始返回 false，所以先打印了两次 true，后打印了两次 false。
   
   5. end('ok'); end() 方法用来标记文件末尾，表示接下来没有数据要写入可写流；  
   可以传入可选的 chunk 和 encoding 参数，在关闭流之前再写入一段数据；  
   如果传入了可选的 callback 函数，它将作为 finish 事件的回调函数。所以 'ok' 会被写入文件末尾。  
   **注意**，write() 方法必须在 end() 方法之前调用。
   
   6. 在调用了 end() 方法，且缓冲区数据都已经传给底层系统（全部写入output.txt）之后， finish 事件将被触发。
   
   7. close 事件将在流或其底层资源（比如一个文件）关闭后触发。close 事件触发后，该流将不会再触发任何事件。  
      **注意**：不是所有 可写流/可读流 都会触发 close 事件。

3. 写入流的第二种用法——一次写入大量数据：
   ```javascript
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
      let count = 0;
      // 写入数据，write()方法将数据写入流中
      // 第一个参数是要写入的数据，第二参数是编码，如果写入的数据是字符串，默认是utf-8
      // 第三个参数是回调函数，当数据块被刷新（数据被处理或者数据全部写入流中）的时候被调用
      writeStream.write(str, function () {
          console.log('数据被刷新了');
          count++;
      });
      
      // 标记文件末尾
      // 调用这个方法表示数据已经写入完毕（没有数据可以被写入到流中）
      writeStream.end();
      
      writeStream.on('open', () => {
          console.log('open');
      })
      // finish事件，当end()方法被调用后，会触发finish事件
      writeStream.on('finish', function () {
          console.log('写入完成');
          console.log(count);
      })
      
      writeStream.on('error', function (error) {
          console.log(error);
      
      })
      
      
      console.log('程序执行完毕');
   ```
   输出：
   ```javascript
      程序执行完毕
      open
      数据被刷新了
      写入完成
      1
   ```
   可写流的执行过程是异步过程，调用write()方法，将数据全部写入缓冲区中，由于write() 方法的回调函数是数据块被刷新（数据被处理或者数据全部写入流中）后才会被调用，所以此时不会调用这个回调函数。也不会触发其他事件，因此会最先输出 `程序执行完毕`。  
   文件被打开，触发 open 事件，将数据写入文件中，缓冲区被刷新，调用write()的回调函数，所以会输出 `数据被刷新了`。数据写入完成后，调用 end() 方法，最后触发 finish 事件。
4. drain 事件

   - 如果调用 write(chunk) 方法返回 false，drain 事件会在适合恢复写入数据到流的时候触发。
   
   - drain 事件触发条件：
     - 缓冲器满了，即 write() 方法返回 false。
     - 缓冲器的数据都写入到流，即数据都被消费掉后，才会触发
   
   - drain 事件触发示例：
     ```javascript
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
        });
     
        writeStream.on('open', () => {
            console.log('open');
        })
        // finish事件，当end()方法被调用后，会触发finish事件
        writeStream.on('finish', function () {
            console.log('写入完成');
            // console.log(count);
        })
     
        writeStream.on('close', function () {
            console.log('close');
        
        })
     
        writeStream.on('error', function (error) {
            console.log(error);
        
        })
     ```
   - 输出：
     ```javascript
        true
        true
        false
        open
        drain
        true
        true
        false
        drain
        true
        true
        写入完成
        close
     ```
   - output.txt 内容是：87654321ok
   - 设置的缓冲区的大小为3，所以当写入第三个数据的时候，write() 返回 false，此时while 循环停止，等待，然后可写流将缓冲区内数据全部写入文件中，先触发 open 事件（open 事件只触发一次），再会触发 drain 事件，然后继续调用 write()，一直重复上述过程，直到 i 为 1，停止写入，此时调用 end()，在文件末尾写入 ok，触发 finish 事件。最后关闭文件，触发 close 事件。
 
### 4. 管道（Pipe）

1. 管道提供了一个输出流到输入流的机制。通常我们用于从一个流中获取数据并将数据传递到另外一个流中。

2. 类似于现实中的管道，将液体从源（source）传送到目的地（destination）。Node 中的 Pipe 作用也是将一个流从源传输搭配目的地。比如说可读流传递到可写流。

3. 一个可读流可以和一个可写流串起来，所有的数据自动从可读流进入可写流，这种操作叫 Pipe。

4. Pipe 操作可以组合，形成链式调用。

5. Pipe 操作示意——复制文件：
   ```javascript
      const fs = require('fs');
      // 创建一个可读流
      const readStream = fs.createReadStream('./files/0001.jpg');
      
      // 创建一个可写流
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
      });
   ```


### 5. 双向流（Duplex Streams）

### 6. 转换流（Transform Streams）

### 7. 操作流的常见 API

1. File Sysyem
   - 创建流：
     - fs.createReadStream()
     - fs.createWriteStream()
   - 可读流
     1. 事件
     2.
   
   - 可写流
   - 管道
   
2. Stream

### 8. 疑问
1. 对于 pause 模式下，调用可读流的read(size) 方法，有一点问题，就是size 和 highWaterMark 的关系，按照这篇博客：[Node.js Stream(流)](https://juejin.im/post/6844903583477923848) 说的试了试，但是没有得到预想的结果，因此对这篇博客的这部分内容的准确性持怀疑态度，后面在找一找资料深入了解一下这个问题。

- 示例：
     ```javascript
        const fs = require('fs');
        
        const readStream = fs.createReadStream('./files/data.txt', {
            encoding: 'utf-8',  // 文件内容的编码方式，默认是 null，null 表示的是 buffer
            flags: 'r',  // 操作方式是只读
            highWaterMark: 2,  // 一次读取的数据量，单位是字节，默认是64k
        });
        
        readStream.on('readable', () => {
            console.log('begin');
        
            let ret = readStream.read(2);
        
            console.log('result', ret);
        })
     ```
     1. data.txt 中的内容只有a，输出是：
        ```javascript
        begin
        result null
        begin
        result a
        ```
        缓冲区的大小是2,但文件只有 a，所以只有1个字节在缓存区，而size指定了2，2个字节被认为是不可读的，返回null；而此时流还没有结束，再次触发readable，将缓存区内容全部返回。
     2. data.txt中的内容是ab，输出是：
        ```javascript
        begin
        result ab
        begin
        result null
        ```
        缓冲区大小是2，文件内容是 ab，所以缓冲区会被填满。而 size 为 2，所以将 ab 全部读取。缓冲区清空——>继续写入数据，发现到文件末尾，于是触发readable，此时缓冲区没有任何数据，所以返回null。
     3. data.txt中的内容是abc，输出是：
        ```javascript
        begin
        result ab
        begin
        result null
        begin
        result c
        ```
        缓冲区大小是2，文件内容是 abc，所以缓冲区会被填满。而 size 为 2，所以将 ab 全部读取。缓冲区清空——>继续写入数据，将 c 写入缓冲区，继续触发readable，有 size 为 2， 所以被认为是不可读的，返回null，由于流未结束，继续触发 readable 事件，将缓存区内容全部返回。
     
     4. data.txt中的内容是abcd，输出是：
        ```javascript
        begin
        result ab
        begin
        result cd
        begin
        result null
        ```
        缓冲区大小是2，文件内容是 abcd，所以缓冲区会被填满。而 size 为 2，所以将 ab 全部读取。缓冲区继续写入数据，将 cd 写入缓冲区，继续触发readable，由于 size 为 2， 所以继续读取，返回 cd。继续向缓冲区写入数据，发现到了文件末尾，于是触发 readable 事件，返回 null。
 
6. 在某些情况下，为 readable 事件添加回调将会导致一些数据被读取到内部缓存中
   - 当消费数据大小 < 缓冲区大小，可读流会自动添加 highWaterMark 个数据到缓存，那么新添加的数据和之前缓冲区中未被消费的数据加一起，有可能超过了highWaterMark 大小，即缓冲区大小增加了。
   - 示例代码（将 highWaterMark 改为 3，size 改为 1）：
     ```javascript
        const fs = require('fs');
        
        const readStream = fs.createReadStream('./files/data.txt', {
            encoding: 'utf-8',  // 文件内容的编码方式，默认是 null，null 表示的是 buffer
            // flags: 'r',  // 操作方式是只读
            highWaterMark: 3,  // 一次读取的数据量，单位是字节，默认是64k
        });
        
        readStream.on('readable', () => {
            console.log('begin');  
            let ret = readStream.read(1);  
            console.log('result', ret); 
        })
     ```
     1. 当文件内容为a时， 输出：
        ```javascript
           begin
           result a
           begin
           result null
        ```
        说明：缓存中只有a，也只读了一个（read(1)），消费后，缓存区清空，再去读取时，已经到了文件末尾，返回null。
      2. 当文件内容为 ab 时，输出：
         ```javascript
            begin
            result a
            begin
            result b
         ```
         缓存中有 ab，当读完 a 后，继续向缓冲中添加数，发现到了文件末尾，触发 readable，而此时缓冲区中还有 b，因此将b返回。
      3. 当文件内容为 abc 时，输出：
         ```javascript
            begin
            result a
            begin
            result b
         ```
      4. 当文件内容为 abcd 时，输出：
         ```javascript
            begin
            result a
            begin
            result b
            begin
            result c
         ```
      5. 当文件内容为 abcde 时，输出：
         ```javascript
            begin
            result a
            begin
            result b
         ```
         **3 - 5 这三种情况不明白，也没有理解为什么没有读取全部的内容**。可能需要深入了解一下流的工作过程。

7. 当读取个数 size > 缓冲区大小，会去更改缓存区的大小 highWaterMark（规则为找满足大于等于 size 的最小的2的几次方）
   1. 示例代码：
      ```javascript
        const fs = require('fs');
        
        const readStream = fs.createReadStream('./files/data.txt', {
            encoding: 'utf-8',  // 文件内容的编码方式，默认是 null，null 表示的是 buffer
            flags: 'r',  // 操作方式是只读
            highWaterMark: 3,  // 一次读取的数据量，单位是字节，默认是64k
        });
        
        readStream.on('readable', () => {
            console.log('begin');    
            let ret = readStream.read(4);   
            console.log('result', ret);  
        })
      ```
   2. 当文件内容是 abcd 时，输出是：
      ```javascript
        begin
        result null
        begin
        result abcd
        begin
        result null
      ```
      size > 缓冲区大小，被认为是不可读取的，所以返回 null，此时会重新计算 highWaterMark 大小，离4最近的是2的2次方，为4，所以highWaterMark此时等于4，所以会输出 abcd，继续向缓冲区添加数据，发现已经达到文件末尾，继续触发 readable 事件，最终输出null。
   3. 当文件内容是 abcdefg 时，输出是：
      ```javascript
         begin
         result null
         begin
         result abcd
         begin
         result efg
      ```
      size > 缓冲区大小，被认为是不可读取的，所以返回 null，此时会重新计算 highWaterMark 大小，离4最近的是2的2次方，为4，所以highWaterMark此时等于4，所以会输出 abcd，继续向缓冲区添加4个数据，发现已经达到文件末尾，于是触发 readable 事件，将缓冲区内的数据全部输出。
   4. 我们将 size 改为 9，当文件内容为 abcdefghi 时，输出如下：
      ```javascript
         begin
         result null
         begin
         result abcdefghi
         begin
         result null
      ```
      按照前面的说法，缓冲区大小应该被修改为 8，第一次输出 null 好理解，因为缓冲区小于 size，但是，第二，缓冲区大小现在是 8，内容是：abcdefgh，那么输出 应该是 abcdefgh，而不是全部输出。
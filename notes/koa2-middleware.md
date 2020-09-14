<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [KOA2中间件的原理及其实现](#koa2%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%9A%84%E5%8E%9F%E7%90%86%E5%8F%8A%E5%85%B6%E5%AE%9E%E7%8E%B0)
  - [1. 中间件的使用](#1-%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8)
  - [2. 中间件的调用顺序](#2-%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%9A%84%E8%B0%83%E7%94%A8%E9%A1%BA%E5%BA%8F)
  - [3. 中间件分析](#3-%E4%B8%AD%E9%97%B4%E4%BB%B6%E5%88%86%E6%9E%90)
  - [4. 代码实现](#4-%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## KOA2中间件的原理及其实现

### 1. 中间件的使用

1. 通过`app.use(function)`调用。将给定的中间件方法添加到此应用程序中。在Koa2中，use()不接收path参数，所以只要发起请求，就会调用这个中间件。

2. 在Koa2中，中间件全部通过app.use()挂载到app上。不在路由处理中添加中间件，因为在Koa2中，路由本身就是中间件。

### 2. 中间件的调用顺序

1. 在Koa2中，路由是按照洋葱圈模式调用。不是按照先后顺序进行调用。如下图所示：  

   ![](./img/koa2-middleware.png)

2. Koa2中，中间件按照顺序执行。

3. 在中间件执行的过程中，遇到next()，就暂停执行当前的这个中间件，转而去执行下一个中间件。

4. 最后一个中间件或者是路由处理函数执行完成，就会返回上一个中间件，继续执行next()后面的代码。以此类推，只要当前中间件全部执行完成，就返回上一个中间件，执行next()后面的代码。如果当前中间件没有next()，则不再继续调用下一个中间件。

5. 具体过程如下图所示：

   ![](./img/koa2-call_middleware.png)

### 3. 中间件分析

1. app.use() 用来注册中间件，并收集起来
   - 通过 app.use() 注册一个中间件。那么这些中间件会按照顺序被收集起来，等待被调用。

2. 实现 next 机制，通过 next 触发下一个
   - 在 Koa2 中，使用 await 语法，调用 next()。即 `await next()`。

3. 与 Express 不同的是：Koa2 的中间件不涉及到 method 和 path 的判断。

4. 无论我们有没有使用 async 定义中间件，中间件函数必须返回 Promise 对象。这是因为我们在中间件的内部会使用 `await` 语法，而 `await` 等待的就是异步的 Promise 操作的结果。如果我们的中间件不是返回 Promise 对象，那么在使用 await 语法，调用next()过程中，就会出错。

5. 中间件在调用过程中，实际上中间件套中间件的过程。这样才能实现洋葱圈模式。

### 4. 代码实现

1. 引入 node 原生的 http 模块，用来实现 http 服务。
   ```javascript
      const http = require('http');
   ```

2. 定义一个类，这个类用来实现 Koa2 的基本功能。包括use()、listen() 等方法。
   ```javascript
      class LikeKoa2 {
      constructor() {  
          this.middlewareList = [];
      }
   }
   ```  
   `this.middlewareList` 用来存放中间件函数。

3.  在 LikeKoa2 类中，定义 use()、Listen() 函数。
    ```javascript
       use(fn) {
           this.middlewareList.push(fn);
       }
    
       listen(...args) {
           const server = http.createServer(this.callback());
           server.listen(...args);
       }
    ```
    通过原生的 http 模块的 createServer() 方法创建http服务，并使用原生的 listen() 方法，监听端口。因为 listen() 方法接收的参数不确定，所以这里使用 rest 参数形式。  
    
    createServer() 接收一个回调函数，并向这个回调函数传入req和res这两个参数。
    
4. 在 LikeKoa2 类中，定义 callback()、createContext()函数。
   ```javascript
      callback() {
          const fn = compose(this.middlewareList);
          return (req, res) => {
              const ctx = this.createContext(req, res);
              fn(ctx);
          }
      }
   
      createContext() {
          return {req, res};
      }
   ```
    在 callback() 中，最重要的事情是执行中间件函数。要顺利执行中间件，要做两件事：生成ctx（上下文）和组合中间件，使其能够按照洋葱圈模式进行调用。
        
    createContext() 就是用来生成ctx对象，这我们简单的包裹了req和res。实际上，ctx对象还有许多其他属性和方法，为了简化操作，我们这里不再添加。
      
    组合中间件，我们单独使用一个函数 compose() 进行组合。

5. 在 LikeKoa2 类的外部，定义compose()函数。
   ```javascript
      function compose(middlewareList) {
          return (ctx) => {
              function dispatch(index) {
                  const fn = middlewareList[index];
                  try {
                      return Promise.resolve(
                          fn(ctx, dispatch.bind(null, index + 1))
                      );
                  } catch (err) {
                      return Promise.reject(err);
                  }
              }
   
              return dispatch(0);
          }
      }
   ```
   compose() 接收的是 middlewareList ，也就是中间件列表。然后返回一个函数，我们在这个函数内部去执行中间件，因此它接收一个 ctx 参数，而 next 参数可以通过对middlewareList进行操作获取到。    
   
   首先要执行第一个中间件函数：`return dispatch(0);` 目的是启动中间件，并建立当前中间件和下一个中间件的一个联系。
   
   dispatch() 真正实现对中间件的调用以及next机制。它接收一个index参数，这个参数表示索引，即第几个中间件。函数的执行过程是：
   - 首先按照索引，取出中间件：`const fn = middlewareList[index];`。
   - 执行中间件：
     ```javascript
        try {
                 return Promise.resolve(
                     fn(ctx, dispatch.bind(null, index + 1))
                 );
             } catch (err) {
                 return Promise.reject(err);
             }
     ```
     中间件函数可以是 async 函数，也可以不是。无论是不是 async 函数，中间件内部必须可以使用 await。所以这里使用 Promise.resolve() 包装函数的执行结果，使其成为一个Promise对象。这样，无论我们有没有使用async函数，都可以获得一个Promise对象，使得我们后续可以使用await语法，调用next()。  
   
     bind() 方法用于将函数体内的this绑定到某个对象，然后返回一个新函数。bind() 方法的第一个参数是要绑定的this对象，第二个以及后面的参数是调用 bind() 的函数接收的参数。  
   
     dispatch() 内部没有 this ，同时将 bind() 方法的第一个参数设置为 null，同时还设置了第二个参数（index + 1），这个参数（index + 1）绑定原函数的参数，也就是预传参这样就实现了从中间件列表中依次取出每一个中间件。
     
     bind() 返回一个 dispatch() 的一个拷贝，同时预先传入了参数。因为 fn() 是中间件函数，fn() 的第二个参数形式上是 next，实际上传入的是 dispatch.bind(null, index + 1) 也就是：next 指向了 dispatch.bind(null, index + 1)，当我们调用 next()，实际上就是调用 dispatch() 的一个拷贝。index + 1 使得我们可以获取下一个中间件，从而实现了对下一个中间件的调用。  
   
     使用try...catch，可以用来捕获执行异步操作过程中出现的异常。成功状态调用 resolve()，失败调用 reject()。 
     
     await等待的是Promise操作的结果。实际上就是 `fn(ctx, dispatch.bind(null, index + 1))` 的执行结果。

6. 向外部暴露LikeKoa2这个类。
   ```javascript
      module.exports = LikeKoa2;
   ```
 
7. 完整的代码：
   ```javascript
      const http = require('http');
      
      function compose(middlewareList) {
      
          return (ctx) => {
              function dispatch(index) {
                  const fn = middlewareList[index];
                  try {
                      return Promise.resolve(
                          fn(ctx, dispatch.bind(null, index + 1))
                      );
                  } catch (err) {
                      return Promise.reject(err);
                  }
              }
      
              return dispatch(0);
          }
      }
      
      class LikeKoa2 {
          middlewareList = [];
      
          use(fn) {
              this.middlewareList.push(fn);
          }
      
          createContext(req, res) {
              return {req, res};
          }
      
          callback() {
              const fn = compose(this.middlewareList);
              return (req, res) => {
                  const ctx = this.createContext(req, res);
                  fn(ctx);
              }
      
          }
      
          listen(...args) {
              const server = http.createServer(this.callback());
              server.listen(...args);
          }
      }
      
      module.exports = LikeKoa2;
   ``` 

8. 测试代码
   ```javascript
      const Koa = require('./koa2/like-koa2_self');
      
      const app = new Koa();
      
      app.use(async (ctx, next) => {
          await next();
          const rt = ctx['X-Response-Time'];
          console.log(`${ctx.req.method} ${ctx.req.url} - ${rt}ms`);
      })
      
      app.use(async (ctx, next) => {
          const start = Date.now();
          await next();
          ctx['X-Response-Time'] = Date.now() - start;
      })
      
      app.use(async (ctx, next) => {
          ctx.res.end('hello world');
      })
   ```
   
9. 测试
   - 在浏览器中输入：`localhost:8080`，控制台输出：
     ```javascript
        GET / - 3ms
        GET /favicon.ico - 1ms
     ```
     简单的实现了中间件的功能

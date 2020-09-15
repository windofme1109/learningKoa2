<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Express中间件的原理及其实现](#express%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%9A%84%E5%8E%9F%E7%90%86%E5%8F%8A%E5%85%B6%E5%AE%9E%E7%8E%B0)
  - [1. 中间件的使用](#1-%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8)
  - [2. 中间件的调用顺序](#2-%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%9A%84%E8%B0%83%E7%94%A8%E9%A1%BA%E5%BA%8F)
  - [3. 中间件分析](#3-%E4%B8%AD%E9%97%B4%E4%BB%B6%E5%88%86%E6%9E%90)
  - [4. 代码实现](#4-%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Express中间件的原理及其实现

### 1. 中间件的使用

1. 通过`app.use([path], function)`调用。path参数可选，如果没有path，就对所以的请求path应用这个中间件。

2. 在路由处理中使用。`router.METHOD(path, [callback, ...] callback)`。最后一个回调是处理函数。中间的回调函数就是中间件，以从左向右，依次进行调用。

### 2. 中间件的调用顺序

- express中，中间件是按照先后顺序进行调用。即从上到下，依次调用。

- 前一个中间件执行完成，再使用 next 调用下一个中间件。

### 3. 中间件分析

1. app.use()用来注册中间件，先收集起来
   - 通过app.use()注册一个中间件。那么这些中间件会按照顺序被收集起来，等待被调用。

2. 遇到http请求，根据path和method判断触发哪些

3. 实现next机制，上一个中间件通过next触发下一个

### 4. 代码实现

1. 引入 node 原生的 http 模块，用来实现 http 服务。
   ```javascript
      const http = require('http');
   ```

2. 定义一个类，这个类用来实现 Express 的基本功能。包括use()、get()、post()、listen() 等方法。
   ```javascript
      class LikeExpress {
          routes = {
              all: [],
              get: [],
              post: [],
          }
          
      }
   ```
   `all` 接收 use() 注册的 path 和路由  
   
   `get` 接收 get() 注册的 path 和路由  
   
   `post` 接收 post() 注册的 path 和路由  
   
   path 与中间件是一一对应的
   
3. 对外暴露这个类
   ```javascript
      module.exports = () => {
          return new LikeExpress();
      }
   ```
   这里使用工厂函数的模式。这样外界在引用这个模块的时候，获得的就是 LikeExpress 的实例。

4. 定义 use()、get()、post()等方法
   ```javascript
      use() {
          const info = this.register(...arguments);
          this.routes.all.push(info);
      }
   
      get() {
          const info = this.register(...arguments);
          this.routes.get.push(info);
      }
      
      post() {
          const info = this.register(...arguments);
          this.routes.post.push(info);
      }
   ```
   use()、get()、post() 逻辑类似，都是将接收的 path 和中间件函数注册到routes 对象中。这个注册的过程通过 register() 完成。 
    
   `info` 存放的是path以及与之对应的中间件。然后将 `info` 放入routes对象中与方法对应的属性中。
   
5. 定义 register() 方法
   ```javascript
      register(path) {
          const info = {};
          if (typeof path === 'string') {
              info.path = path;
              info.stack = Array.prototype.slice.call(arguments, 1);
          } else {
              info.path = '/';
              info.stack = Array.prototype.slice.call(arguments, 0);
          }
   
          return info;
      }
   ```
   register() 方法主要是将 path 和 path 对应的中间件组合到一起，使之形成一一对应的关系。
   `path` 表示use()、get()等方法接收的第一个参数，对于use()而言，第一个参数可以是 `path`（路径），也可以是中间件，而get()的第一个参数是 `path`（路径）。所以首先判断 `path` 是不是路径，如果是路径，将其存放到 `info` 对象的 `path` 中。使用 `arguments` 获得所有的参数，由于 `arguments` 是类数组对象，我们使用数组的 slice() 结合 call() 将 `arguments` 转换为数组。而 `arguments` 的第一个元素是路径，中间件从第二个元素开始。所以，我们从对于 `arguments` 的切片操作，从第二个元素开始。  
   
   如果 `path` 不是路径，说明从第一个参数开始就是中间件函数，所以我们要将 `info` 对象的 `path` 设置为根路径 —— `/`，将整个 `arguments` 转换为数组。
   
6. 定义 listen() 方法
   ```javascript
      listen(...args) {
          const server = http.createServer(this.callback());
          server.listen(...args);
      }
   ```
   通过原生的 http 模块的 createServer() 方法创建http服务，并使用原生的 listen() 方法，监听端口。因为 listen() 方法接收的参数不确定，所以这里使用 rest 参数形式。  
   
   Express的listen()方法可以接收回调函数。
      
   createServer() 接收一个回调函数，并向这个回调函数传入req和res这两个参数。
7. 定义 callback() 方法
   ```javascript
      callback() {
          return (req, res) => {
             res.json = (data) => {
                 res.end(
                     JSON.stringify(data)
                 )
             }
   
             const url = req.url;
             const method = req.method;
             
             const resultList = this.match(url, method);
             
             this.handle(req, res, resultList);
          }
   }
   ```
   在 callback()的返回值是一个函数，目的是绑定this到当前的实例中。在整个匿名函数内部，定义真正的执行流程。  
   
   匿名函数接收两个参数：req 和 res。首先给 res 对象添加一个json()方法。这是因为原生的 res 对象没有整个方法。接着从req对象中取出本次请求的 url 和 method。使用 match()，根据 url 和 method 得到中间件列表，最后调用 handle() 来执行中间件。

8. 定义 match() 方法
   ```javascript
      match(url, method) {
          let stack = [];
          if (url === '/favicon.ico') {
              return stack;
          }  
   
          stack = stack.concat(this.routes.all);
          stack = stack.concat(this.routes[method]);
          
          let middlewareList = [];
          stack.forEach(item => {
              if (url.indexOf(item.path) !== -1) {
                  middlewareList = middlewareList.concat(item.stack);
              }
          })
   
          return middlewareList;
      }
   ```
   如果请求url是：`/favicon.ico`，返回一个空列表，这个 url 请求的是一个标签页的图标。stack 用来存放与 method 匹配的路由信息，从routes对象中获取。因为 all 属性存放的是 use() 接收的中间件，所以要无条件的放入stack中。  
   
   接下来遍历stack数组，寻找同 url 匹配的中间件。以 `/api/get-cookie` 这个 url 为例，同 url 匹配的 path 有三种情况：
   - `/`  根路径
   - `/api`  上一级路径
   - `/api/get-cookie`  完全匹配  
   
   这是路由的匹配规则，所以这里需要使用 indexOf() 方法进行判断，而不是使用 `===`  
   
   最后将符合条件的中间件放入 middlewareList 中。因为存放中间件的形式是数组，所以使用 concat() 将两个数组连接起来，得到一个新的数组。
   
9. 定义 handle() 方法
   ```javascript
      handle(req, res, middlewareList) {
          const next = () => {
              const fn = middlewareList.shift();
              if (fn) {
                  fn(req, res, next);
              } 
          }
          
          next();
      }
   ```
   handle() 方法用于按照顺序执行中间件。handle() 接收 req、res 和 middlewareList 这三个参数。其中 req 和 res 对象传递给中间件函数。  
   
   接下来定义一个 next() 函数，next() 函数从中间件列表中，依次取出中间件并执行。向中间件传入三个参数：req、res和next，其中 next 就是我们定义的 next() 函数。也就是对自身的一个引用。这样就实现了中间件的顺序调用。
      
   定义完 next() 以后，立即执行。这样可以保证第一个中间件一定会被调用（再存在的情况下）。

10. 完整代码
    ```javascript
       const http = require('http');
       
       class LikeExpress {
           routes = {
               all: [],
               get: [],
               post: []
           }
       
           register(path) {
               const info = {};
               if (typeof path === 'string') {
                   info.path = path;
                   info.stack = Array.prototype.slice.call(arguments, 1);
               } else {
                   info.path = '/';
                   info.stack = Array.prototype.slice.call(arguments, 0);
               }
       
               return info;
           }
       
           use() {
               const middlewareInfo = this.register(...arguments);
               this.routes.all.push(middlewareInfo);
           }
           get() {
               const middlewareInfo = this.register(...arguments);
               this.routes.get.push(middlewareInfo);
           }
           post() {
               const middlewareInfo = this.register(...arguments);
               this.routes.post.push(middlewareInfo);
           }
           match(url, method) {
       
               let stack = [];
               if (url === '/favicon.ico') {
                   return stack;
               }
       
               stack = stack.concat(this.routes.all, this.routes[method]);
               let middlewareList = [];
               stack.forEach(item => {
                   if (url.includes(item.path)) {
                       middlewareList = middlewareList.concat(item.stack);
                   }
               })
       
               return middlewareList;
       
           }
       
           handle(req, res, middlewareList) {
               const next = () => {
                   const fn = middlewareList.shift();
       
                   if(fn) {
                       fn(req, res, next);
                   }
               }
       
               next();
           }
       
           callback() {
       
               return (req, res) => {
                   res.json = (data) => {
                       res.setHeader('Content-type', 'application/json');
                       res.end(JSON.stringify(data));
                   }
       
                   const url = req.url;
       
                   const method = req.method.toLowerCase();
                   const middlewareList = this.match(url, method);
       
                   this.handle(req, res, middlewareList);
               }
           }
       
           listen(...args) {
               const server = http.createServer(this.callback());
       
               server.listen(...args);
           }
       }
       
       module.exports = () => {
           return new LikeExpress();
       }
    ```

11. 测试代码：
    ```javascript
       const express = require('./express/like-express');
       
       const app = express();
       // 测试
       
       app.use((req, res, next) => {
           console.log('请求开始!');
           next()
       })
       
       app.use((req, res, next) => {
           // 假设在处理cookie
           console.log('处理Cookie！');
           req.cookie = {
               userId: 'jacks'
           }
           next()
       })
       
       app.use((req, res, next) => {
           //
           console.log('挂载auth属性到res对象上');
           res.auth = 'authorization';
           next()
       })
       
       
       app.use('/auth', (req, res, next) => {
           console.log('处理/auth路由');
           next()
       })
       
       function isAuth(req, res, next) {
           if (res.auth === 'authorization') {
               console.log('auth 鉴权中间件');
               next()
           }
       }
       
       app.get('/auth/info', isAuth, (req, res, next) => {
           console.log('get /auth/info');
           res.json({
               code: 0,
               success: true,
               message: '授权成功'
           })
       })
       
       app.use('/api', (req, res, next) => {
           //
           console.log('处理/api路由');
           next()
       })
       
       app.get('/api', (req, res, next) => {
           //
           console.log('get 处理/api路由');
           next()
       })
       
       /**
        * 模拟登录的中间件
        * @param req
        * @param res
        * @param next
        */
       function loginCheck(req, res, next) {
           setTimeout(() => {
               console.log('模拟登录成功');
               next()
           }, 5000)
       }
       
       app.get('/api/get-cookie',loginCheck,  (req, res, next) => {
           console.log('get /api/get-cookie');
           res.json({
               code: 1,
               message: req.cookie
           })
       })
       
       
       app.listen(8080, () => {
           console.log('server is running');
       })
    ```
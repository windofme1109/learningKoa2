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
          this.routes.all.push(info);
      }
      
      post() {
          const info = this.register(...arguments);
          this.routes.all.push(info);
      }
   ```
   use()、get()、post()逻辑类似，都是将接收的path和中间件函数注册到routes对象中。这个注册的过程通过register()完成。  
   `info` 存放的是path以及与之对应的中间件。然后将`info` 放入routes对象中与方法对应的属性中。
   


5. 定义 register()方法

6. 定义 listen() 方法

7. 定义 callback() 方法

8. 定义 match() 方法

9. 定义 handle() 方法


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Express中间件的原理及其实现](#express%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%9A%84%E5%8E%9F%E7%90%86%E5%8F%8A%E5%85%B6%E5%AE%9E%E7%8E%B0)
  - [1. 中间件的使用](#1-%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8)
  - [2. 中间件的调用顺序](#2-%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%9A%84%E8%B0%83%E7%94%A8%E9%A1%BA%E5%BA%8F)
  - [3. 中间件分析](#3-%E4%B8%AD%E9%97%B4%E4%BB%B6%E5%88%86%E6%9E%90)
  - [4.](#4)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Express中间件的原理及其实现

### 1. 中间件的使用

1. 通过`app.use([path], function)`调用。path参数可选，如果没有path，就对所以的请求path应用这个中间件。

2. 在路由处理中使用。`router.METHOD(path, [callback, ...] callback)`。最后一个回调是处理函数。中间的回调函数就是中间件，以从左向右，依次进行调用。

### 2. 中间件的调用顺序

- express中，中间件是按照先后顺序进行调用。即从上到下，依次调用。

### 3. 中间件分析

1. app.use()用来注册中间件，先收集起来
   - 通过app.use()注册一个中间件。那么这些中间件会按照顺序被收集起来，等待被调用。

2. 遇到http请求，根据path和method判断触发哪些

3. 实现next机制，上一个通过next触发下一个

### 4. 中间件实现思路

1. 在express中，可以添加中间件的函数主要有：use()和http请求方法，如：get、post、put等。我们以get为例，来指代http方法。

2. use()和get()的第一个参数都是path，而use()还可以省略path，直接传入一个中间件函数。
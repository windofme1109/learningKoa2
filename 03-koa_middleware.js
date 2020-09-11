const Koa = require('koa');

const app = new Koa();

const Router = require('@koa/router');

const router = new Router();

/**
 * 中间件
 *
 * 原因是koa把很多async函数（路由处理函数）组成一个处理链，每个async函数都可以做一些自己的事情
 * 然后用await next()来调用下一个async函数
 * 我们把每个async函数称为middleware，这些middleware可以组合起来，完成很多有用的功能
 */

/**
 * 应用级别中间件
 */
// 在use()函数中，使用一个中间件
// 匹配任何路由
// app.use(async (ctx, next) => {
//     ctx.body = '<h1>hello world</h1>';
//
//     // 如果不调用next()，则路由匹配在这里就会结束
//     // 调用next()，继续匹配下一个路由
// })

/**
 * 应用级别中间件
 * 匹配任意路由
 */
// app.use(async (ctx, next) => {
//
//     // 匹配路由之前，打印日期
//     console.log(new Date());
//
//     // 如果不调用next()，则路由匹配在这里就会结束
//     // 调用next()，继续匹配下一个路由
//     await next();
// })


/**
 * 路由级别的中间件
 * 在路由处理中使用中间件
 *
 */

// router.get('/news', async (ctx, next) => {
//     // 路由级别的中间件
//     // 匹配到/news，会先进入这个中间件
//
//     console.log('这是一条新闻');
//
//     // 完成处理后，调用next()方法，则可以继续匹配下一个路由
//     // 如果不调用next()，路由匹配在这里就会结束
//     await next();
// })

/**
 * 中间件执行顺序
 */
app.use(async (ctx, next) => {
    console.log('01 第一个中间件');
    await next();
    console.log('05 第一个中间件执行完毕');
})

app.use(async (ctx, next) => {
    console.log('02 第二个中间件');
    await next();
    console.log('04 第二个中间件执行完毕');
})

router.get('/news', async (ctx, next) => {
    console.log('03 执行路由处理函数——news');
    ctx.body = '<h1>新闻</h1>';
});

router.get('/', async (ctx, next) => {
    ctx.body = '<h1>首页</h1>'
});

/**
 * 错误处理中间件
 *
 */
// app.use(async (ctx, next)=> {
//     // 执行顺序：由于这个中间件匹配任何路由，所以首先会进入这个中间件，并开始执行
//     console.log('中间件01');
//     // 遇到next()，调用下一个路由处理函数，此时会进行路由匹配，也就是会进入匹配的路由处理函数
//     await next();
//     // 执行完成路由处理函数，回到这里，接着执行next()下面的代码
//     if (ctx.status === 404) {
//         ctx.body = '<h1>404 NOT FOUND</h1>'
//     } else {
//         console.log(ctx.url);
//     }
// })


app.use(router.routes());
app.use(router.allowedMethods());

app.listen(7001);
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router({
    // path的前缀，设置了prefix参数，则所有的path必须以/users开头，才能被处理
    // / ————> /users/
    // /news ————> /users/news
    // prefix: '/users'
});

/**
 * ctx表示上下文，包含了request、response等
 */
router.get('/', async (ctx, next) => {
    // body属性是返回的数据
    // 相当于express中的res.send()
    ctx.body = '<h1>首页</h1>'
});

/**
 * 动态路由
 * 使用url参数（url parameters）动态捕获参数值，并解析为key: value的形式，放入ctx.params中
 * url参数形式：/:xxx
 * url参数只有一层的形式，匹配的url是：/news/xxx
 */
router.get('/news/:aid', async (ctx, next) => {
    // 获取url参数
    const params = ctx.params;
    console.log(params);

    // body属性是返回的数据
    // 相当于express中的res.send()
    ctx.body = '<h1>新闻</h1>';
});


// 获取查询参数
router.get('/newscontent', async (ctx, next) =>{
    // Koa2中，get方法的查询参数通过request接收，接收的方式有两种：query和querystring
    // query：格式化的参数对象
    // querystring：查询字符串，也就是key=value的这种形式

    // 有两种方式获取get方法的查询参数
    // 1. 通过ctx的request对象获取
    const req = ctx.request;
    // const {query, querystring} = req;
    // console.log('query', query);
    // console.log('querystring', querystring);
    // 通过request对象获取当前请求的url
    console.log(req.url);
    // 2. 直接通过ctx获取
    const {query, querystring} = ctx;
    console.log('query', query);
    console.log('querystring', querystring);
    // 通过ctx（上下文）获取当前请求的url
    console.log(ctx.url);
    ctx.body = '<h1>news content</h1>'
})

// 应用路由
app
    .use(router.routes())    // 启动路由
    .use(router.allowedMethods());

/**
 * router.allowedMethods()的作用：
 * 这是官方推荐的用法，router.allowedMethods()应用在路由匹配router.routes()之后
 * 所以在所有路由中间件调用之后调用，此时根据ctx.status设置response响应头
 *
 * 也就是说，如果出错，或者是我们忘记设置响应头，router.allowedMethods()就会帮助我们进行设置
 */

app.listen(7001);
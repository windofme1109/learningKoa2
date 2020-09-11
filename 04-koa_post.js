const Koa = require('koa');
const app = new Koa();

const Router = require('@koa/router');
const router = new Router();

const bodyParser = require('koa-bodyparser');
// 在解析post请求体之前，必须先使用bodyParser中间件
app.use(bodyParser());

const getPostData = require('./modules/common')

router.get('/news', async (ctx, next) => {
    console.log('03 执行路由处理函数——news');
    ctx.body = '<h1>新闻</h1>';
});

/**
 * 原生方法获取post数据
 */
router.post('/login', async (ctx, next) => {
    // 原生方法（stream）获取post数据
    // const ret = await getPostData(ctx);
    // console.log(ret);
    // ctx.body = ret;

    // 使用koa-bodyparser解析post请求体
    // 解析后的数据存放在ctx.request.body中
    // 默认解析的是json格式的post请求数据
    ctx.body = ctx.request.body;
    // console.log(ctx.request.body);
    // ctx.body = '<h1>login success!!!!!</h1>';
});

router.get('/', async (ctx, next) => {
    ctx.body = `
        <Form action="/login" method="post">
        <label for="username">
            用户名: <input id="username" type="text" name="username">
        </label>
        <label for="password">
            密码: <input id="password" type="password" name="password">
        </label>
        <button type="submit">登录</button>
        
</Form>
    `
});




app.use(router.routes());
app.use(router.allowedMethods());

app.listen(7001);
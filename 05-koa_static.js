const Koa = require('koa');
const app = new Koa();

const Router = require('@koa/router');
const router = new Router();

// 解析静态资源
// 通俗的说，就是将指定的文件夹暴露给浏览器，使得其能够直接访问
const serve = require('koa-static');

// serve()方法接收一个根路径作为参数
// 比如说引入css的标签是：<link rel="stylesheet" href="css/style.css">
// 相对路径是：css/style.css
// 浏览器请求的url是：http://localhost:7001/static/css/style.css
// 直接请求肯定会报404
// 使用koa-static这个中间件
// 服务器收到我们请求静态资源（image、js、css）的请求，使用koa-static中间件
// 将相对路径与serve()中传入的根路径进行拼接，即./static/css/style.css
// 将这个路径所指向的文件，作为响应，返回给浏览器
app.use(serve('./static'));

// 可以指定多个根路径
// 服务器会从上到下（调用next()方法），依次进行路径的拼接，并根据路径查询相关的资源
// 找到了，就直接返回给浏览器
app.use(serve('./public'));

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
    <header>
        <link rel="stylesheet" href="css/style.css">
    </header>
    <body>
        <div class="logo">
        <img class="logo-img" src="img/static-0001.jpg" alt="">
        <img class="logo-img" src="img/public-0002.jpg" alt="">
    </div>
    <div class="login">
        <Form action="/login" method="post">
            <label for="username">
                用户名: <input id="username" type="text" name="username">
            </label>
            <label for="password">
                密码: <input id="password" type="password" name="password">
            </label>
            <button type="submit">登录</button>
        </Form>
    </div>
    </body>
    <script src="js/action.js"></script>
    `
});




app.use(router.routes());
app.use(router.allowedMethods());

app.listen(7001);
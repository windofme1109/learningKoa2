const Koa = require('koa');
const app = new Koa();

const Router = require('@koa/router');
const router = new Router();

// 解析静态资源
// 通俗的说，就是将指定的文件夹暴露给浏览器，使得其能够直接访问
const serve = require('koa-static');

app.use(serve('./static'));
app.use(serve('./public'));

const bodyParser = require('koa-bodyparser');
// 在解析post请求体之前，必须先使用bodyParser中间件
app.use(bodyParser());

const getPostData = require('./modules/common')


router.get('/news', async (ctx, next) => {

    // 通过 ctx.cookies.get('name')来获取cookie，接收的参数是cookie的name
    const userinfo = ctx.cookies.get('userinfo');
    // 获取中文形式的cookie，由于中文是经过base64编码的，所以获取cookie值以后，还得进行base64解码
    const encodedUserSchool = ctx.cookies.get('school');
    // base64解码
    const userSchool = Buffer.from(encodedUserSchool, 'base64').toString();
    console.log(userinfo);
    console.log(userSchool);

    ctx.body = `
        <h1>新闻</h1>
        <p>userInfo ${userinfo}</p>
    `

});

router.get('/shop', async (ctx, next) => {

    // 通过 ctx.cookies.get('name')来获取cookie，接收的参数是cookie的name
    const userinfo = ctx.cookies.get('userinfo');


    console.log(userinfo);

    ctx.body = `
        <h1>购物</h1>
        <p>userInfo ${userinfo}</p>
    `

});

router.get('/', async (ctx, next) => {

    // 通过 ctx.cookies.set(name, value, [options])用来设置cookies
    // options是可选参数，用来配置cookies的一些选项，值是一个对象
    ctx.cookies.set('userinfo', 'jack', {
        // maxAge表示这个cookies的最大存活时间
        maxAge: 60*1000*60*24,
        // expires表示过期的具体时间
        // expires: '2020-12-23',
        // 在哪个路径下，可以访问到这个cookie，设置了/news，则只有在这个路径下，才能访问cookie
        // path: '/news',
        // 设置cookie的域名，在这个域名下的二级域名界面（a.baidu.com，b.baidu.com），都可以访问这个cookie
        // domain: '*.baidu.com',
        // true表示这个cookie只有服务器可以访问，设置为false，服务器和客户端（js）都可以访问
        // httpOnly: true,
    })
    // koa中的cookies无法直接设置中文
    // 直接设置了中文，就提示TypeError: argument value is invalid
    // ctx.cookies.set('school', '北邮', {
    //     maxAge: 60*1000*60*24,
    // })

    // 想要在cookie中设置中文，必须先将中文转换为base64编码，获取这个cookie后，再进行base64解码
    const userSchool = Buffer.from('北邮').toString('base64');
    ctx.cookies.set('school', userSchool, {
        maxAge: 60*1000*60*24,
    })
    ctx.body = `
        <h1>首页</h1>
    `
});




app.use(router.routes());
app.use(router.allowedMethods());

app.listen(7001);
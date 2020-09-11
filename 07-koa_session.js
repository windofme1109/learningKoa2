const Koa = require('koa');
const app = new Koa();

const Router = require('@koa/router');
const router = new Router();

// 设置Session
const session = require('koa-session');
/**
 * 配置session
 */

// 加密字符串（salt）
app.keys = ['some secret hurr'];

const CONFIG = {
    // cookie的签名
    key: 'koa.sess', /** (string) cookie key (default is koa.sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    // 过期时间
    maxAge: 86400000,
    // 自动将cookie（与session相关的cookie）添加到请求头中
    // 默认为true，设置为false，则不会添加，因此服务端获取不到相应的key，也就无法获取session
    autoCommit: true, /** (boolean) automatically commit headers (default true) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    // 每次请求都重新设置session，即重置session的过期时间
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    // 当session要过期的时候，更新session
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    // 安全的cookie，要求必须是https访问
    secure: false, /** (boolean) secure cookie*/
    sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
};

app.use(session(CONFIG, app));

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

    // 获取session
    const userinfo = ctx.session.userinfo;
    ctx.body = `
        <h1>新闻</h1>
        <p>userInfo ${userinfo}</p>
    `

});


router.get('/', async (ctx, next) => {

    // 配置了koa-session中间件以后，在ctx对象上多出了一个session属性，我们能可以通过这个属性设置和读取session
    // 设置session
    ctx.session.userinfo = 'rose';

    ctx.body = `
        <h1>首页</h1>
    `;
});




app.use(router.routes());
app.use(router.allowedMethods());

app.listen(7001);
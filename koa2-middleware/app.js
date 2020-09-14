const Koa = require('./koa2/like-koa2');

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


app.listen(8080);
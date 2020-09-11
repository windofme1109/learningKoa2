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
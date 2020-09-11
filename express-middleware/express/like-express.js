/**
 *
 * express中间件的实现原理
 *
 */

const http = require('http');

const slice = Array.prototype.slice;


class LikeExpress {
    constructor() {
        // routes指代路由，路由里面包含的是各种处理方法
        this.routes = {
            // 定义三个属性，用来接收中间件函数
            // all指代use()方法
            all: [],
            // get指代get()方法
            get: [],
            // post指代post()方法
            post: [],
        }

    }

    /**
     * 收集use()和其他http方法（get、post）接收的参数
     * 并将其添加到routes对象相应的属性（all、get、post）中
     * @param path 路径
     * @returns {{}}
     */
    register(path) {
        const info = {};

        if (typeof path === 'string') {
            // 如果path的类型是string，证明use()接收的第一个参数是路径，不是中间件函数
            info.path = path;
            // arguments是类数组对象，没有slice()这个数组方法
            // 通过call()，将slice()的this指向arguments
            //也就是相当于arguments调用slice()
            // call()的第二个参数，是调用call()方法的参数，也就是slice()的参数
            // 传入1，表示获取arguments的第二个到最后一个元素，并生成一个新的数组
            // arguments从第二个元素开始，才是中间件处理函数，第一个元素是path
            info.stack = slice.call(arguments, 1);
        } else {
            // 如果path的类型不是string，证明use()接收的第一个参数是中间件函数，不是路径
            // 那么我们将path设置为根路径/
            // 没有设置path参数，实际上和设置根路径/效果是一样的（都会调用这个中间件）
            info.path = '/';
            // 从第一个元素开始，将arguments转换为数组
            // arguments从第一个元素开始，就是中间件处理函数
            info.stack = slice.call(arguments, 0);
        }

        return info;
    }

    use() {
        // 因为use()接收的参数不确定，这里使用arguments来接收参数
        // 为什么要将register()的this指向当前对象？
        // 我觉得这里使用apply()的最大作用是：将arguments参数顺利传入
        // arguments是一个类数组对象，而register()不接收这种形式的参数
        // 所以，我们借助apply()，将arguments展开为参数列表，传入register()中
        // 这里可不可以使用ES6的展开语法（...）呢？
        // const info = this.register.apply(this, arguments);
        const info = this.register(...arguments);
        this.routes.all.push(info);
    }
    get() {
        const info = this.register.apply(this, arguments);
        this.routes.get.push(info);
    }
    post() {
        const info = this.register.apply(this, arguments);
        this.routes.post.push(info);
    }

    match(method, url) {
        let stack = [];
        if (url === '/favicon.ico') {
            return stack;
        }
        // 存放中间件和路由处理函数
        let currentRoutes = [];
        // 因为all属性存放的是use()接收的中间件，所以要无条件的放入currentRoutes中
        currentRoutes = currentRoutes.concat(this.routes.all);
        // 我们再根据method，从routes属性中取出对应的方法的中间件和路由处理函数
        currentRoutes = currentRoutes.concat(this.routes[method]);

        currentRoutes.forEach((routeInfo) => {
            if (url.indexOf(routeInfo.path) === 0) {
                // 判断注册的path是否是请求的url的一部分，有以下几种情况
                // url === '/api/get-cookie'
                // 同这个url匹配的路由有三个：
                // 1. '/'  根路径
                // 2. '/api'  上一级路径
                // 3. '/api/get-cookie'  完全匹配
                // 这是路由的匹配规则，所以这里需要使用indexOf()方法进行判断，而不是使用===
                // 将符合条件的路由放入stack中
                stack = stack.concat(routeInfo.stack);
            }
        })

        return stack;
    }

    /**
     *
     * @param req
     * @param res
     * @param stack
     */
    handle(req, res, stack) {

        // 定义一个next()函数
        const next = () => {
            // 取出中间件
            // 因为要按照顺序执行，所以得从数组的第一个元素开始取出中间件
            const middleware = stack.shift();
            if (middleware) {
                // 中间件存在，执行中间件
                // 因此标准的中间件接收三个参数：req, res, next
                // 这里也要传入这三个参数，next就是我们外面定义的next
                middleware(req, res, next);
            }
        }
        // 执行next()，就是执行下一个中间件
        next();
    }


    callback() {
        return (req, res) => {
            // 原生的node提供的res对象没有json()方法，我们这里加上这个方法
            res.json = (data) => {
                res.setHeader('Content-type', 'application/json');
                res.end(JSON.stringify(data));
            }

            // 获取请求的url
            const url = req.url;
            // 获取请求的方法
            const method = req.method.toLowerCase();

            // 要根据url和method区分出我们访问的是哪个路由（中间件）
            const resultList = this.match(method, url);

            // 真正执行中间件
            this.handle(req, res, resultList);
        }
    }

    listen(...args) {
        // 使用原生的http模块创建http服务
        const server = http.createServer(this.callback());
        server.listen(...args);
    }
}

// 工厂函数
module.exports = () => {
    return new LikeExpress();
}
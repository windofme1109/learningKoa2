/**
 *
 * Koa2 中间件原理
 *
 */


const http = require('http');

/**
 * 组合中间件，实现next()对下一个中间件的调用
 * @param middleareList
 */
function compose(middleareList) {
    /**
     * ctx表示koa2中的上下文，中间件必须接收ctx参数
     * 而next参数可以对middlewareList进行操作获取到
     */
    return (ctx) => {

        /**
         * 执行中间件，并实现next对下一个中间件的调用
         * @param index
         */
        function dispatch(index) {
            // 根据索引，从中间件列表中取出中间件函数
            const fn = middleareList[index];

            // 保证中间件一定存在
            if (!fn) {
                return Promise.resolve();
            }

            try {
                // 中间件函数可以是 async 函数，也可以不是。无论是不是 async 函数，中间件内部必须可以使用 await。
                // 所以，我们这里使用Promise.resolve()包装函数的执行结果，使其成为一个Promise对象
                // 这样，无论我们有没有使用async函数，都可以获得一个Promise对象，使得我们后续可以使用await语法，调用next()
                return Promise.resolve(
                    // bind方法用于将函数体内的this绑定到某个对象，然后返回一个新函数
                    // bind()方法的第一个参数是要绑定的this对象，第二个以及后面的参数是调用bind()的函数接收的参数
                    // dispatch()内部没有this，同时，将bind()方法的第一个参数设置为null
                    // 同时还设置了第二个参数（index + 1），这个参数（index + 1）绑定原函数的参数，也就是预传参
                    // 这样就实现了从中间件列表中依次取出每一个中间件

                    // bind()返回一个dispatch()的一个拷贝，同时预先传入了参数
                    // 因为fn()是中间件函数，fn()的第二个参数形式上next，实际上是dispatch.bind(null, index + 1)
                    // 也就是：next指向了dispatch.bind(null, index + 1)，当我们调用next()
                    // 实际上就是调用dispatch()的一个拷贝
                    fn(ctx, dispatch.bind(null, index + 1))
                )
            } catch (err) {
                return Promise.reject(err);
            }
        }

        // 立即执行
        return dispatch(0);
    }
}

class LikeKoa2 {
    constructor() {
        this.middlewareList = [];
    }


    use(fn) {
        this.middlewareList.push(fn);
        // this指代的是当前的实例
        // 在use()函数中，返回值设定为this，目的是实现use()的链式调用，即：app.use().use()
        return this;
    }

    /**
     * 用于生成上下文（context对象）
     * @param req
     * @param res
     * @returns {{res: *, req: *}}
     */
    createContext(req, res) {
        const ctx = {
            req,
            res
        }

        ctx.query = req.query;

        return ctx;
    }

    handleRequest(ctx, fn) {
        return fn(ctx);
    }

    callback() {
        // fn()是真正执行中间件的函数
        const fn = compose(this.middlewareList);
        return (req, res) => {
            const ctx = this.createContext(req, res);
            // 这里直接执行fn()即可
            // 开始执行中间件
            fn(ctx);
            // 也可以单独定义一个函数，用于执行中间件
            // return this.handleRequest(ctx, fn);
        }
    }



    listen(...args) {

        const server = http.createServer(this.callback());
        server.listen(...args);
    }


    // 这样使用：http.createServer(this.callback)可以吗
    // callback(req, res) {
    //     // fn()是真正执行中间件的函数
    //     const fn = compose(this.middlewareList);
    //     const ctx = this.createContext(req, res);
    //     fn(ctx);
    // }

    // 结果会报错
    // 原因是createServer()接收的是回调函数，this.callback是对callback()的一个引用
    // createServer()是异步创建http服务，那么真正调用callback()的时候
    // callback()内部的this并不一定是指向LikeKoa2的实例
    // 所以，这里需要将callback()内部的this指向LikeKoa2
    // 使用闭包结合箭头函数完成this的绑定
}


module.exports = LikeKoa2;
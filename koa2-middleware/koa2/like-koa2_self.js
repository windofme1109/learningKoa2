/**
 *
 * 自己实现的Koa2 中间件
 *
 */

const http = require('http');

function compose(middlewareList) {

    return (ctx) => {
        function dispatch(index) {
            const fn = middlewareList[index];
            try {
                return Promise.resolve(
                    fn(ctx, dispatch.bind(null, index + 1))
                );
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return dispatch(0);
    }
}

class LikeKoa2 {
    middlewareList = [];

    use(fn) {
        this.middlewareList.push(fn);
    }

    createContext(req, res) {
        return {req, res};
    }

    callback() {
        const fn = compose(this.middlewareList);
        return (req, res) => {
            const ctx = this.createContext(req, res);
            fn(ctx);
        }

    }

    listen(...args) {
        const server = http.createServer(this.callback());
        server.listen(...args);
    }
}

module.exports = LikeKoa2;
/**
 *
 * 自己实现的express
 *
 */

const http = require('http');

class LikeExpress {
    routes = {
        all: [],
        get: [],
        post: []
    }

    register(path) {
        const info = {};
        if (typeof path === 'string') {
            info.path = path;
            info.stack = Array.prototype.slice.call(arguments, 1);
        } else {
            info.path = '/';
            info.stack = Array.prototype.slice.call(arguments, 0);
        }

        return info;
    }

    use() {
        const middlewareInfo = this.register(...arguments);
        this.routes.all.push(middlewareInfo);
    }
    get() {
        const middlewareInfo = this.register(...arguments);
        this.routes.get.push(middlewareInfo);
    }
    post() {
        const middlewareInfo = this.register(...arguments);
        this.routes.post.push(middlewareInfo);
    }
    match(url, method) {

        let stack = [];
        if (url === '/favicon.ico') {
            return stack;
        }

        stack = stack.concat(this.routes.all, this.routes[method]);
        let middlewareList = [];
        stack.forEach(item => {
            if (url.includes(item.path)) {
                middlewareList = middlewareList.concat(item.stack);
            }
        })

        return middlewareList;

    }

    handle(req, res, middlewareList) {
        const next = () => {
            const fn = middlewareList.shift();

            if(fn) {
                fn(req, res, next);
            }
        }

        next();
    }

    callback() {

        return (req, res) => {
            res.json = (data) => {
                res.setHeader('Content-type', 'application/json');
                res.end(JSON.stringify(data));
            }

            const url = req.url;

            const method = req.method.toLowerCase();
            const middlewareList = this.match(url, method);

            this.handle(req, res, middlewareList);
        }
    }

    listen(...args) {
        const server = http.createServer(this.callback());

        server.listen(...args);
    }
}

module.exports = () => {
    return new LikeExpress();
}
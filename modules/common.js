module.exports = (ctx) => {
    // 函数的返回值是Promise，这样可以使用async/await获取异步操作结果
    return new Promise((resolve, reject) => {
        try {
            let str = '';
            // 使用的是stream的方式，从流中拼接出我们需要的内容
            // 监听data事件
            ctx.req.on('data', (chunk) => {
                str += chunk;
            })
            // 监听end事件
            // 表示流的传输已经结束，调用状态成功的的函数resolve()，并传入str
            ctx.req.on('end', (chunk) => {
                resolve(str);
            })
        } catch(err) {
            reject(err);
        }
    })

}
const userSchool = Buffer.from('北邮').toString('base64');
console.log();

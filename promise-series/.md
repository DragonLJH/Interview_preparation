### promise-series
#### MyPromise
1. class MyPromise
2. 实现构造函数 constructor ，定义 私有属性 （state状态 = 'pending'，value值 = undefined ）
3. 传入参数executor，executor是函数需要两个参数（resolve，reject）
4. 私有属性 （state状态，value值）的值由（resolve，reject）的方法修改，state状态一旦改变,就不会再变,任何时候都可以得到这个结果。
5. 捕获同步异常，异常捕获，调用 reject。(异步异常捕获不了，state状态不改变)
6. 常量优化
```
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
const state = Symbol('state')
const value = Symbol('value')
const changeState = Symbol('changeState')
class MyPromise {
    [state] = PENDING;
    [value] = void 0;
    constructor(executor) {
        const resolve = (data) => {
            this[changeState](FULFILLED, data)
        }
        const reject = (reason) => {
            this[changeState](REJECTED, reason)
        }
        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }

    [changeState](cState, data) {
        if (this[state] !== PENDING) return
        this[state] = cState
        this[value] = data
    }
}
```

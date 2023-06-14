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
#### then
1. then 方法，接收两个可选参数 onfulfilled, onrejected
2. 判断传入参数 onfulfilled, onrejected ，返回一个新的 Promise 对象
> * 非 Function 类型
> * Function 类型
> * Promise 类型
3. （同步）根据 state 的状态返回新的 Promise 对象
4. （异步）state （PENDING）状态，新增回调方法组（callbacks），在改变状态方法下执行回调方法组
5. （异步）优化，新增 run 方法，在状态改变的时候触发，调用then方法且状态不为PENDING时触发。
6. 代码优化，抽出相同代码。
7. 进入微队列执行
```
···
const callbacks = Symbol('callbacks')
const run = Symbol('run')
const runOne = Symbol('runOne')
const isPromiseLike = Symbol('isPromiseLike')
const runMutation = Symbol('runMutation')
···
···
    [callbacks] = []
···
···
    [isPromiseLike](target) {
        if (target !== null && (typeof target == 'object' || typeof target == 'function')) {
            return typeof target.then == 'function'
        }
        return false
    }
    [runMutation](func) {
        // if (typeof process == 'object' || typeof process.nextTick == 'function') {
        //     process.nextTick(func)
        // } else 
        if (typeof MutationObserver == 'function') {
            const ob = new MutationObserver(func)
            const textNode = document.createTextNode('1');
            ob.observe(textNode, { characterData: true })
            textNode.data = "2"
        } else {
            setTimeout(func, 0)
        }
    }

    [changeState](cState, data) {
        ···
        this[run]()
    }
    [runOne](callback, resolve, reject) {
        this[runMutation](() => {
            if (Object.prototype.toString.call(callback) !== "[object Function]") {
                const target = this[state] == FULFILLED ? resolve : reject
                target(this[value])
                return
            }
            try {
                const result = callback(this[value])
                if (this[isPromiseLike](result)) {
                    result.then(resolve, reject)
                } else {
                    resolve(result)
                }

            } catch (err) {
                reject(err)
            }
        })

    }
    [run]() {
        if (this[state] === PENDING) return
        this[callbacks].forEach((item) => {
            const { resolve, reject, onfulfilled, onrejected } = item
            if (this[state] == FULFILLED) {
                this[runOne](onfulfilled, resolve, reject)
            } else {
                this[runOne](onrejected, resolve, reject)
            }
        })
    }
···
    then(onfulfilled, onrejected) {
        return new MyPromise((resolve, reject) => {
            this[callbacks].push({
                resolve,
                reject,
                onfulfilled,
                onrejected
            })
            this[run]()
        })
    }
```


#### 实现catch、finally、resolve、reject方法
1. catch
2. finally
3. resolve
4. reject
```
···
    catch (onrejected) {
        return this.then(null, onrejected)
    }; 
    finally(onFinally) {
        return this.then((value) => {
            onFinally()
            return value
        }, (err) => {
            onFinally()
            throw err
        })
    }; 
    static resolve(data) {
        let _resolve, _reject
        const p = new MyPromise((resolve, reject) => {
            _resolve = resolve
            _reject = reject
        })
        if (p[isPromiseLike](data)) {
            data.then(_resolve, _reject)
        } else {
            _resolve(data)
        }
        return p
    } 
    static reject(data) {
        return new MyPromise((resolve, reject) => {
            reject(data)
        })
    }
···
```

#### 实现all方法
1. 传递参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 Promise 实例
2. 实例的状态都变成fulfilled，或者其中有一个变为rejected，才会调用all方法后面的回调函数
```
    ···
    static all(data) {
        const len = data.length
        let list = []
        let count = 0
        return new MyPromise((reslove, reject) => {
            if (!Array.isArray(data)) return reject(new TypeError('Argument is not iterable'))
            if (!data.length) reslove(list)
            data.forEach((item, index) => {
                MyPromise.resolve(item).then((value) => {
                    list[index] = value
                    count++
                    count === len && reslove(list)
                }, reject)
            })
        })
    }
    ···
```

#### 实现race方法
1. 传递参数和 all 方法一样
2. 有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给p的回调函数。
```
    ···
    static race(data) {
        return new MyPromise((reslove, reject) => {
            if (!Array.isArray(data)) return reject(new TypeError('Argument is not iterable'))
            if (!data.length) reslove(data)
            data.forEach(item => {
                MyPromise.resolve(item).then((value) => {
                    reslove(value)
                }, reject)
            })
        })
    }
    ···
```


















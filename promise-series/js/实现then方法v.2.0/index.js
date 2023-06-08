const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
const state = Symbol('state')
const value = Symbol('value')
const changeState = Symbol('changeState')
const callbacks = Symbol('callbacks')
const run = Symbol('run')
const runOne = Symbol('runOne')
class MyPromise {


    [state] = PENDING;
    [value] = void 0;
    [callbacks] = []
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
        this[run]()
    }

    [runOne](callback, resolve, reject) {
        if (Object.prototype.toString.call(callback) !== "[object Function]") {
            const target = this[state] == FULFILLED ? resolve : reject
            target(this[value])
            return
        }
        try {
            resolve(callback(this[value]))
        } catch (err) {
            reject(err)
        }
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
}

// executor: (resolve: (value: any) => void, reject: (reason?: any) => void) => void
// then(onfulfilled?: ((value: any) => any) | null | undefined, onrejected?: ((reason: any) => PromiseLike<never>) | null | undefined): Promise<any>
const p = new Promise((resolve, reject) => {
    // setTimeout(() => {
    //     reject(1)
    // }, 1000)

    throw new Error('1');
    // resolve(1)
})
p.then((value) => {
    console.log("p-0:", value)
    throw new Error('p-err');
}, (err) => {
    console.log("p-0-err:", err)
    throw new Error('p-err1');
}).then((value) => {
    console.log("p-1:", value)
}, (err) => {
    console.log("p-1-err:", err)
})
const p1 = new MyPromise((resolve, reject) => {
    // setTimeout(() => {
    //     reject(1)
    // }, 1000)

    throw new Error('1');
    // resolve(1)
})



p1.then((value) => {
    console.log("p1-0:", value)
    throw new Error('p1-err');
}, (err) => {
    console.log("p1-0-err:", err)
    throw new Error('p1-err1');
}).then((value) => {
    console.log("p1-1:", value)
}, (err) => {
    console.log("p1-1-err:", err)
})
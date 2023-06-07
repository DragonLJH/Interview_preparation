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





// executor: (resolve: (value: any) => void, reject: (reason?: any) => void) => void
const p = new Promise((resolve, reject) => {
    setTimeout(() => {
        throw 123
    })
})
const p1 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        throw 123
    })

})
console.log(p)
console.log(p1)
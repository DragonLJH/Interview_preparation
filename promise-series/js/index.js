const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
const state = Symbol('state')
const value = Symbol('value')
const changeState = Symbol('changeState')
const callbacks = Symbol('callbacks')
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
        this[callbacks].forEach((item) => {
            if (this[state] == FULFILLED) item.onfulfilled(data)
            if (this[state] == REJECTED) item.onrejected(data)
        })
    }
    then(onfulfilled, onrejected) {
        return new MyPromise((resolve, reject) => {
            const callback = {
                onfulfilled: (data) => resolve(onfulfilled(data)),
                onrejected: (reason) => reject(onrejected(reason)),
            }

            if (Object.prototype.toString.call(onfulfilled) == "[object Function]") {
                if (this[state] == FULFILLED) {
                    return resolve(onfulfilled(this[value]))
                }
            }
            if (Object.prototype.toString.call(onrejected) == "[object Function]") {
                if (this[state] == REJECTED) {
                    return reject(onrejected(this[value]))
                }
            }
            if (this[state] == PENDING) {
                this[callbacks].push(callback)
            }
        })

    }
}





// executor: (resolve: (value: any) => void, reject: (reason?: any) => void) => void
// then(onfulfilled?: ((value: any) => any) | null | undefined, onrejected?: ((reason: any) => PromiseLike<never>) | null | undefined): Promise<any>
const p = new Promise((resolve, reject) => {
    setTimeout(() => {
            resolve(1)
        }, 3000)
        // resolve(1)
})
console.log(p.then((value) => {
    return "pThen:" + value
}))
const p1 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
            resolve(1)
        }, 3000)
        // resolve(1)
})
console.log(p1.then((value) => {
    return "p1Then:" + value
}))
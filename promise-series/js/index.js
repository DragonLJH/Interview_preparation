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
            if (Object.prototype.toString.call(onfulfilled) == "[object Function]") {
                if (this[state] == FULFILLED) {
                    try {
                        resolve(onfulfilled(this[value]))
                    } catch (error) {
                        reject(error)
                    }
                }
            } else {
                resolve(this[value])
            }
            if (Object.prototype.toString.call(onrejected) == "[object Function]") {
                if (this[state] == REJECTED) {
                    try {
                        reject(onrejected(this[value]))
                    } catch (error) {
                        reject(error)
                    }
                }
            } else {
                reject(this[value])
            }
        })
    }
    then(onfulfilled, onrejected) {
        return new MyPromise((resolve, reject) => {
            if (Object.prototype.toString.call(onfulfilled) == "[object Function]") {
                if (this[state] == FULFILLED) {
                    try {
                        resolve(onfulfilled(this[value]))
                    } catch (error) {
                        reject(error)
                    }
                }
            } else {
                resolve(this[value])
            }
            if (Object.prototype.toString.call(onrejected) == "[object Function]") {
                if (this[state] == REJECTED) {
                    try {
                        reject(onrejected(this[value]))
                    } catch (error) {
                        reject(error)
                    }
                }
            } else {
                reject(this[value])
            }
            if (this[state] == PENDING) {
                this[callbacks].push({
                    resolve,
                    reject,
                    onfulfilled,
                    onrejected
                })
            }
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
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
const state = Symbol('state')
const value = Symbol('value')
const changeState = Symbol('changeState')
const callbacks = Symbol('callbacks')
const run = Symbol('run')
const runOne = Symbol('runOne')
const isPromiseLike = Symbol('isPromiseLike')
const runMutation = Symbol('runMutation')
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
        if (this[state] !== PENDING) return
        this[state] = cState
        this[value] = data
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
// then(onfulfilled?: ((value: any) => any) | null | undefined, onrejected?: ((reason: any) => isPromiseLike<never>) | null | undefined): Promise<any>
const p = new Promise((resolve, reject) => {
    resolve(1)
})
p.then((value) => {
    console.log("p-0:", value)
    return new Promise((resolve, reject) => {
        resolve(123)
    })

    // throw new Error('p-err');
}).then((value) => {
    console.log("p-1:", value)
})
const p1 = new MyPromise((resolve, reject) => {
    resolve(1)
})
p1.then((value) => {
    console.log("p1-0:", value)
    return new MyPromise((resolve, reject) => {
        resolve(123)
    })

    // throw new Error('p-err');
}).then((value) => {
    console.log("p1-1:", value)
})

console.log("asd")

// const p2 = new MyPromise((resolve, reject) => {
//     resolve(1)
// }).then((value) => {
//     console.log("p2", value)
//     return new Promise((resolve, reject) => {
//         resolve(123)
//     })
// }).then((value) => {
//     console.log("p22", value)

// })
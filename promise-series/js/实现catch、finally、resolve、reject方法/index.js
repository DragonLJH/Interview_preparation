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
    };

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




}



// executor: (resolve: (value: any) => void, reject: (reason?: any) => void) => void
// then(onfulfilled?: ((value: any) => any) | null | undefined, onrejected?: ((reason: any) => isPromiseLike<never>) | null | undefined): Promise<any>
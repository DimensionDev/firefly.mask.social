export type ValueComparer<T> = (a: T, b: T) => boolean

const defaultComparer: ValueComparer<any> = (a, b) => a === b

export class ValueRef<T> {
    constructor(initialValue: T, isEqual: ValueComparer<T> = defaultComparer) {
        this._value = initialValue
        this.isEqual = isEqual
    }

    get value() {
        return this._value
    }

    set value(newVal: T) {
        const oldVal = this._value
        if (this.isEqual(newVal, oldVal)) return
        this._value = newVal
        for (const fn of this.watchers) {
            try {
                fn(newVal, oldVal)
            } catch (err) {
                console.error(err)
            }
        }
    }
    
    addListener(fn: (newVal: T, oldVal: T) => void): () => void {
        this.watchers.add(fn)
        return () => void this.watchers.delete(fn)
    }

    private watchers = new Set<(newVal: any, oldVal: any) => void>()
    private isEqual: ValueComparer<T>
    private _value: T
}
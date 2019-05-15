export function onlyUnique<T, K extends keyof T>(array: T[], key: K): T[] {
    var alreadyHaveValues = [] as T[K][]
    return array.filter(e => {
        const v = e[key]
        if (alreadyHaveValues.includes(v)) return false
        alreadyHaveValues.push(v)
        return true
    })
}

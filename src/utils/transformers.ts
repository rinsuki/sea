import $, { string, number } from "transform-ts"

export function $length<T extends { length: number }>(p: { min?: number; max?: number } | number) {
    return new $.Transformer<T, T>(
        input => {
            if (typeof p === "number") {
                if (input.length !== p) {
                    throw new ValidationLengthError([], "equal", p, input.length)
                }
            } else {
                if (p.min != null && p.min > input.length) {
                    throw new ValidationLengthError([], "short", p.min, input.length)
                }
                if (p.max != null && p.max < input.length) {
                    throw new ValidationLengthError([], "long", p.max, input.length)
                }
            }
            return $.ok(input)
        },
        output => $.ok(output)
    )
}

export class ValidationLengthError extends $.ValidationError {
    constructor(
        readonly path: Array<string | number>,
        readonly direction: "long" | "short" | "equal",
        readonly limit: number,
        readonly real: number
    ) {
        super(
            "LengthError",
            path,
            direction !== "equal"
                ? `this is too ${direction}. limit is ${limit}, but actual length is ${real}`
                : `This length is not `
        )
    }
}

type Literal<B, T extends B> = B extends T ? never : T

export function $literal<LV extends string, T extends { [key: string]: LV }, V extends Literal<LV, T[keyof T]>>(
    constValues: T
) {
    const values = Object.values(constValues)
    return new $.Transformer<unknown, V>(input => {
        for (const v of values) {
            if (v === input) return $.ok(v as V)
        }
        throw new ValidationUnknownValueError([], values)
    }, $.ok)
}

export class ValidationUnknownValueError extends $.ValidationError {
    constructor(readonly path: Array<string | number>, readonly expectedValues: string[]) {
        super("UnknownValueError", path, `This must be ${expectedValues.map(v => JSON.stringify(v)).join(" or ")}.`)
    }
}

export const $safeNumber = new $.Transformer<number, number>(
    n => {
        if (Number.isNaN(n)) throw new ValidationNotSafeNumberError([], "nan")
        if (n >= Infinity) throw new ValidationNotSafeNumberError([], "plus-infinity")
        if (n <= -Infinity) throw new ValidationNotSafeNumberError([], "minus-infinitiy")
        return $.ok(n)
    },
    o => $.ok(o)
)

export class ValidationNotSafeNumberError extends $.ValidationError {
    constructor(readonly path: Array<string | number>, readonly type: "nan" | "plus-infinity" | "minus-infinitiy") {
        super("NotSafeNumberError", path, `This is not safe number.`)
    }
}
export const $stringNumber = $.string
    .compose(new $.Transformer<string, number>(i => $.ok(Number.parseFloat(i)), o => $.ok(o.toString())))
    .compose($safeNumber)

export function $range({ min, max }: { min?: number; max?: number }) {
    return new $.Transformer<number, number>(
        input => {
            if (min != null && min > input) {
                throw new ValidationRangeError([], "small", min, input)
            }
            if (max != null && max < input) {
                throw new ValidationRangeError([], "big", max, input)
            }
            return $.ok(input)
        },
        output => $.ok(output)
    )
}

export class ValidationRangeError extends $.ValidationError {
    constructor(
        readonly path: Array<string | number>,
        readonly direction: "big" | "small",
        readonly limit: number,
        readonly real: number
    ) {
        super("LengthError", path, `this is too ${direction}. limit is ${limit}, but actual value is ${real}`)
    }
}

export function $regexp(regexp: RegExp) {
    return new $.Transformer<string, string>(input => {
        return regexp.test(input) ? $.ok(input) : $.error(new ValidationInvalidFormatError([]))
    }, $.ok)
}

export class ValidationInvalidFormatError extends $.ValidationError {
    constructor(readonly path: Array<string | number>) {
        super("InvalidFormatError", path, `invalid format`)
    }
}

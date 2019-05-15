export function isNotNull<TValue>(value: TValue | undefined | null): value is TValue {
    return value != null
}

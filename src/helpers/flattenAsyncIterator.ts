export async function* flattenAsyncIterator<T>(iterables: Array<AsyncIterable<T>>) {
    for (const x of iterables) yield* x
}

export async function asyncIteratorToArray<T>(iterable?: AsyncIterable<T>): Promise<Array<Exclude<T, Error>>> {
    if (!iterable) return [];
    const arr: T[] = [];
    for await (const x of iterable) if (!(x instanceof Error)) arr.push(x);
    return arr as Array<Exclude<T, Error>>;
}

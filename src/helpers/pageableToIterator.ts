import { type PageIndicator, type Pageable, createIndicator } from '@masknet/shared-base';

export async function* pageableToIterator<T>(
    getPageable: (indicator?: PageIndicator) => Promise<Pageable<T> | void>,
    {
        maxSize = 25,
    }: {
        maxSize?: number;
    } = {},
) {
    let indicator = createIndicator();
    for (let i = 0; i < maxSize; i += 1) {
        try {
            const pageable = await getPageable(indicator);
            if (!pageable) return;
            yield* pageable.data;
            if (!pageable.nextIndicator) return;
            indicator = pageable.nextIndicator as PageIndicator;
        } catch (error) {
            yield new Error((error as Error).message);
        }
    }
}

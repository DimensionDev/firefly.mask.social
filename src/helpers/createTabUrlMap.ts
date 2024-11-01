import type { Source } from '@/constants/enum.js';

export function createTabUrlMap<T extends Source>(sources: T[], resolver: (source: T) => string) {
    const map: Record<Source, string> = sources.reduce<Record<string, string>>((map, source) => {
        return {
            ...map,
            [source]: resolver(source),
        };
    }, {});
    return map;
}

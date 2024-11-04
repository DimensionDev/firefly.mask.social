import type { Source } from '@/constants/enum.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

export function createSourceTabs<T extends Source>(sources: T[], resolver: (source: T) => string) {
    const tabs = sources.map((source) => {
        return {
            label: resolveSourceName(source),
            url: resolver(source),
            source,
        };
    });
    return tabs;
}

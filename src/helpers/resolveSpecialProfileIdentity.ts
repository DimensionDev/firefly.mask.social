// cSpell:disable
import type { Source } from '@/constants/enum.js';

const NOT_CASE_SENSITIVE: Record<string, string> = {
    realmasknetwork: 'realMaskNetwork',
};

export function resolveSpecialProfileIdentity<T extends { source: Source; id: string }>({ source, id }: T): T {
    const notCaseSensitive = NOT_CASE_SENSITIVE[id.toLowerCase()];
    if (notCaseSensitive) return { source, id: notCaseSensitive } as T;
    return { source, id } as T;
}

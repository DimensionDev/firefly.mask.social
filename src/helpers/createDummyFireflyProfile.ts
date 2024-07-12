import { Source } from '@/constants/enum.js';
import type { FireFlyProfile } from '@/providers/types/Firefly.js';

export function createDummyFireflyProfile(source: Source, identity = '', displayName = '') {
    return {
        source,
        identity,
        displayName,
        __origin__: null,
    } satisfies FireFlyProfile;
}

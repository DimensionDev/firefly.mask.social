import { useMemo } from 'react';

import type { Source } from '@/constants/enum.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

export function useFireflyIdentity<T extends Source>(source: T, id: string) {
    return useMemo<FireflyIdentity<T>>(
        () => ({
            source,
            id,
        }),
        [source, id],
    );
}

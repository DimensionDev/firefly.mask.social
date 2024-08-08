import { useMemo } from 'react';

import type { Source } from '@/constants/enum.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

export function useFireflyIdentity(source: Source, id: string) {
    return useMemo<FireflyIdentity>(
        () => ({
            source,
            id,
        }),
        [source, id],
    );
}

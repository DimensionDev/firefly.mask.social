import { compact } from 'lodash-es';

import type { Source } from '@/constants/enum.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';

export function getCurrentAvailableSources() {
    const currentProfileAll = getCurrentProfileAll();

    return compact(
        Object.entries(currentProfileAll).map(([source, profile]) => (profile ? (source as Source) : undefined)),
    );
}

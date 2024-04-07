import { compact } from 'lodash-es';

import type { SocialPlatform } from '@/constants/enum.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';

export function getCurrentAvailableSources() {
    const currentProfileAll = getCurrentProfileAll();

    return compact(
        Object.entries(currentProfileAll).map(([source, profile]) =>
            profile ? (source as SocialPlatform) : undefined,
        ),
    );
}

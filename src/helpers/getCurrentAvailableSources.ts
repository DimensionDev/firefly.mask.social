import { compact } from 'lodash-es';

import type { SocialSource } from '@/constants/enum.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';

export function getCurrentAvailableSources() {
    const currentProfileAll = getCurrentProfileAll();

    return compact(
        Object.entries(currentProfileAll).map(([source, profile]) => (profile ? (source as SocialSource) : undefined)),
    );
}

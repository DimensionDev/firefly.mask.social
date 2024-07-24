import { t } from '@lingui/macro';
import { compact } from 'lodash-es';

import { readChars } from '@/helpers/chars.js';
import type { CompositePost } from '@/store/useComposeStore.js';

export function getScheduleTaskContent(compositePost?: CompositePost) {
    const assets = compact([
        compositePost?.images.length ? t`[Photo]` : undefined,
        compositePost?.video ? t`[Video]` : undefined,
        compositePost?.poll ? t`[Poll]` : undefined,
    ]).join('');

    const chars = readChars(compositePost?.chars ?? '', 'visible');

    return `${chars}${chars.length > 0 ? '\n' : ''}${assets}`;
}

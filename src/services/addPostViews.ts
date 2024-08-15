import { getNavigatorSafe } from '@/helpers/bom.js';
import { hydrateLeafwatchViewerId } from '@/store/useLeafwatchPersistStore.js';

export function addPostViews(id: string) {
    const controller = getNavigatorSafe()?.serviceWorker.controller;
    const viewerId = hydrateLeafwatchViewerId();

    if (id && controller) {
        controller.postMessage({
            type: 'PUBLICATION_VISIBLE',
            id,
            viewerId,
        });
    }
}

import { hydrateLeafwatchViewerId } from '@/store/useLeafwatchPersistStore.js';

export function addPostViews(id: string) {
    const controller = typeof navigator === 'undefined' ? undefined : navigator.serviceWorker.controller;
    const viewerId = hydrateLeafwatchViewerId();

    if (id && controller) {
        controller.postMessage({
            type: 'PUBLICATION_VISIBLE',
            id,
            viewerId,
        });
    }
}

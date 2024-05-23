import { hydrateLeafwatchViewerId } from '@/store/useLeafwatchPersistStore.js';

export function addPostViews(id: string) {
    const viewerId = hydrateLeafwatchViewerId();

    if (id && navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller?.postMessage({
            type: 'PUBLICATION_VISIBLE',
            id,
            viewerId,
        });
    }
}

import { hydrateLeafwatchViewerId } from '@/store/useLeafwatchPersistStore.js';

export function addPostViews(id: string) {
    const viewerId = hydrateLeafwatchViewerId();

    if (id && (navigator as Navigator).serviceWorker.controller) {
        (navigator as Navigator).serviceWorker.controller?.postMessage({
            type: 'PUBLICATION_VISIBLE',
            id,
            viewerId,
        });
    }
}

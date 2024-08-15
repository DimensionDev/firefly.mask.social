import { bom } from '@/helpers/bom.js';
import { useLeafwatchPersistStore } from '@/store/useLeafwatchPersistStore.js';

export function addPostViews(id: string) {
    const controller = bom.navigator?.serviceWorker.controller;

    if (id && controller) {
        controller.postMessage({
            type: 'PUBLICATION_VISIBLE',
            id,
            viewerId: useLeafwatchPersistStore.getState().hydrateLeafwatchViewerId(),
        });
    }
}

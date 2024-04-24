import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Session } from '@/providers/types/Session.js';
import { syncSessionFromFirefly } from '@/services/syncSessionFromFirefly.js';

interface SyncSessionStoreState {
    synced: Session[];
    syncFromFirefly: (session: Session) => Promise<void>;
}

const useSyncSessionStoreBase = create<SyncSessionStoreState, [['zustand/immer', never]]>(
    immer((set) => ({
        synced: EMPTY_LIST,
        syncFromFirefly: async (session: Session) => {
            const syncedSessions = await syncSessionFromFirefly(session);
            set((state) => {
                state.synced = syncedSessions;
            });
        },
    })),
);

export const useSyncSessionStore = createSelectors(useSyncSessionStoreBase);

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Session } from '@/providers/types/Session.js';
import { syncSessionFromFirefly } from '@/services/syncSessionFromFirefly.js';

interface SyncSessionStoreState {
    sessions: Session[];
    sync: (session: Session) => Promise<void>;
    clear: () => void;
}

const useSyncSessionStoreBase = create<SyncSessionStoreState, [['zustand/immer', never]]>(
    immer((set) => ({
        sessions: EMPTY_LIST,
        sync: async (session: Session) => {
            const syncedSessions = await syncSessionFromFirefly(session);
            set((state) => {
                state.sessions = syncedSessions;
            });
        },
        clear: () => {
            set((state) => {
                state.sessions = EMPTY_LIST;
            });
        },
    })),
);

export const useSyncSessionStore = createSelectors(useSyncSessionStoreBase);

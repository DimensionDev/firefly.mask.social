import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';

interface ComposeScheduleState {
    // The time set for sending. if not present, means it's not a scheduled sending task.
    scheduleTime?: Date;

    updateScheduleTime: (time: Date) => void;
    clearScheduleTime: () => void;
}

const useComposeScheduleStoreBase = create<ComposeScheduleState, [['zustand/immer', never]]>(
    immer<ComposeScheduleState>((set) => ({
        updateScheduleTime: (time) =>
            set((state) => {
                state.scheduleTime = time;
            }),
        clearScheduleTime: () =>
            set((state) => {
                state.scheduleTime = undefined;
            }),
    })),
);

export const useComposeScheduleStateStore = createSelectors(useComposeScheduleStoreBase);

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';

interface NavigatorState {
    title: string;
    updateTitle: (title: string) => void;
}

const useNavigatorStateBase = create<NavigatorState, [['zustand/immer', never]]>(
    immer((set) => ({
        title: 'Firefly',
        updateTitle: (title: string) =>
            set((state) => {
                state.title = title;
            }),
    })),
);

export const useNavigatorState = createSelectors(useNavigatorStateBase);

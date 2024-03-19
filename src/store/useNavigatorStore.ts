import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';

interface NavigatorState {
    title: string;
    sidebarOpen: boolean;
    updateTitle: (title: string) => void;
    updateSidebarOpen: (open: boolean) => void;
}

const useNavigatorStateBase = create<NavigatorState, [['zustand/immer', never]]>(
    immer((set) => ({
        title: '',
        sidebarOpen: false,
        updateTitle: (title: string) =>
            set((state) => {
                state.title = title;
            }),
        updateSidebarOpen: (open: boolean) =>
            set((state) => {
                state.sidebarOpen = open;
            }),
    })),
);

export const useNavigatorState = createSelectors(useNavigatorStateBase);

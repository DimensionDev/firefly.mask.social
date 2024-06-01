import { EMPTY_LIST } from '@masknet/shared-base';
import { type Draft as WritableDraft } from 'immer';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createPersistStorage } from '@/helpers/createPersistStorage.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import type { ComposeBaseState } from '@/store/useComposeStore.js';

export interface Draft extends ComposeBaseState {
    draftId: string;
    createdAt: Date;
    availableProfiles: Profile[];
}

interface ComposeDraftState {
    drafts: Draft[];
    addDraft: (draft: Draft) => void;
    removeDraft: (id: string) => void;
}

const useComposeStateBase = create<ComposeDraftState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer<ComposeDraftState>((set) => ({
            drafts: EMPTY_LIST,
            addDraft: (draft: Draft) =>
                set((state) => {
                    const index = state.drafts.findIndex((x) => x.draftId === draft.draftId);
                    if (index === -1) {
                        state.drafts = [...state.drafts, draft] as Array<WritableDraft<Draft>>;
                    } else {
                        state.drafts = [
                            ...state.drafts.slice(0, index),
                            draft,
                            ...state.drafts.slice(index + 1),
                        ] as Array<WritableDraft<Draft>>;
                    }
                }),
            removeDraft: (draftId: string) => {
                set((state) => {
                    state.drafts = state.drafts.filter((x) => x.draftId !== draftId);
                });
            },
        })),
        {
            storage: createPersistStorage<{ drafts: Draft[] }>('firefly-compose-state'),
            partialize: (state) => ({ drafts: state.drafts }),
            name: 'firefly-compose-state',
        },
    ),
);

export const useComposeDraftStateStore = createSelectors(useComposeStateBase);

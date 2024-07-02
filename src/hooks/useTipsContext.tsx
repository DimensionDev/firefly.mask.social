import { useState } from 'react';
import { createContainer } from 'unstated-next';

import type { FireFlyProfile, Profile } from '@/providers/types/Firefly.js';
import type { TipsToken } from '@/types/token.js';

export type TipsProfile = FireFlyProfile & { address: `0x${string}` };

interface TipsContext {
    receiverList: TipsProfile[];
    receiver: TipsProfile | null;
    amount: string;
    token: TipsToken | null;
    handle: string | null;
    hash: string | null;
    pureWallet: boolean;
    socialProfiles: Profile[];
}

function createEmptyContext(): TipsContext {
    return {
        receiver: null,
        amount: '',
        token: null,
        receiverList: [],
        handle: null,
        hash: null,
        pureWallet: false,
        socialProfiles: [],
    };
}

function useTipsContext(initialState?: TipsContext) {
    const [value, setValue] = useState<TipsContext>(initialState ?? createEmptyContext());

    return {
        ...value,
        update: setValue,
        reset: () => setValue(createEmptyContext()),
    };
}

export const TipsContext = createContainer(useTipsContext);

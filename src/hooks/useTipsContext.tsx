import { useState } from 'react';
import { createContainer } from 'unstated-next';

import type { NetworkType } from '@/constants/enum.js';
import type { FireFlyProfile, Profile } from '@/providers/types/Firefly.js';
import type { Token } from '@/providers/types/Transfer.js';

export type TipsProfile = FireFlyProfile & { address: `0x${string}`; blockchain: NetworkType };

interface TipsContext {
    receiverList: TipsProfile[];
    receiver: TipsProfile | null;
    amount: string;
    token: Token | null;
    handle: string | null;
    hash: string | null;
    pureWallet: boolean;
    socialProfiles: Profile[];
    isSending: boolean;
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
        isSending: false,
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

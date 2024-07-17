import { useState } from 'react';
import { createContainer } from 'unstated-next';

import type { NetworkType } from '@/constants/enum.js';
import type { FireflyProfile, Profile } from '@/providers/types/Firefly.js';
import type { Token } from '@/providers/types/Transfer.js';

export type TipsProfile = FireflyProfile & { address: string; networkType: NetworkType };

interface TipsContext {
    recipientList: TipsProfile[];
    recipient: TipsProfile | null;
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
        recipient: null,
        amount: '',
        token: null,
        recipientList: [],
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

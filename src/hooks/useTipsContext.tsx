import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

import { type NetworkType, Source } from '@/constants/enum.js';
import type { FireflyIdentity, FireflyProfile, Profile } from '@/providers/types/Firefly.js';
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
    identity: FireflyIdentity;
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
        identity: {
            id: ZERO_ADDRESS,
            source: Source.Wallet,
        },
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

'use client';

import { useState } from 'react';
import { createContainer } from 'unstated-next';

import { Source } from '@/constants/enum.js';
import { createDummyFireflyProfile } from '@/helpers/createDummyFireflyProfile.js';

interface FireflyProfileState {
    source: Source;
    identity?: string;
}

function useFireflyProfileContext(initialState?: FireflyProfileState) {
    const [value, setValue] = useState<FireflyProfileState>(initialState ?? { source: Source.Farcaster });

    return {
        fireflyProfile: createDummyFireflyProfile(value.source, value.identity),
        updateFireflyProfile: setValue,
    };
}

export const FireflyProfileContext = createContainer(useFireflyProfileContext);

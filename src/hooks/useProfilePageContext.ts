import { produce } from 'immer';
import { useCallback, useState } from 'react';
import { createContainer } from 'unstated-next';

import type { ProfileCategory, SocialSource } from '@/constants/enum.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

interface ProfilePageContext {
    identity: FireflyIdentity | null;
    category: ProfileCategory | null;
}

function createEmptyContext(): ProfilePageContext {
    return {
        identity: null,
        category: null,
    };
}

function useProfilePageContext(initialState?: ProfilePageContext) {
    const [value, setValue] = useState<ProfilePageContext>(initialState ?? createEmptyContext());

    const setCategory = useCallback(
        (category: ProfileCategory) => {
            setValue((x) =>
                produce(x, (ctx) => {
                    ctx.category = category;
                }),
            );
            if (value.identity?.source && value.identity?.id) {
                history.replaceState(
                    undefined,
                    '',
                    resolveProfileUrl(value.identity.source as SocialSource, value.identity.id, category),
                );
            }
        },
        [value.identity?.source, value.identity?.id],
    );

    return {
        ...value,
        update: setValue,
        setCategory,
        reset: () => setValue(createEmptyContext()),
    };
}

export const ProfilePageContext = createContainer(useProfilePageContext);

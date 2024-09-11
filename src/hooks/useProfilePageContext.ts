import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import urlcat from 'urlcat';

import { type ProfileCategory } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

interface ProfilePageContext {
    category: ProfileCategory | null;
    identity: FireflyIdentity | null;
    pathname: string;
}

function createEmptyContext(): ProfilePageContext {
    return {
        category: null,
        identity: null,
        pathname: '/profile/:id/:category',
    };
}

function useProfilePageContext(initialState?: ProfilePageContext) {
    const [value, setValue] = useState<ProfilePageContext>(initialState ?? createEmptyContext());

    useEffect(() => {
        if (value.category && value.identity?.id && value.identity?.source) {
            // resolve next.js app router shallow https://github.com/vercel/next.js/discussions/48110
            history.replaceState(
                undefined,
                '',
                urlcat(value.pathname, {
                    id: value.identity.id,
                    category: value.category,
                    source: resolveSourceInURL(value.identity.source),
                }),
            );
        }
    }, [value.identity?.id, value.category, value.pathname, value.identity?.source]);

    return {
        ...value,
        update: setValue,
        reset: () => setValue(createEmptyContext()),
    };
}

export const ProfilePageContext = createContainer(useProfilePageContext);

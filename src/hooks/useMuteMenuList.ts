import { t } from '@lingui/macro';
import { filter } from 'lodash-es';
import { useMemo } from 'react';

import { MuteMenuId, type SocialSource, Source } from '@/constants/enum.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';

export interface MuteMenu {
    id: MuteMenuId;
    name: string;
    source: SocialSource;
    type: 'user' | 'channel';
    disabled: boolean;
}

export const useMuteMenuList = (): MuteMenu[] => {
    const profiles = useCurrentProfileAll();

    const menuList = useMemo(() => {
        const fullMuteMenuList: MuteMenu[] = [
            {
                id: MuteMenuId.FarcasterUsers,
                name: t`Farcaster Users`,
                source: Source.Farcaster,
                type: 'user',
                disabled: true,
            },
            {
                id: MuteMenuId.FarcasterChannels,
                name: t`Farcaster Channels`,
                source: Source.Farcaster,
                type: 'channel',
                disabled: true,
            },
            {
                id: MuteMenuId.LensUsers,
                name: t`Lens Users`,
                source: Source.Lens,
                type: 'user',
                disabled: false,
            },
            {
                id: MuteMenuId.XUsers,
                name: t`X Users`,
                source: Source.Twitter,
                type: 'user',
                disabled: false,
            },
        ];
        return filter(fullMuteMenuList, (menu) => !!profiles[menu.source] && !menu.disabled);
    }, [profiles]);

    return menuList;
};

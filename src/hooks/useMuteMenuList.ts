import { t } from '@lingui/macro';
import { filter } from 'lodash-es';
import { useMemo } from 'react';

import { MuteMenuId, type SocialSource, Source } from '@/constants/enum.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

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
                name: t`${resolveSourceName(Source.Farcaster)} Users`,
                source: Source.Farcaster,
                type: 'user',
                disabled: true,
            },
            {
                id: MuteMenuId.FarcasterChannels,
                name: t`${resolveSourceName(Source.Farcaster)} Channels`,
                source: Source.Farcaster,
                type: 'channel',
                disabled: true,
            },
            {
                id: MuteMenuId.LensUsers,
                name: t`${resolveSourceName(Source.Lens)} Users`,
                source: Source.Lens,
                type: 'user',
                disabled: false,
            },
            {
                id: MuteMenuId.XUsers,
                name: t`${resolveSourceName(Source.Twitter)} Users`,
                source: Source.Twitter,
                type: 'user',
                disabled: false,
            },
        ];
        return filter(fullMuteMenuList, (menu) => !!profiles[menu.source] && !menu.disabled);
    }, [profiles]);

    return menuList;
};

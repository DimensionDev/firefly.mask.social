import { t } from '@lingui/macro';
import { filter } from 'lodash-es';
import { useMemo } from 'react';

import { MuteMenuId, type SocialSource, Source } from '@/constants/enum.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';

export interface MuteMenu {
    id: MuteMenuId;
    name: string;
    source: SocialSource;
    type: 'profile' | 'channel';
    disabled: boolean;
}

export const useMuteMenuList = (): MuteMenu[] => {
    const profiles = useCurrentProfileAll();

    const menuList = useMemo(() => {
        const fullMuteMenuList: MuteMenu[] = [
            {
                id: MuteMenuId.FarcasterProfiles,
                name: t`${resolveSourceName(Source.Farcaster)} Users`,
                source: Source.Farcaster,
                type: 'profile',
                disabled: false,
            },
            {
                id: MuteMenuId.FarcasterChannels,
                name: t`${resolveSourceName(Source.Farcaster)} Channels`,
                source: Source.Farcaster,
                type: 'channel',
                disabled: false,
            },
            {
                id: MuteMenuId.LensProfiles,
                name: t`${resolveSourceName(Source.Lens)} Users`,
                source: Source.Lens,
                type: 'profile',
                disabled: false,
            },
            {
                id: MuteMenuId.XProfiles,
                name: t`${resolveSourceName(Source.Twitter)} Users`,
                source: Source.Twitter,
                type: 'profile',
                disabled: false,
            },
        ];
        return filter(fullMuteMenuList, (menu) => !!profiles[menu.source] && !menu.disabled);
    }, [profiles]);

    return menuList;
};

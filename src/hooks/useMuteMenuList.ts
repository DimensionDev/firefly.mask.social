import { t } from '@lingui/macro';
import { filter } from 'lodash-es';
import { useMemo } from 'react';

import { MuteType, Source } from '@/constants/enum.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';

export interface MuteMenu {
    name: string;
    source: Source;
    type: MuteType;
    shouldHide: () => boolean;
}

export const useMuteMenuList = (): MuteMenu[] => {
    const profiles = useCurrentProfileAll();

    const menuList = useMemo(() => {
        const fullMuteMenuList: MuteMenu[] = [
            {
                name: t`${resolveSourceName(Source.Farcaster)} muted users`,
                source: Source.Farcaster,
                type: MuteType.Profile,
                shouldHide: () => !profiles[Source.Farcaster],
            },
            {
                name: t`${resolveSourceName(Source.Farcaster)} muted channels`,
                source: Source.Farcaster,
                type: MuteType.Channel,
                shouldHide: () => !profiles[Source.Farcaster],
            },
            {
                name: t`${resolveSourceName(Source.Lens)} muted users`,
                source: Source.Lens,
                type: MuteType.Profile,
                shouldHide: () => !profiles[Source.Lens],
            },
            {
                name: t`${resolveSourceName(Source.Twitter)} muted users`,
                source: Source.Twitter,
                type: MuteType.Profile,
                shouldHide: () => !profiles[Source.Twitter],
            },
            {
                name: t`Muted wallets`,
                source: Source.Firefly,
                type: MuteType.Wallet,
                shouldHide: () => Object.keys(profiles).length === 0,
            },
        ];
        return filter(fullMuteMenuList, (menu) => !menu.shouldHide());
    }, [profiles]);

    return menuList;
};

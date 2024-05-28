import { t } from '@lingui/macro';

import { type SocialSource, Source } from "@/constants/enum.js";

export interface MuteMenu {
    id: string;
    name: string;
    source: SocialSource;
    type: 'user' | 'channel';
    disabled: boolean;
}

export const getFullMuteMenuList = (): MuteMenu[] => [
    {
        id: '1',
        name: t`Farcaster Users`,
        source: Source.Farcaster,
        type: 'user',
        disabled: false,
    },
    {
        id: '2',
        name: t`Farcaster Channels`,
        source: Source.Farcaster,
        type: 'channel',
        disabled: false,
    },
    {
        id: '3',
        name: t`Lens Users`,
        source: Source.Lens,
        type: 'user',
        disabled: false,
    },
    {
        id: '4',
        name: t`X Users`,
        source: Source.Twitter,
        type: 'user',
        disabled: false,
    }
];

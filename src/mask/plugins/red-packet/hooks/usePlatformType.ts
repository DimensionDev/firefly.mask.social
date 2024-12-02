import { type PostContextAuthor, usePostInfoDetails } from '@masknet/plugin-infra/content-script';

import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

const map: Record<NonNullable<PostContextAuthor['source']>, FireflyRedPacketAPI.PlatformType> = {
    Lens: FireflyRedPacketAPI.PlatformType.lens,
    Farcaster: FireflyRedPacketAPI.PlatformType.farcaster,
    Twitter: FireflyRedPacketAPI.PlatformType.twitter,
};

export function usePlatformType() {
    const source = usePostInfoDetails.source?.();
    if (!source) return '';
    return map[source];
}

import { PlatformType } from '@/providers/types/RedPacket.js';
import { type PostContextAuthor, usePostInfoDetails } from '@masknet/plugin-infra/content-script';

const map: Record<NonNullable<PostContextAuthor['source']>, PlatformType> = {
    Lens: PlatformType.lens,
    Farcaster: PlatformType.farcaster,
    Twitter: PlatformType.twitter,
};

export function usePlatformType() {
    const source = usePostInfoDetails.source?.();
    if (!source) return '';
    return map[source];
}

'use client';

import { SocialProfileContentList } from '@/components/Profile/SocialProfileContentList.js';
import { WalletProfileContentList } from '@/components/Profile/WalletProfileContentList.js';
import { type ProfileCategory, SocialProfileCategory, Source, WalletProfileCategory } from '@/constants/enum.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

export function ProfilePageTimeline({
    identity = null,
    category,
}: {
    identity?: FireflyIdentity | null;
    category: ProfileCategory;
}) {
    if (identity?.source === Source.Wallet) {
        return <WalletProfileContentList type={category as WalletProfileCategory} address={identity.id} />;
    }
    if (identity && isSocialSource(identity.source)) {
        return (
            <SocialProfileContentList
                type={category as SocialProfileCategory}
                source={identity.source}
                profileId={identity.id}
            />
        );
    }
    return null;
}

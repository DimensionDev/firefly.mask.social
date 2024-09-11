'use client';

import { Suspense } from 'react';

import { Loading } from '@/components/Loading.js';
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
        return (
            <Suspense fallback={<Loading />}>
                <WalletProfileContentList type={category as WalletProfileCategory} address={identity.id} />;
            </Suspense>
        );
    }
    if (identity && isSocialSource(identity.source)) {
        return (
            <Suspense fallback={<Loading />}>
                <SocialProfileContentList
                    type={category as SocialProfileCategory}
                    source={identity.source}
                    profileId={identity.id}
                />
            </Suspense>
        );
    }
    return null;
}

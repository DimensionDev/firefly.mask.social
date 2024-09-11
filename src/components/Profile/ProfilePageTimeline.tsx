'use client';

import { ProfileContentTabs } from '@/components/Profile/ProfileContentTabs.js';
import { WalletTabs } from '@/components/Profile/WalletTabs.js';
import { Source } from '@/constants/enum.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

export function ProfilePageTimeline({ identity = null }: { identity?: FireflyIdentity | null }) {
    if (identity?.source === Source.Wallet) {
        return <WalletTabs address={identity.id} />;
    }
    if (identity && isSocialSource(identity.source)) {
        return <ProfileContentTabs source={identity.source} profileId={identity.id} />;
    }
    return null;
}

import { safeUnreachable } from '@masknet/kit';

import { Source, SourceInURL } from '@/constants/enum.js';
import type { Account } from '@/providers/types/Account.js';
import type { AllConnections } from '@/providers/types/Firefly.js';
import { ProfileStatus } from '@/providers/types/SocialMedia.js';
import { useThirdPartyStateStore } from '@/store/useProfileStore.js';

const defaultProfileData = {
    pfp: '',
    followerCount: 0,
    followingCount: 0,
    status: ProfileStatus.Active,
    verified: true,
    source: Source.Farcaster,
};

export function formatAccountFromConnections(
    platform: SourceInURL.Google | SourceInURL.Telegram | SourceInURL.Apple,
    allConnections?: AllConnections,
): Account | undefined {
    if (!allConnections) return;

    switch (platform) {
        case SourceInURL.Google:
        case SourceInURL.Apple:
            const connection = allConnections[platform]?.connected?.[0];
            if (!connection) return;

            return {
                profile: {
                    profileId: connection.id,
                    profileSource: platform === SourceInURL.Google ? Source.Google : Source.Apple,
                    displayName: connection.email,
                    handle: connection.email,
                    fullHandle: connection.email,
                    ...defaultProfileData,
                },
                session: useThirdPartyStateStore.getState().currentProfileSession,
            } as Account;
        case SourceInURL.Telegram:
            const tgConnection = allConnections.telegram?.connected?.[0];
            if (!tgConnection) return;

            return {
                profile: {
                    profileId: tgConnection.id,
                    profileSource: Source.Telegram,
                    displayName: tgConnection.handle,
                    handle: tgConnection.handle,
                    fullHandle: tgConnection.handle,
                    ...defaultProfileData,
                },
                session: useThirdPartyStateStore.getState().currentProfileSession,
            } as Account;
        default:
            safeUnreachable(platform);
            return;
    }
}

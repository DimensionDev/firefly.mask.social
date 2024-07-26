import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import type { FireflyProfile, WalletProfile } from '@/providers/types/Firefly.js';
import type { ProfileTab } from '@/store/useProfileTabStore.js';

export function resolveFireflyProfiles(
    profileTab: ProfileTab,
    profiles: FireflyProfile[],
): { socialProfile: FireflyProfile | null; walletProfile: WalletProfile | null } {
    if (!profileTab.identity)
        return {
            socialProfile: null,
            walletProfile: null,
        };
    return {
        socialProfile:
            profiles.find(
                (x) =>
                    SORTED_SOCIAL_SOURCES.includes(x.source as SocialSource) &&
                    x.source === profileTab.source &&
                    x.identity === profileTab.identity,
            ) ?? null,
        walletProfile:
            (profiles.find((x) => x.source === Source.Wallet && isSameAddress(x.identity, profileTab.identity))?.__origin__ as
                | WalletProfile
                | undefined) ?? null,
    };
}

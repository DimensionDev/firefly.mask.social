import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import type { FireflyIdentity, FireflyProfile, WalletProfile } from '@/providers/types/Firefly.js';

export function resolveFireflyProfiles(
    profileTab: FireflyIdentity,
    profiles: FireflyProfile[],
): { socialProfile: FireflyProfile | null; walletProfile: WalletProfile | null } {
    if (!profileTab.id)
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
                    x.identity === profileTab.id,
            ) ?? null,
        walletProfile:
            (profiles.find((x) => x.source === Source.Wallet && isSameAddress(x.identity, profileTab.id))
                ?.__origin__ as WalletProfile | undefined) ?? null,
    };
}

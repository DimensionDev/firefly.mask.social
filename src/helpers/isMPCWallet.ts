import { RelatedWalletSource, type WalletProfile } from '@/providers/types/Firefly.js';

export function isMPCWallet(profile: WalletProfile) {
    return profile.verifiedSources?.some((x) => x.source !== RelatedWalletSource.particle);
}

import { Source } from '@/constants/enum.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import type { FireflyIdentity, FireflyProfile } from '@/providers/types/Firefly.js';

export function isSameFireflyIdentity(identity?: FireflyIdentity, otherIdentity?: FireflyIdentity) {
    if (!identity || !otherIdentity) return false;

    if (identity.source === Source.Wallet || otherIdentity.source === Source.Wallet) {
        return isSameAddress(identity.id, otherIdentity.id);
    }

    return identity.source === otherIdentity.source && identity.id === otherIdentity.id;
}

export function isSameFireflyProfile(profile?: FireflyProfile, otherProfile?: FireflyProfile) {
    if (!profile || !otherProfile) return false;
    return isSameFireflyIdentity(
        { source: profile.source, id: profile.identity },
        { source: otherProfile.source, id: otherProfile.identity },
    );
}

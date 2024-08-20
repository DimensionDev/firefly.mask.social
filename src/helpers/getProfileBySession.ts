import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import { NotAllowedError, UnreachableError } from '@/constants/error.js';
import { createLensSDKForSession, MemoryStorageProvider } from '@/helpers/createLensSDK.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { LensSession } from '@/providers/lens/Session.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export async function getProfileBySession(session: Session, signal?: AbortSignal) {
    switch (session.type) {
        case SessionType.Twitter: {
            const twitterSession = session as TwitterSession;
            return TwitterSocialMediaProvider.getProfileByIdWithSessionPayload(
                twitterSession.profileId,
                twitterSession.payload,
            );
        }
        case SessionType.Lens: {
            const lensSession = session as LensSession;
            if (!lensSession.refreshToken) return null;

            const sdk = createLensSDKForSession(new MemoryStorageProvider(), lensSession);
            const profileId = await sdk.authentication.getProfileId();
            if (!profileId) return null;

            const provider = resolveSocialMediaProvider(Source.Lens);
            return provider.getProfileById(lensSession.profileId);
        }
        case SessionType.Farcaster:
            const farcasterSession = session as FarcasterSession;
            const provider = resolveSocialMediaProvider(Source.Farcaster);
            return provider.getProfileById(farcasterSession.profileId);
        case SessionType.Firefly:
            throw new NotAllowedError();
        case SessionType.Wallet:
            throw new NotAllowedError();
        default:
            safeUnreachable(session.type);
            throw new UnreachableError('session type', session);
    }
}

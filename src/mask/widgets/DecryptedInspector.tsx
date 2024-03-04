'use client';

import type { IdentityResolved } from '@masknet/plugin-infra';
import { useAsync } from 'react-use';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.js';
import { farcasterClient } from '@/configs/farcasterClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import type { EncryptedPayload } from '@/helpers/getEncryptedPayload.js';
import { DecryptedPost } from '@/mask/widgets/components/DecryptedPost.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

interface DecryptedInspectorProps {
    post?: Post;
    payloads?: EncryptedPayload[];
}

export default function DecryptedInspector({ post, payloads }: DecryptedInspectorProps) {
    const lensProfile = useLensStateStore.use.currentProfile();
    const farcasterProfile = useFarcasterStateStore.use.currentProfile();
    useAsync(async () => {
        const identity: IdentityResolved = {};
        if (post?.source === SocialPlatform.Lens) {
            const lensToken = await LensSocialMediaProvider.getAccessToken();
            identity.lensToken = lensToken.unwrap();
            identity.profileId = lensProfile?.profileId;
        } else if (post?.source === SocialPlatform.Farcaster) {
            const session = farcasterClient.getSession();
            if (session) {
                const { messageHash, messageSignature, signer } =
                    await HubbleSocialMediaProvider.generateSignaturePacket();
                Object.assign(identity, {
                    farcasterMessage: messageHash,
                    farcasterSignature: messageSignature,
                    farcasterSigner: signer,
                    profileId: farcasterProfile?.profileId,
                } satisfies IdentityResolved);
            }
        }
        import('@/helpers/setupCurrentVisitingProfile.js').then((module) => {
            module.setupMyProfile(identity);
        });
    }, [lensProfile?.profileId, farcasterProfile?.profileId]);

    if (!post || !payloads?.length) return null;

    return (
        <Providers>
            <MaskProviders>
                <DecryptedPost post={post} payloads={payloads} />
            </MaskProviders>
        </Providers>
    );
}

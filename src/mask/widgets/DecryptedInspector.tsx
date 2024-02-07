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

interface DecryptedInspectorProps {
    post?: Post;
    payloads?: EncryptedPayload[];
}

export default function DecryptedInspector({ post, payloads }: DecryptedInspectorProps) {
    useAsync(async () => {
        const identity: IdentityResolved = {};
        if (post?.source === SocialPlatform.Lens) {
            const lensToken = await LensSocialMediaProvider.getAccessToken();
            identity.lensToken = lensToken.unwrap();
        } else if (post?.source === SocialPlatform.Farcaster) {
            const session = farcasterClient.getSession();
            if (session) {
                const { messageHash, messageSignature, signer } =
                    await HubbleSocialMediaProvider.generateSignaturePacket();
                Object.assign(identity, {
                    farcasterMessage: messageHash,
                    farcasterSignature: messageSignature,
                    farcasterSigner: signer,
                } satisfies IdentityResolved);
            }
        }
        import('@/helpers/setupCurrentVisitingProfile.js').then((module) => {
            module.setupMyProfile(identity);
        });
    }, []);
    if (!post || !payloads?.length) return null;

    return (
        <Providers>
            <MaskProviders>
                <DecryptedPost post={post} payloads={payloads} />
            </MaskProviders>
        </Providers>
    );
}

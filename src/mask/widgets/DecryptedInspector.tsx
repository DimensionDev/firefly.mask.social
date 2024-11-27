'use client';

import { useAsync } from 'react-use';

import { Providers } from '@/components/Providers.js';
import type { EncryptedPayload } from '@/helpers/getEncryptedPayload.js';
import type { IdentityResolved } from '@/mask/bindings/index.js';
import { MaskProviders } from '@/mask/components/MaskProviders.js';
import { getCurrentProfile, updateMyProfile } from '@/mask/helpers/createMaskContext.js';
import { DecryptedPost } from '@/mask/widgets/components/DecryptedPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { resolveIdentity } from '@/services/resolveIdentity.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

interface DecryptedInspectorProps {
    post?: Post;
    payloads?: EncryptedPayload[];
}

export default function DecryptedInspector({ post, payloads }: DecryptedInspectorProps) {
    const lensProfile = useLensStateStore.use.currentProfile();
    const farcasterProfile = useFarcasterStateStore.use.currentProfile();
    useAsync(async () => {
        const identity: IdentityResolved = post?.source ? await resolveIdentity(post.source) : {};
        const myProfile = getCurrentProfile();
        if (!myProfile) {
            import('@/helpers/setupCurrentVisitingProfile.js').then((module) => {
                module.setupMyProfile(identity);
            });
        } else {
            updateMyProfile(identity);
        }
    }, [post?.source, lensProfile?.profileId, farcasterProfile?.profileId]);

    if (!post || !payloads?.length) return null;

    return (
        <Providers enableParticle={false}>
            <MaskProviders>
                <DecryptedPost post={post} payloads={payloads} />
            </MaskProviders>
        </Providers>
    );
}

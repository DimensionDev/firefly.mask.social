'use client';

import { useAsync } from 'react-use';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.js';
import type { EncryptedPayload } from '@/helpers/getEncryptedPayload.js';
import { DecryptedPost } from '@/mask/widgets/components/DecryptedPost.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface DecryptedInspectorProps {
    post?: Post;
    payloads?: EncryptedPayload[];
}

export default function DecryptedInspector({ post, payloads }: DecryptedInspectorProps) {
    useAsync(async () => {
        const lensToken = await LensSocialMediaProvider.getAccessToken();
        import('@/helpers/setupCurrentVisitingProfile.js').then((module) =>
            module.setupMyProfile({
                lensToken: lensToken.unwrap(),
            }),
        );
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

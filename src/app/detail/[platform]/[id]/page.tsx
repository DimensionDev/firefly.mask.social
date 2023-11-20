'use client';

import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { FireflySocialMediaprovider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useSuspenseQuery } from '@tanstack/react-query';

export default function Page({ params }: { params: { id: string; platform: string } }) {
    const { data } = useSuspenseQuery({
        queryKey: [params.platform, 'post-detail', params.id],
        queryFn: async () => {
            if (!params.id) return;
            switch (params.platform) {
                case SocialPlatform.Lens.toLowerCase():
                    return LensSocialMediaProvider.getPostById(params.id);
                case SocialPlatform.Farcaster.toLowerCase():
                    return FireflySocialMediaProvider.getPostById(params.id);
                default:
                    return;
            }
        },
    });

    if (!data) return;
    return <SinglePost post={data} />;
}

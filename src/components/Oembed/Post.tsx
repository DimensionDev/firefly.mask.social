import { safeUnreachable } from '@masknet/kit';
import { useSuspenseQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { Quote } from '@/components/Posts/Quote.js';
import { SocialPlatform } from '@/constants/enum.js';
import { resolveSource, type SourceInURL } from '@/helpers/resolveSource.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface PostEmbedProps {
    id: string;
    source: SourceInURL;
}

export const PostEmbed = memo<PostEmbedProps>(function PostEmbed({ id, source }) {
    const currentSource = resolveSource(source);
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data } = useSuspenseQuery({
        queryKey: [currentSource, 'post-detail', id],
        queryFn: async () => {
            if (!id) return;
            switch (currentSource) {
                case SocialPlatform.Lens: {
                    const post = await LensSocialMediaProvider.getPostById(id);
                    fetchAndStoreViews([post.postId]);
                    return post;
                }
                case SocialPlatform.Farcaster: {
                    const post = await FarcasterSocialMediaProvider.getPostById(id);
                    return post;
                }
                default:
                    safeUnreachable(currentSource);
                    return;
            }
        },
    });

    if (!data) return;

    return <Quote post={data} />;
});

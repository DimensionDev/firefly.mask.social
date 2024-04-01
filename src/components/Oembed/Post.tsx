import { useSuspenseQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { Quote } from '@/components/Posts/Quote.js';
import { SocialPlatform, type SourceInURL } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface PostEmbedProps {
    id: string;
    source: SourceInURL;
}

export const PostEmbed = memo<PostEmbedProps>(function PostEmbed({ id, source }) {
    const currentSource = resolveSocialPlatform(source);
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data } = useSuspenseQuery({
        queryKey: [currentSource, 'post-detail', id],
        queryFn: async () => {
            if (!id) return null;

            const provider = resolveSocialMediaProvider(currentSource);
            if (!provider) return null;

            try {
                const post = await provider.getPostById(id);
                if (currentSource === SocialPlatform.Lens) fetchAndStoreViews([post.postId]);
                return post;
            } catch {
                return null;
            }
        },
    });

    if (!data) return;

    return <Quote post={data} />;
});

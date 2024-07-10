'use client';
import 'swiper/css';
import 'swiper/css/keyboard';
import 'swiper/css/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation.js';

import { PreviewMedia } from '@/components/PreviewMedia/index.js';
import type { SocialSourceInURL } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

interface Props {
    params: {
        id: string;
        index: string;
    };
    searchParams: { source: SocialSourceInURL };
}

export default function PreviewPhotoModal({ params: { id: postId, index }, searchParams: { source } }: Props) {
    const router = useRouter();

    const currentSource = resolveSocialSource(source);

    const { data: post } = useSuspenseQuery({
        queryKey: [currentSource, 'post-detail', postId],
        queryFn: async () => {
            if (!postId) return;

            const provider = resolveSocialMediaProvider(currentSource);
            const post = await provider.getPostById(postId);
            if (!post) return;

            return post;
        },
        // The image data of the post will not be changed.
        staleTime: Infinity,
    });

    return <PreviewMedia open post={post} source={currentSource} index={index} onClose={() => router.back()} />;
}

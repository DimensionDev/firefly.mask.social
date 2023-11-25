'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export default function Page({ params }: { params: { id: string; platform: string } }) {
    return <h2>Hello There!</h2>;
}

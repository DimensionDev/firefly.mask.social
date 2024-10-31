import { redirect } from 'next/navigation.js';
import urlcat from 'urlcat';

import type { SocialSourceInURL } from '@/constants/enum.js';

interface Props {
    params: {
        id: string;
        index: string;
    };
    searchParams: { source: SocialSourceInURL };
}

export default function Photo({ params: { id: postId }, searchParams: { source } }: Props) {
    redirect(urlcat('/post/:id', { id: postId, source }));
    return null;
}

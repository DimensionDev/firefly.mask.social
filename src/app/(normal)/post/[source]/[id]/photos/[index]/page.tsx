import { redirect } from 'next/navigation.js';
import urlcat from 'urlcat';

import type { SocialSourceInURL } from '@/constants/enum.js';

interface Props {
    params: Promise<{
        id: string;
        index: string;
    }>;
    searchParams: Promise<{ source: SocialSourceInURL }>;
}

export default async function Photo(props: Props) {
    const searchParams = await props.searchParams;
    const { source } = searchParams;
    const params = await props.params;
    const { id: postId } = params;

    redirect(urlcat('/post/:source/:id', { id: postId, source }));
}

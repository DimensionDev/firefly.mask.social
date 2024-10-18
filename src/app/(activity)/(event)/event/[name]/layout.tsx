import type { ReactNode } from 'react';

import { KeyType } from '@/constants/enum.js';
import { createMetadataEventDetailPage } from '@/helpers/createMetadataEventDetailPage.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';

const createPageMetadata = memoizeWithRedis(createMetadataEventDetailPage, {
    key: KeyType.CreateMetadataEvent,
});

interface Props {
    params: {
        name: string;
    };
}

export async function generateMetadata({ params }: Props) {
    return createPageMetadata(params.name);
}

export default function Layout({ children }: { children: ReactNode }) {
    return children;
}

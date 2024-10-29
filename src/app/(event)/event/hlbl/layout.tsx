import type { ReactNode } from 'react';

import { ActivityProvider } from '@/components/Activity/ActivityContext.js';
import { KeyType } from '@/constants/enum.js';
import { createMetadataEventDetailPage } from '@/helpers/createMetadataEventDetailPage.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';

const createPageMetadata = memoizeWithRedis(createMetadataEventDetailPage, {
    key: KeyType.CreateMetadataEvent,
});

interface Props {
    children: ReactNode;
}

// cspell: disable-next-line
const name = 'hlbl';

export async function generateMetadata() {
    return createPageMetadata(name);
}

export default function Layout({ children }: Props) {
    return <ActivityProvider name={name}>{children}</ActivityProvider>;
}

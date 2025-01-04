import type { ReactNode } from 'react';

import { ActivityProvider } from '@/components/Activity/ActivityContext.js';
import { KeyType } from '@/constants/enum.js';
import { createMetadataEventDetailPage } from '@/helpers/createMetadataEventDetailPage.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

const createPageMetadata = memoizeWithRedis(createMetadataEventDetailPage, {
    key: KeyType.CreateMetadataEvent,
});

interface Props {
    params: Promise<{
        name: string;
    }>;
    children: ReactNode;
}

export async function generateMetadata(props: Props) {
    const params = await props.params;
    return createPageMetadata(params.name);
}

export default async function Layout(props: Props) {
    const params = await props.params;
    const { children } = props;

    await setupLocaleForSSR();
    return <ActivityProvider name={params.name}>{children}</ActivityProvider>;
}

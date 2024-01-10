import { headers } from 'next/headers.js';
import type React from 'react';

import { Head } from '@/esm/Head.js';
import type { SourceInURL } from '@/helpers/resolveSource.js';

interface Props {
    params: {
        id: string;
        source: SourceInURL;
    };
    children: React.ReactNode;
}

export default function DetailLayout({ children }: Props) {
    const isBotRequest = headers().get('X-IS-BOT') === 'true';

    if (isBotRequest)
        return (
            <Head>
                <meta name="og:title" content="This is for bot!" />
                <meta name="og:description" content="Hello bot!" />
            </Head>
        );

    return <>{children}</>;
}

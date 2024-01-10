import { headers } from 'next/headers.js';
import type React from 'react';

import type { SourceInURL } from '@/helpers/resolveSource.js';

interface Props {
    params: {
        id: string;
        source: SourceInURL;
    };
    children: React.ReactNode;
}

export default function DetailLayout({ children }: Props) {
    const headers_ = headers()

    console.log('DEBUG: IS-BOT')
    console.log(headers_.get('X-IS-BOT'))

    return <>{children}</>;
}

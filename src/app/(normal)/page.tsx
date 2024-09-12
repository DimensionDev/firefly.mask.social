'use client';

import { DiscoverPage } from '@/app/(normal)/pages/Discover.js';
import { Source } from '@/constants/enum.js';

export default function Page() {
    return <DiscoverPage source={Source.Farcaster} />;
}

import { redirect } from 'next/navigation.js';

import { Source } from '@/constants/enum.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';

export default function Page() {
    return redirect(resolveDiscoverUrl(Source.Farcaster));
}

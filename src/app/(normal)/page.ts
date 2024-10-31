import { redirect, RedirectType } from 'next/navigation.js';

import { DEFAULT_SOCIAL_SOURCE } from '@/constants/index.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';

export default function Page() {
    redirect(resolveDiscoverUrl(DEFAULT_SOCIAL_SOURCE), RedirectType.replace);
}

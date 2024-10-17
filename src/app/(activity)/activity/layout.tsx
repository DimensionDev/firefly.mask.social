import type { PropsWithChildren } from 'react';

import { ActivityProvider } from '@/components/Activity/ActivityContext.js';

export default function Layout({ children }: PropsWithChildren) {
    return <ActivityProvider>{children}</ActivityProvider>;
}

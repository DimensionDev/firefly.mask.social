'use client';
import { useSearchParams } from 'next/navigation.js';
import { memo } from 'react';
import { useMount } from 'react-use';

import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { ComposeModalRef } from '@/modals/controls.js';

export const ComposeWatcher = memo(function ComposeWatcher() {
    const search = useSearchParams();
    const isLogin = useIsLogin();
    const isMedium = useIsMedium();

    useMount(() => {
        const modal = search.get('modal');
        const text = search.get('text');

        if (!modal || !text || !isLogin || !isMedium) return;

        ComposeModalRef.open({
            type: 'compose',
            chars: [text],
        });
    });
    return null;
});

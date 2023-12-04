'use client';

import { useAsync } from 'react-use';

import { setupMaskRuntime } from '@/helpers/setupMaskRuntime.js';

export function CustomElements() {
    useAsync(async () => {
        await setupMaskRuntime();

        await import('@/mask/custom-elements/CalendarWidget.js');
    }, []);

    return null;
}

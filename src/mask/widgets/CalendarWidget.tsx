'use client';

import { CalendarContent } from '@masknet/plugin-calendar';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.js';

export default function CalendarWidget() {
    return (
        <Providers>
            <MaskProviders>
                <CalendarContent />
            </MaskProviders>
        </Providers>
    );
}

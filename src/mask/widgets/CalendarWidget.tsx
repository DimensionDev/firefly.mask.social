'use client';

import { CalendarContent } from '@masknet/plugin-calendar';

import { ClientProviders } from '@/components/ClientProviders.js';
import { MaskProviders } from '@/components/MaskProviders.js';

export default function CalendarWidget() {
    return (
        <ClientProviders>
            <MaskProviders>
                <CalendarContent disableSetting />
            </MaskProviders>
        </ClientProviders>
    );
}

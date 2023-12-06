'use client';

import { CalendarContent } from '@masknet/plugin-calendar';
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';

import { Providers } from '@/components/Provider.js';
import { Providers as MaskProviders } from '@/mask/widgets/Providers.js';

export default function CalendarWidget() {
    return (
        <Providers>
            <MaskProviders>
                <DisableShadowRootContext.Provider value={false}>
                    <ShadowRootIsolation>
                        <CalendarContent />
                    </ShadowRootIsolation>
                </DisableShadowRootContext.Provider>
            </MaskProviders>
        </Providers>
    );
}

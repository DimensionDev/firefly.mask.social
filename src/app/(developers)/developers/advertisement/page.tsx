'use client';

import { Trans } from '@lingui/macro';

import { AdvertisementPlayground } from '@/app/(developers)/components/AdvertisementPlayground.js';
import { AdvertisementSyncButtons } from '@/app/(developers)/components/AdvertisementSyncButtons.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';

export default function Page() {
    return (
        <Section className="max-h-screen overflow-y-auto">
            <Headline>
                <Trans>Advertisement Management</Trans>
            </Headline>

            <div className="w-full">
                <AdvertisementPlayground />

                <AdvertisementSyncButtons />
            </div>
        </Section>
    );
}

'use client';

import { Trans } from '@lingui/macro';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';

export default function Settings() {
    return (
        <Section>
            <Headline>
                <Trans>General</Trans>
            </Headline>

            <div className="mb-2 w-full">
                <Trans>Enable the development API version for testing new features.</Trans>
            </div>

            <div className="mb-2 flex w-full flex-row gap-2">
                <CircleCheckboxIcon checked />
            </div>
        </Section>
    );
}

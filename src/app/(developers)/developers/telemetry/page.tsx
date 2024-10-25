import { Trans } from '@lingui/macro';

import { TelemetryMethodButton } from '@/app/(developers)/components/TelemetryMethodButton.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { classNames } from '@/helpers/classNames.js';
import { setupLocaleForSSR } from '@/i18n/index.js';
import { ProviderFilter } from '@/providers/types/Telemetry.js';
import type { MethodItem } from '@/types/telemetry.js';

type Item = MethodItem & {
    title: string;
    description: string;
};

const items: Item[] = [
    {
        providerFilter: ProviderFilter.All,
        title: 'All',
        description: 'Send the event to all providers.',
    },
    {
        providerFilter: ProviderFilter.GA,
        title: 'Google Analytics',
        description: 'Send the event to Google Analytics.',
    },
    {
        providerFilter: ProviderFilter.Safary,
        title: 'Safary',
        description: 'Send the event to Safary.',
    },
];

export default function Page() {
    setupLocaleForSSR();

    const renderItem = (item: Item) => {
        return <TelemetryMethodButton item={item} />;
    };

    return (
        <Section className="h-screen">
            <Headline>
                <Trans>Telemetry</Trans>
            </Headline>

            {
                <menu className="no-scrollbar w-full flex-1 overflow-auto">
                    {items.map((x, i) => {
                        return (
                            <ClickableArea
                                className={classNames(
                                    'mb-6 flex items-center justify-between border-b border-line pb-1 text-[18px] leading-[24px] text-main',
                                )}
                                key={i}
                            >
                                <div className="flex-1">
                                    <h2 className="mb-2">
                                        <span>{x.title}</span>
                                    </h2>
                                    <p className="text-sm text-secondary">{x.description}</p>
                                </div>
                                <div className="max-w-[50%]">{renderItem(x)}</div>
                            </ClickableArea>
                        );
                    })}
                </menu>
            }
        </Section>
    );
}

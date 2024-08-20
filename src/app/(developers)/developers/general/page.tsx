'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { WalletProviderType } from '@/constants/enum.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';

type Item =
    | {
          type: 'checkbox';
          value: boolean;
          title: string;
          description: string;
      }
    | {
          type: 'select';
          value: string;
          items: Array<{ label: string; value: string }>;
          title: string;
          description: string;
      };

export default function General() {
    const { useDevelopmentAPI, updateUseDevelopmentAPI, providerType, updateProviderType } =
        useDeveloperSettingsState();

    const items: Item[] = [
        {
            type: 'checkbox',
            value: useDevelopmentAPI,
            title: t`Enable development API version`,
            description: t`Switch to the development API version for testing new features.`,
        },
        {
            type: 'select',
            value: providerType,
            items: [
                {
                    label: t`App Kit`,
                    value: WalletProviderType.AppKit,
                },
                {
                    label: t`Rainbow Kit`,
                    value: WalletProviderType.RainbowKit,
                },
            ],
            title: t`Wallet Provider`,
            description: t`Switch between the app kit and rainbow kit wallet providers.`,
        },
    ];

    const renderItem = (item: (typeof items)[0]) => {
        const type = item.type;

        switch (type) {
            case 'checkbox':
                return <CircleCheckboxIcon checked={item.value} />;
            case 'select':
                return (
                    <select onChange={(ev) => updateProviderType(ev.currentTarget.value as WalletProviderType)}>
                        {item.items.map((x, i) => (
                            <option key={i} value={x.value}>
                                {x.label}
                            </option>
                        ))}
                    </select>
                );
            default:
                safeUnreachable(type);
                return null;
        }
    };

    return (
        <Section>
            <Headline>
                <Trans>General</Trans>
            </Headline>

            {
                <ul className="w-full">
                    {items.map((x, i) => {
                        return (
                            <ClickableArea
                                as="li"
                                className="mb-6 flex cursor-pointer items-center justify-between border-b border-line pb-1 text-[18px] leading-[24px] text-main"
                                key={i}
                                onClick={() => {
                                    updateUseDevelopmentAPI(!useDevelopmentAPI);
                                }}
                            >
                                <div className="flex-1">
                                    <h2 className="mb-2">{x.title}</h2>
                                    <p className="text-sm text-secondary">{x.description}</p>
                                </div>
                                <div>{renderItem(x)}</div>
                            </ClickableArea>
                        );
                    })}
                </ul>
            }
        </Section>
    );
}

'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import type { ChangeEvent } from 'react';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { classNames } from '@/helpers/classNames.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';

type Item =
    | {
          type: 'checkbox';
          value: boolean;
          title: string;
          description: string;
          onClick?: () => void;
      }
    | {
          type: 'select';
          value: string;
          items: Array<{ label: string; value: string }>;
          title: string;
          description: string;
          onChange?: (ev: ChangeEvent<HTMLSelectElement>) => void;
      };

export default function Page() {
    const { developmentAPI, updateDevelopmentAPI, telemetry, updateTelemetry, telemetryDebug, updateTelemetryDebug } =
        useDeveloperSettingsState();

    const items: Item[] = [
        {
            type: 'checkbox',
            value: telemetry,
            title: t`Enable logging telemetry events`,
            description: t`Log telemetry events to the console.`,
            onClick: () => {
                updateTelemetry(!telemetry);
            },
        },
        {
            type: 'checkbox',
            value: telemetryDebug,
            title: t`Enable telemetry debug mode`,
            description: t`Send telemetry events in debug mode.`,
            onClick: () => {
                updateTelemetryDebug(!telemetryDebug);
            },
        },
        {
            type: 'checkbox',
            value: developmentAPI,
            title: t`Enable development API version`,
            description: t`Switch to the development API version for testing new features.`,
            onClick: () => {
                updateDevelopmentAPI(!developmentAPI);
            },
        },
    ];

    const renderItem = (item: (typeof items)[0]) => {
        const type = item.type;

        switch (type) {
            case 'checkbox':
                return <CircleCheckboxIcon checked={item.value} />;
            case 'select':
                return (
                    <select
                        className="cursor-pointer rounded-md border-line bg-bg px-2 py-1.5"
                        onChange={item.onChange}
                    >
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
                <menu className="no-scrollbar w-full flex-1 overflow-auto">
                    {items.map((x, i) => {
                        return (
                            <ClickableArea
                                as="li"
                                className={classNames(
                                    'mb-6 flex items-center justify-between border-b border-line pb-1 text-[18px] leading-[24px] text-main',
                                    {
                                        'cursor-pointer': x.type === 'checkbox',
                                    },
                                )}
                                key={i}
                                onClick={x.type === 'checkbox' ? x.onClick : undefined}
                            >
                                <div className="flex-1">
                                    <h2 className="mb-2">{x.title}</h2>
                                    <p className="text-sm text-secondary">{x.description}</p>
                                </div>
                                <div>{renderItem(x)}</div>
                            </ClickableArea>
                        );
                    })}
                </menu>
            }
        </Section>
    );
}

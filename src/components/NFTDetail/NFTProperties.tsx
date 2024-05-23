import { Trans } from '@lingui/macro';
import { TextOverflowTooltip } from '@masknet/theme';
import type { ReactNode } from 'react';

export interface NFTPropertiesItem {
    label: ReactNode;
    value: ReactNode;
}

export interface NFTPropertiesProps {
    items: NFTPropertiesItem[];
}

export function NFTProperties(props: NFTPropertiesProps) {
    return (
        <div className="w-full space-y-2">
            <h3 className="text-lg font-bold leading-6">
                <Trans>Properties</Trans>
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3">
                {props.items.map(({ value, label }, i) => {
                    const key =
                        [typeof label === 'string' ? label : label, typeof value === 'string' ? value : value]
                            .filter((e) => e)
                            .join('') || `${i}`;
                    return (
                        <div
                            key={key}
                            className="flex flex-col items-center justify-center space-y-2.5 rounded-[10px] border border-input bg-lightBg p-[10px] px-2 py-1 text-center"
                        >
                            <TextOverflowTooltip title={label}>
                                <div className="w-full truncate text-base font-normal leading-[22px] text-second">
                                    {label}
                                </div>
                            </TextOverflowTooltip>
                            <TextOverflowTooltip title={value}>
                                <div className="w-full truncate text-lg font-bold leading-6 text-lightMain">
                                    {value}
                                </div>
                            </TextOverflowTooltip>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

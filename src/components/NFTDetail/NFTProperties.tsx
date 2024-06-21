import { Trans } from '@lingui/macro';
import { TextOverflowTooltip } from '@masknet/theme';
import type { NonFungibleTokenTrait } from '@masknet/web3-shared-base';
import dayjs from 'dayjs';

import { formatDate } from '@/helpers/formatTimestamp.js';
import { isTimestamp } from '@/helpers/isTimestamp.js';
import { isUnixTimestamp } from '@/helpers/isUnixTimestamp.js';

export interface NFTPropertiesProps {
    items: NonFungibleTokenTrait[];
}

export function NFTProperties(props: NFTPropertiesProps) {
    return (
        <div className="w-full space-y-2">
            <h3 className="text-lg font-bold leading-6">
                <Trans>Properties</Trans>
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3">
                {props.items.map((item) => {
                    const { type, displayType } = item;
                    let value = item.value;
                    switch (displayType) {
                        case 'date':
                            if (isUnixTimestamp(item.value)) {
                                value = formatDate(dayjs.unix(parseInt(item.value, 10)).toDate());
                            } else if (isTimestamp(item.value)) {
                                value = formatDate(dayjs(parseInt(item.value, 10)).toDate());
                            } else {
                                value = formatDate(dayjs(item.value).toDate());
                            }
                            break;
                    }
                    return (
                        <div
                            key={type}
                            className="flex flex-col items-center justify-center space-y-2.5 rounded-[10px] border border-input bg-lightBg p-[10px] px-2 py-1 text-center"
                        >
                            <TextOverflowTooltip title={type}>
                                <div className="w-full truncate text-base font-normal leading-[22px] text-second">
                                    {type}
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

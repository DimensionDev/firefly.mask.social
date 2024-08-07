import { Trans } from '@lingui/macro';
import type { NonFungibleTokenTrait } from '@masknet/web3-shared-base';

import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { getNFTPropertyValue } from '@/helpers/getNFTPropertyValue.js';

export interface NFTPropertiesProps {
    items: NonFungibleTokenTrait[];
}

export function NFTProperties(props: NFTPropertiesProps) {
    return (
        <div className="w-full space-y-2">
            <h3 className="text-xl font-bold leading-6">
                <Trans>Properties</Trans>
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3">
                {props.items.map((item) => {
                    const { type, displayType } = item;
                    const value = getNFTPropertyValue(displayType, item.value);
                    return (
                        <div
                            key={type}
                            className="flex flex-col items-center justify-center space-y-2.5 rounded-[10px] border border-line bg-lightBg p-[10px] px-2 py-1 text-center"
                        >
                            <TextOverflowTooltip content={type}>
                                <div className="w-full truncate text-base font-normal leading-[22px] text-second">
                                    {type}
                                </div>
                            </TextOverflowTooltip>
                            <TextOverflowTooltip content={value}>
                                <div className="w-full truncate text-base font-bold leading-6 text-lightMain">
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

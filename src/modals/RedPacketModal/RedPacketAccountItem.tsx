import { isValidAddress } from '@masknet/web3-shared-evm';
import { memo } from 'react';
import { mainnet } from 'viem/chains';

import LinkOut from '@/assets/link.svg';
import { classNames } from '@/helpers/classNames.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { openWindow } from '@/helpers/openWindow.js';
import { EVMExplorerResolver } from '@/mask/bindings/index.js';

interface Props {
    address: string;
    ens?: string;
    chainId?: number;
    isDarkFont?: boolean;
}

export const RedPacketAccountItem = memo(function RedPacketAccountItem({
    address,
    ens,
    chainId = mainnet.id,
    isDarkFont,
}: Props) {
    return (
        <div
            className={classNames('flex items-center gap-1 text-[14px] leading-[18px]', {
                'text-lightTextMain': !!isDarkFont,
            })}
        >
            <div>{ens ? ens : formatAddress(address, 4)}</div>
            <button
                type="button"
                className="h-4 cursor-pointer border-none bg-none p-0"
                onClick={() => {
                    if (isValidAddress(address))
                        openWindow(EVMExplorerResolver.addressLink(chainId, address), '_blank');
                }}
            >
                <LinkOut className="h-4 w-4 text-lightSecond" />
            </button>
        </div>
    );
});

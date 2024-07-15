import { t } from '@lingui/macro';
import { isSameAddress } from '@masknet/web3-shared-base';
import { memo } from 'react';

import ArrowDown from '@/assets/arrow-down.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { AddressLink } from '@/components/Tips/AddressLink.js';
import { TipsModalHeader } from '@/components/Tips/TipsModalHeader.js';
import { router, TipsRoutePath } from '@/components/Tips/tipsModalRouter.js';
import { classNames } from '@/helpers/classNames.js';
import { TipsContext, type TipsProfile } from '@/hooks/useTipsContext.js';

export const WalletSelector = memo(function WalletSelector() {
    const { receiverList, receiver: selectedReceiver, update } = TipsContext.useContainer();

    const handleSelectReceiver = (receiver: TipsProfile) => {
        if (!isSameAddress(receiver.address, selectedReceiver?.address)) {
            update((prev) => ({ ...prev, receiver }));
        }
        router.navigate({ to: TipsRoutePath.TIPS, replace: true });
    };

    return (
        <>
            <TipsModalHeader back title={t`Select Wallet`} />
            <div className="h-80 overflow-y-auto">
                {receiverList.map((receiver) => (
                    <ClickableButton
                        key={receiver.address}
                        className={classNames(
                            'flex w-full cursor-pointer items-center gap-x-1 rounded-lg px-3 py-2 font-bold text-lightMain hover:bg-lightBg',
                            isSameAddress(receiver.address, selectedReceiver?.address) ? 'opacity-50' : '',
                        )}
                        onClick={() => handleSelectReceiver(receiver)}
                    >
                        <span className="max-w-[calc(100%_-_24px)] truncate">{receiver.displayName}</span>
                        <AddressLink address={receiver.address} networkType={receiver.networkType} />
                    </ClickableButton>
                ))}
            </div>
        </>
    );
});

interface WalletSelectorEntryProps {
    disabled?: boolean;
}

export const WalletSelectorEntry = memo(function WalletSelectorEntry({ disabled = false }: WalletSelectorEntryProps) {
    const { receiver, receiverList, token } = TipsContext.useContainer();

    const noMoreReceiver = receiverList.length <= 1;

    return (
        <ClickableButton
            className={classNames(
                'flex h-10 w-full cursor-pointer items-center justify-between rounded-2xl bg-lightBg px-3',
                noMoreReceiver ? '!cursor-default' : '',
            )}
            disabled={disabled}
            onClick={() => {
                if (noMoreReceiver) return;
                router.navigate({ to: TipsRoutePath.SELECT_WALLET });
            }}
        >
            <div
                className={classNames(
                    'flex items-center justify-center gap-x-1',
                    noMoreReceiver ? 'w-full' : 'w-[calc(100%_-_24px)]',
                )}
            >
                <span className="max-w-[calc(100%_-_24px)] truncate">{receiver?.displayName ?? ''}</span>
                {receiver && token ? (
                    <AddressLink
                        address={receiver.address}
                        networkType={receiver.networkType}
                        chainId={token.chainId}
                    />
                ) : null}
            </div>
            {!noMoreReceiver ? <ArrowDown className="shrink-0 text-lightSecond" width={24} height={24} /> : null}
        </ClickableButton>
    );
});

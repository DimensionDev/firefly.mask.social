import { Popover, Transition } from '@headlessui/react';
import { isSameAddress } from '@masknet/web3-shared-base';
import { Fragment, memo } from 'react';

import ArrowDown from '@/assets/arrow-down.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { AddressLink } from '@/components/Tips/AddressLink.js';
import { router, TipsRoutePath } from '@/components/Tips/tipsModalRouter.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { TipsContext, type TipsProfile } from '@/hooks/useTipsContext.js';
import type { WalletProfile } from '@/providers/types/Firefly.js';

const WalletSelector = memo<{ onSelected: () => void }>(function WalletSelector({ onSelected }) {
    const { receiverList, receiver: selectedReceiver, update } = TipsContext.useContainer();

    const handleSelectReceiver = (receiver: TipsProfile) => {
        if (!isSameAddress(receiver.address, selectedReceiver?.address)) {
            update((prev) => ({ ...prev, receiver }));
        }
        onSelected();
        router.navigate({ to: TipsRoutePath.TIPS, replace: true });
    };

    return (
        <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 translate-y-1"
        >
            <Popover.Panel
                static
                className="absolute left-2/4 top-full z-50 flex w-full -translate-x-1/2 translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] text-main shadow-popover"
            >
                <div className="no-scrollbar max-h-[175px] overflow-y-auto">
                    {receiverList.map((receiver) => {
                        const walletProfile = receiver.__origin__ as WalletProfile;
                        return (
                            <ClickableButton
                                key={receiver.address}
                                className={classNames(
                                    'flex w-full cursor-pointer items-center justify-center gap-x-1 rounded-lg px-3 py-2 font-bold text-lightMain hover:bg-lightBg',
                                    isSameAddress(receiver.address, selectedReceiver?.address) ? 'opacity-50' : '',
                                )}
                                onClick={() => handleSelectReceiver(receiver)}
                            >
                                <span className="max-w-[calc(100%_-_24px)] truncate">
                                    {walletProfile?.primary_ens
                                        ? `${walletProfile.primary_ens}(${formatEthereumAddress(receiver.address, 4)})`
                                        : receiver.displayName}
                                </span>
                                <AddressLink address={receiver.address} networkType={receiver.networkType} />
                            </ClickableButton>
                        );
                    })}
                </div>
            </Popover.Panel>
        </Transition>
    );
});

interface WalletSelectorEntryProps {
    disabled?: boolean;
}

export const WalletSelectorEntry = memo(function WalletSelectorEntry({ disabled = false }: WalletSelectorEntryProps) {
    const { receiver, receiverList, token } = TipsContext.useContainer();

    const noMoreReceiver = receiverList.length <= 1;

    return (
        <Popover as="div" className="relative">
            {({ open, close }) => (
                <>
                    <Popover.Button
                        className={classNames(
                            'flex h-10 w-full cursor-pointer items-center justify-between rounded-2xl bg-lightBg px-3',
                            noMoreReceiver ? '!cursor-default' : '',
                        )}
                        disabled={disabled || noMoreReceiver}
                    >
                        <div
                            className={classNames(
                                'flex items-center justify-center gap-x-1',
                                noMoreReceiver ? 'w-full' : 'w-[calc(100%_-_24px)]',
                            )}
                        >
                            <span className="max-w-[calc(100%_-_24px)] truncate">{receiver?.displayName}</span>
                            {receiver && token ? (
                                <AddressLink
                                    address={receiver.address}
                                    networkType={receiver.networkType}
                                    chainId={token.chainId}
                                />
                            ) : null}
                        </div>
                        {!noMoreReceiver ? (
                            <ArrowDown
                                className={classNames('shrink-0 text-lightSecond', open ? 'rotate-180' : '')}
                                width={24}
                                height={24}
                            />
                        ) : null}
                    </Popover.Button>
                    <WalletSelector onSelected={close} />
                </>
            )}
        </Popover>
    );
});

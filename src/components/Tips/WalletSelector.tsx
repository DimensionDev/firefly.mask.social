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
    const { recipientList, recipient: selectedRecipient, update } = TipsContext.useContainer();

    const handleSelectRecipient = (recipient: TipsProfile) => {
        if (!isSameAddress(recipient.address, selectedRecipient?.address)) {
            update((prev) => ({ ...prev, recipient }));
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
                    {recipientList.map((recipient) => {
                        const walletProfile = recipient.__origin__ as WalletProfile;
                        return (
                            <ClickableButton
                                key={recipient.address}
                                className={classNames(
                                    'flex w-full cursor-pointer items-center justify-center gap-x-1 rounded-lg px-3 py-2 font-bold text-lightMain hover:bg-lightBg',
                                    isSameAddress(recipient.address, selectedRecipient?.address) ? 'opacity-50' : '',
                                )}
                                onClick={() => handleSelectRecipient(recipient)}
                            >
                                <span className="max-w-[calc(100%_-_24px)] truncate">
                                    {walletProfile?.primary_ens
                                        ? `${walletProfile.primary_ens}(${formatEthereumAddress(recipient.address, 4)})`
                                        : recipient.displayName}
                                </span>
                                <AddressLink address={recipient.address} networkType={recipient.networkType} />
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
    const { recipient, recipientList, token } = TipsContext.useContainer();

    const noMoreRecipient = recipientList.length <= 1;

    return (
        <Popover as="div" className="relative">
            {({ open, close }) => (
                <>
                    <Popover.Button
                        className={classNames(
                            'flex h-10 w-full cursor-pointer items-center justify-between rounded-2xl bg-lightBg px-3',
                            noMoreRecipient ? '!cursor-default' : '',
                            disabled ? 'opacity-50' : '',
                        )}
                        disabled={disabled || noMoreRecipient}
                    >
                        <div
                            className={classNames(
                                'flex items-center justify-center gap-x-1',
                                noMoreRecipient ? 'w-full' : 'w-[calc(100%_-_24px)]',
                            )}
                        >
                            <span className="max-w-[calc(100%_-_24px)] truncate">{recipient?.displayName}</span>
                            {recipient && token ? (
                                <AddressLink
                                    address={recipient.address}
                                    networkType={recipient.networkType}
                                    chainId={token.chainId}
                                />
                            ) : null}
                        </div>
                        {!noMoreRecipient ? (
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

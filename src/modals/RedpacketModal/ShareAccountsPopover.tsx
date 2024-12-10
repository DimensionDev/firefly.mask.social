import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { isValidAddress } from '@masknet/web3-shared-evm';
import { Fragment, type PropsWithChildren, type ReactNode } from 'react';
import { useEnsName } from 'wagmi';

import { ClickableArea } from '@/components/ClickableArea.js';
import { classNames } from '@/helpers/classNames.js';
import { formatAddress } from '@/helpers/formatAddress.js';

interface ShareAccountsPopoverProps extends PropsWithChildren {
    accounts: Array<{ icon: ReactNode; name: string }>;
    onClick: (name: string) => void;
    className?: string;
    selected?: string;
}

export function ShareAccountsPopover({ accounts, children, onClick, className, selected }: ShareAccountsPopoverProps) {
    return (
        <Popover as="div" className="relative">
            {({ close }) => (
                <>
                    <PopoverButton
                        className={classNames(
                            'flex cursor-pointer gap-1 text-main focus:outline-none disabled:cursor-default',
                            className,
                        )}
                    >
                        {children}
                    </PopoverButton>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <PopoverPanel className="no-scrollbar absolute bottom-full right-0 z-10 flex max-h-[275px] w-[280px] -translate-y-3 flex-col gap-2 overflow-y-auto rounded-lg bg-lightBottom py-3 text-medium shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none md:max-h-[370px]">
                            <div>
                                {accounts.map(({ icon, name }) => (
                                    <ShareAccountsPopoverItem
                                        key={name}
                                        icon={icon}
                                        name={name}
                                        disabled={selected === name}
                                        onClick={(name: string) => {
                                            onClick(name);
                                            close();
                                        }}
                                    />
                                ))}
                            </div>
                        </PopoverPanel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}

export function ShareAccountsPopoverItem({
    icon,
    name,
    onClick,
    disabled = false,
}: {
    icon: ReactNode;
    name: string;
    onClick: (name: string) => void;
    disabled?: boolean;
}) {
    const { data: ensName } = useEnsName({
        address: name as `0x${string}`,
        query: {
            enabled: isValidAddress(name),
        },
    });

    return (
        <ClickableArea
            className={classNames('shrink-0', {
                'cursor-pointer': !disabled,
                'opacity-40': disabled,
            })}
            onClick={() => {
                onClick(name);
            }}
        >
            <div className="box-content flex h-12 items-center justify-between px-3 hover:bg-bg">
                <div className="flex items-center gap-2 text-main">
                    {icon}
                    <span className="font-bold text-main">
                        {isValidAddress(name) ? (ensName ?? formatAddress(name, 4)) : name}
                    </span>
                </div>
            </div>
        </ClickableArea>
    );
}

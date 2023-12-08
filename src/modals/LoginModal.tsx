'use client';

import { Dialog, Transition } from '@headlessui/react';
import { t } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { forwardRef, Fragment, Suspense, useMemo, useRef, useState } from 'react';
import { usePrevious, useUpdateEffect } from 'react-use';
import { useAccount, useNetwork } from 'wagmi';

import CloseIcon from '@/assets/close.svg';
import LeftArrowIcon from '@/assets/left-arrow.svg';
import LoadingIcon from '@/assets/loading.svg';
import { LoginButton } from '@/components/Login/LoginButton.js';
import { LoginFarcaster } from '@/components/Login/LoginFarcaster.js';
import { LoginLens } from '@/components/Login/LoginLens.js';
import { SocialPlatform } from '@/constants/enum.js';

export interface LoginModalProps {
    current?: SocialPlatform;
}

export const LoginModal = forwardRef<SingletonModalRefCreator<LoginModalProps>>(function LoginModal(_, ref) {
    const isLensConnecting = useRef(false);
    const [current, setCurrent] = useState<SocialPlatform>();

    const { openConnectModal, connectModalOpen } = useConnectModal();
    const account = useAccount();
    const { chain } = useNetwork();

    const previousAccount = usePrevious(account);
    const previousConnectModalOpen = usePrevious(connectModalOpen);

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: (props) => {
            setCurrent(props?.current);
        },
        onClose: () => {
            setCurrent(undefined);
        },
    });

    const title = useMemo(() => {
        if (current === SocialPlatform.Lens) return t`Select Account`;
        else if (current === SocialPlatform.Farcaster) return t`Log in to Farcaster account`;
        return t`Login`;
    }, [current]);

    useUpdateEffect(() => {
        if (isLensConnecting.current) return;
        // When the wallet is connected or the chain switch is successful, it automatically jumps to the next step
        if (account.isConnected && !previousAccount?.isConnected && previousConnectModalOpen) {
            setCurrent(SocialPlatform.Lens);
            isLensConnecting.current = false;
        }
    }, [account, chain]);

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[999]" onClose={() => dispatch?.close()}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="transform rounded-[12px] bg-bgModal transition-all">
                                <div
                                    className="inline-flex h-[56px] w-[600px] items-center justify-center gap-2 rounded-t-[12px] p-4"
                                    style={{ background: 'var(--m-modal-title-bg)' }}
                                >
                                    <button
                                        onClick={() => {
                                            current === SocialPlatform.Farcaster
                                                ? setCurrent(undefined)
                                                : dispatch?.close();
                                        }}
                                    >
                                        {current === SocialPlatform.Farcaster ? (
                                            <LeftArrowIcon width={24} height={24} />
                                        ) : (
                                            <CloseIcon width={24} height={24} />
                                        )}
                                    </button>
                                    <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                                        {title}
                                    </div>
                                    <div className="relative h-[24px] w-[24px]" />
                                </div>
                                {!current ? (
                                    <div
                                        className="flex w-[600px] flex-col rounded-[12px]"
                                        style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
                                    >
                                        <div className="flex w-full flex-col gap-[16px] p-[16px] ">
                                            <LoginButton
                                                platform={SocialPlatform.Lens}
                                                onClick={() => {
                                                    if (!account.isConnected) {
                                                        openConnectModal();
                                                        isLensConnecting.current = true;
                                                    } else {
                                                        setCurrent(SocialPlatform.Lens);
                                                    }
                                                }}
                                            />
                                            <LoginButton
                                                platform={SocialPlatform.Farcaster}
                                                onClick={() => {
                                                    setCurrent(SocialPlatform.Farcaster);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <Suspense
                                        fallback={
                                            <div className="flex h-[194px] w-[600px] items-center justify-center">
                                                <LoadingIcon className="animate-spin" width={24} height={24} />
                                            </div>
                                        }
                                    >
                                        {current === SocialPlatform.Lens ? (
                                            <LoginLens back={() => setCurrent(undefined)} />
                                        ) : null}
                                        {current === SocialPlatform.Farcaster ? <LoginFarcaster /> : null}
                                    </Suspense>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
});

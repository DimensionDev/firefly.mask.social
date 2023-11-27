'use client';

import { Dialog, Transition } from '@headlessui/react';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { forwardRef, Fragment, Suspense, useMemo, useRef, useState } from 'react';
import { usePrevious, useUpdateEffect } from 'react-use';
import { polygon } from 'viem/chains';
import { useAccount, useNetwork } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { LoginFarcaster } from '@/components/LoginFarcaster.js';
import { LoginLens } from '@/components/LoginLens/index.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { useSingletonModal } from '@/maskbook/packages/shared-base-ui/src/index.js';
import { isLensCollect } from '@/maskbook/packages/web3-shared/evm/src/index.js';

export interface LoginModalProps {
    current?: SocialPlatform;
}

export const LoginModal = forwardRef<SingletonModalRefCreator<LoginModalProps>>(function LoginModal(_, ref) {
    const isLensConnecting = useRef(false);
    const [current, setCurrent] = useState<SocialPlatform | undefined>();

    const { openConnectModal, connectModalOpen } = useConnectModal();
    const { openChainModal, chainModalOpen } = useChainModal();
    const account = useAccount();
    const { chain } = useNetwork();

    const previousAccount = usePrevious(account);
    const previousChain = usePrevious(chain);
    const previousConnectModalOpen = usePrevious(connectModalOpen);
    const previousChainModalOpen = usePrevious(chainModalOpen);

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: (props) => {
            setCurrent(props?.current);
        },
        onClose: () => {
            setCurrent(undefined);
        },
    });

    const title = useMemo(() => {
        if (current === SocialPlatform.Lens) return 'Select Account';
        else if (current === SocialPlatform.Farcaster) return 'Log in to Farcaster account';
        return 'Login';
    }, [current]);

    useUpdateEffect(() => {
        if (!isLensCollect) return;
        // When the wallet is connected or the chain switch is successful, it automatically jumps to the next step
        if (
            (account.isConnected && !previousAccount?.isConnected && previousConnectModalOpen) ||
            (chain?.id === polygon.id && previousChain?.id !== polygon.id && previousChainModalOpen)
        ) {
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
                            <Dialog.Panel className="transform rounded-[12px] bg-lightBottom transition-all">
                                <div className="inline-flex h-[56px] w-[600px] items-center justify-center gap-2 rounded-t-[12px] bg-gradient-to-b from-white to-white p-4">
                                    <button onClick={() => dispatch?.close()}>
                                        <Image
                                            className="relative h-[24px] w-[24px]"
                                            src="/svg/close.svg"
                                            alt="close"
                                            width={24}
                                            height={24}
                                        />
                                    </button>
                                    <div className="shrink grow basis-0 text-center font-['Helvetica'] text-lg font-bold leading-snug text-slate-950">
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
                                            <button
                                                className="group flex w-full flex-col rounded-lg p-[16px] hover:bg-lightBg"
                                                onClick={() => {
                                                    if (!account.isConnected) {
                                                        openConnectModal();
                                                        isLensConnecting.current = true;
                                                    } else if (chain?.id !== polygon.id) {
                                                        openChainModal();
                                                        isLensConnecting.current = true;
                                                    } else {
                                                        setCurrent(SocialPlatform.Lens);
                                                    }
                                                }}
                                            >
                                                <div className="inline-flex w-full flex-col items-center justify-start gap-[8px] rounded-lg px-[16px] py-[24px]">
                                                    <div className="relative h-[48px] w-[48px]">
                                                        <Image
                                                            className="left-0 top-0 rounded-full"
                                                            src="/svg/lens.svg"
                                                            width={48}
                                                            height={48}
                                                            alt="lens"
                                                        />
                                                    </div>
                                                    <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-lightSecond group-hover:text-lightMain">
                                                        Lens
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                        <button
                                            className="group flex flex-col rounded-lg p-[16px] hover:bg-lightBg"
                                            onClick={() => {
                                                setCurrent(SocialPlatform.Farcaster);
                                            }}
                                        >
                                            <div className="inline-flex w-full flex-col items-center justify-start gap-[8px] rounded-lg px-[16px] py-[24px]">
                                                <div className="relative h-[48px] w-[48px]">
                                                    <Image
                                                        className="left-0 top-0 rounded-full"
                                                        src="/svg/farcaster.svg"
                                                        width={48}
                                                        height={48}
                                                        alt="lens"
                                                    />
                                                </div>
                                                <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-lightSecond group-hover:text-lightMain">
                                                    Farcaster
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <Suspense
                                        fallback={
                                            <div className="flex h-[194px] w-[600px] items-center justify-center">
                                                <LoadingIcon className="animate-spin" width={24} height={24} />
                                            </div>
                                        }
                                    >
                                        {current === SocialPlatform.Lens ? <LoginLens /> : null}
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

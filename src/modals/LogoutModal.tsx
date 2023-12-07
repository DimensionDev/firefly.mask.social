'use client';

import { Dialog, Transition } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef, Fragment, useMemo, useState } from 'react';

import CloseIcon from '@/assets/close.svg';
import { PlatformIcon } from '@/components/PlatformIcon.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export interface LogoutModalProps {
    platform?: SocialPlatform;
}

export const LogoutModal = forwardRef<SingletonModalRefCreator<LogoutModalProps>>(function LogoutModal(_, ref) {
    const [props, setProps] = useState<LogoutModalProps>({ platform: SocialPlatform.Lens });
    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const clearLensProfile = useLensStateStore.use.clearCurrentProfile();
    const clearFarcasterProfile = useFarcasterStateStore.use.clearCurrentProfile();

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p);
        },
    });

    const accounts = useMemo(
        () =>
            !props.platform
                ? lensProfiles.concat(farcasterProfiles)
                : props.platform === SocialPlatform.Lens
                  ? lensProfiles
                  : farcasterProfiles,
        [lensProfiles, farcasterProfiles, props.platform],
    );

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
                                <div className="inline-flex h-[56px] w-[355px] items-center justify-center gap-2 rounded-t-[12px] p-4">
                                    <button onClick={() => dispatch?.close()}>
                                        <CloseIcon className="relative h-[24px] w-[24px]" width={24} height={24} />
                                    </button>
                                    <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                                        <Trans>Log out</Trans>
                                    </div>
                                    <div className="relative h-[24px] w-[24px]" />
                                </div>
                                <div className="flex flex-col gap-[12px] p-[24px]">
                                    <div className="text-[15px] font-medium leading-normal text-lightMain">
                                        <Trans>Confirm to log out these accounts?</Trans>
                                    </div>
                                    {accounts.map((account) => (
                                        <div
                                            key={account.profileId}
                                            className="flex items-center justify-between gap-[8px] rounded-[8px] px-[12px] py-[8px] backdrop-blur-[8px]"
                                            style={{ boxShadow: '0px 0px 20px 0px var(--color-bottom-bg)' }}
                                        >
                                            <div className="flex h-[40px] w-[48px] items-start justify-start">
                                                <div className="relative h-[40px] w-[40px]">
                                                    <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                                                        <Image
                                                            src={account.pfp}
                                                            alt="avatar"
                                                            width={36}
                                                            height={36}
                                                            className="rounded-[99px]"
                                                        />
                                                    </div>
                                                    {props.platform ? (
                                                        <PlatformIcon
                                                            className="absolute left-[24px] top-[24px] h-[16px] w-[16px] rounded-[99px] border border-white shadow"
                                                            platform={props.platform}
                                                            size={16}
                                                        />
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="inline-flex h-[39px] shrink grow basis-0 flex-col items-start justify-center">
                                                <div className=" text-[15px] font-medium text-main">
                                                    {account.displayName}
                                                </div>
                                                <div className=" text-[15px] font-normal text-lightSecond">
                                                    @{account.profileId}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        className=" flex items-center justify-center rounded-[99px] bg-commonDanger py-[11px] text-lightBottom"
                                        onClick={() => {
                                            if (!props.platform) return;
                                            switch (props.platform) {
                                                case SocialPlatform.Lens:
                                                    clearLensProfile();
                                                    break;
                                                case SocialPlatform.Farcaster:
                                                    clearFarcasterProfile();
                                                    break;
                                                default:
                                                    safeUnreachable(props.platform);
                                                    break;
                                            }
                                            dispatch?.close();
                                        }}
                                    >
                                        {t`Confirm`}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
});

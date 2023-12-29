'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef, Fragment, useState } from 'react';

import LogoutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { SocialPlatform } from '@/constants/enum.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

export interface ProfileStatusModalProps {
    source: SocialPlatform;
}

export const ProfileStatusModal = forwardRef<SingletonModalRefCreator<ProfileStatusModalProps>>(
    function ProfileStatusModal(_, ref) {
        const [source, setSource] = useState<SocialPlatform>();

        const farcasterProfiles = useFarcasterStateStore.use.profiles();
        const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
        const lensProfiles = useLensStateStore.use.profiles();
        const currentLensProfile = useLensStateStore.use.currentProfile();

        const profiles = source === SocialPlatform.Lens ? lensProfiles : farcasterProfiles;
        const currentProfile = source === SocialPlatform.Lens ? currentLensProfile : currentFarcasterProfile;

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setSource(props.source);
            },
        });
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
                                    <div className="flex w-[260px] flex-col gap-[23px] rounded-[16px] p-[24px]">
                                        {profiles.map((profile) => (
                                            <div
                                                key={profile.profileId}
                                                className="flex items-center justify-between gap-[8px]"
                                            >
                                                <ProfileAvatar profile={profile} clickable={false} />
                                                <ProfileName profile={profile} />
                                                {currentProfile && currentProfile.profileId === profile.profileId ? (
                                                    <div
                                                        className="h-[8px] w-[8px] rounded-full bg-success"
                                                        style={{
                                                            filter: 'drop-shadow(0px 4px 10px var(--color-success))',
                                                        }}
                                                    />
                                                ) : null}
                                            </div>
                                        ))}
                                        <button
                                            className="flex w-full items-center gap-[8px] text-main"
                                            onClick={async () => {
                                                dispatch?.close();
                                                await delay(300);
                                                if (source === SocialPlatform.Lens) await getWalletClientRequired();
                                                LoginModalRef.open({ source });
                                            }}
                                        >
                                            <UserAddIcon width={24} height={24} />
                                            <div className=" text-[17px] font-bold leading-[22px]">
                                                <Trans>Change account</Trans>
                                            </div>
                                        </button>
                                        <button
                                            className="flex items-center gap-[8px]"
                                            onClick={async () => {
                                                dispatch?.close();
                                                await delay(300);
                                                LogoutModalRef.open({ source });
                                            }}
                                        >
                                            <LogoutIcon width={24} height={24} />
                                            <div className=" text-[17px] font-bold leading-[22px] text-danger">
                                                <Trans>Log out</Trans>
                                            </div>
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        );
    },
);

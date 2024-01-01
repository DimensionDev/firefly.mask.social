'use client';

import { Dialog, Transition } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useRouter } from 'next/navigation.js';
import { forwardRef, Fragment, useMemo, useState } from 'react';

import CloseIcon from '@/assets/close.svg';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { SocialPlatform } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

export interface LogoutModalProps {
    source?: SocialPlatform;
    profile?: Profile;
}

export const LogoutModal = forwardRef<SingletonModalRefCreator<LogoutModalProps | void>>(function LogoutModal(_, ref) {
    const [source, setSource] = useState<SocialPlatform>();
    const [profile, setProfile] = useState<Profile>();

    const router = useRouter()

    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const clearLensProfile = useLensStateStore.use.clearCurrentProfile();
    const clearFarcasterProfile = useFarcasterStateStore.use.clearCurrentProfile();

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setSource(props?.source);
            setProfile(props?.profile);
        },
    });

    const profiles = useMemo(() => {
        if (profile) return [profile];
        return !source
            ? lensProfiles.concat(farcasterProfiles)
            : source === SocialPlatform.Lens
                ? lensProfiles
                : farcasterProfiles;
    }, [lensProfiles, farcasterProfiles, source, profile]);

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
                                        {profiles.length > 1 ? (
                                            <Trans>Confirm to log out these accounts?</Trans>
                                        ) : (
                                            <Trans>Confirm to log out this account?</Trans>
                                        )}
                                    </div>
                                    {profiles.map((profile) => (
                                        <div
                                            key={profile.profileId}
                                            className="flex items-center justify-between gap-[8px] rounded-[8px] px-[12px] py-[8px] backdrop-blur-[8px]"
                                            style={{ boxShadow: '0px 0px 20px 0px var(--color-bottom-bg)' }}
                                        >
                                            <ProfileAvatar profile={profile} size={36} />
                                            <ProfileName profile={profile} />
                                        </div>
                                    ))}
                                    <button
                                        className=" flex items-center justify-center rounded-full bg-commonDanger py-[11px] text-lightBottom"
                                        onClick={() => {
                                            switch (source || profile?.source) {
                                                case SocialPlatform.Lens:
                                                    clearLensProfile();
                                                    break;
                                                case SocialPlatform.Farcaster:
                                                    clearFarcasterProfile();
                                                    break;
                                                default:
                                                    clearLensProfile();
                                                    clearFarcasterProfile();
                                                    break;
                                            }
                                            router.push('/')
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

import { Popover, Transition } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { Fragment } from 'react';

import FarcasterIcon from '@/assets/farcaster.svg';
import LensIcon from '@/assets/lens.svg';
import YesIcon from '@/assets/yes.svg';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { LoginModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';
import type { IPFS_MediaObject } from '@/types/index.js';

interface IPostByProps {
    images: IPFS_MediaObject[];
    setLoading: (loading: boolean) => void;
}
export default function PostBy({ images, setLoading }: IPostByProps) {
    const enqueueSnackbar = useCustomSnackbar();

    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();

    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const updateLensCurrentProfile = useLensStateStore.use.updateCurrentProfile();

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
            <Popover.Panel className=" absolute bottom-full right-0 flex w-[280px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] shadow-popover">
                {currentLensProfile && lensProfiles.length > 0 ? (
                    lensProfiles.map((profile) => (
                        <Fragment key={profile.profileId}>
                            <div className={classNames(' flex h-[22px] items-center justify-between')}>
                                <div className=" flex items-center gap-2">
                                    <Image
                                        src={profile.pfp}
                                        width={24}
                                        height={24}
                                        alt="lens"
                                        className=" rounded-full"
                                    />
                                    <span
                                        className={classNames(
                                            ' font-bold',
                                            currentLensProfile?.profileId === profile.profileId
                                                ? ' text-secondary'
                                                : ' text-main',
                                        )}
                                    >
                                        @{profile.handle || profile.profileId}
                                    </span>
                                </div>
                                {currentLensProfile?.profileId === profile.profileId ? (
                                    <YesIcon width={40} height={40} className=" relative -right-2" />
                                ) : (
                                    <button
                                        className=" font-bold text-blueBottom"
                                        onClick={async () => {
                                            setLoading(true);
                                            try {
                                                const session = await LensSocialMediaProvider.createSessionForProfileId(
                                                    profile.profileId,
                                                );

                                                updateLensCurrentProfile(profile, session);
                                                enqueueSnackbar(t`Your Lens account is now connected`, {
                                                    variant: 'success',
                                                });
                                            } catch (error) {
                                                enqueueSnackbar(
                                                    error instanceof Error ? error.message : t`Failed to login`,
                                                    { variant: 'error' },
                                                );
                                            }
                                            setLoading(false);
                                        }}
                                    >
                                        <Trans>Switch</Trans>
                                    </button>
                                )}
                            </div>
                            <div className=" h-px bg-line" />
                        </Fragment>
                    ))
                ) : (
                    <Fragment>
                        <div className=" flex h-[22px] cursor-pointer items-center justify-between">
                            <div className=" flex items-center gap-2">
                                <LensIcon width={24} height={24} />
                                <span className={classNames(' font-bold text-main')}>Lens</span>
                            </div>

                            <button className=" font-bold text-blueBottom" onClick={() => LoginModalRef.open()}>
                                <Trans>Log in</Trans>
                            </button>
                        </div>
                        <div className=" h-px bg-line" />
                    </Fragment>
                )}

                {currentFarcasterProfile && farcasterProfiles.length > 0 ? (
                    farcasterProfiles.map((profile, index) => (
                        <Fragment key={profile.profileId}>
                            <div className={classNames(' flex h-[22px] items-center justify-between')}>
                                <div className=" flex items-center gap-2">
                                    <Image
                                        src={profile.pfp || '/svg/farcaster.svg'}
                                        width={24}
                                        height={24}
                                        alt="farcaster"
                                        className=" rounded-full"
                                    />
                                    <span
                                        className={classNames(
                                            ' font-bold',
                                            currentFarcasterProfile?.profileId === profile.profileId
                                                ? ' text-secondary'
                                                : ' text-main',
                                        )}
                                    >
                                        @{profile.handle || profile.profileId}
                                    </span>
                                </div>
                                {currentFarcasterProfile?.profileId === profile.profileId ? (
                                    <YesIcon width={20} height={20} className=" relative -right-2" />
                                ) : (
                                    <button className=" font-bold text-blueBottom">
                                        <Trans>Switch</Trans>
                                    </button>
                                )}
                            </div>
                            {index !== farcasterProfiles.length - 1 && <div className=" h-px bg-line" />}
                        </Fragment>
                    ))
                ) : (
                    <Fragment>
                        <div className=" flex h-[22px] cursor-pointer items-center justify-between">
                            <div className=" flex items-center gap-2">
                                <FarcasterIcon width={24} height={24} />
                                <span className={classNames(' font-bold text-main')}>Farcaster</span>
                            </div>

                            <button
                                className=" font-bold text-blueBottom"
                                onClick={() => {
                                    if (images.length >= 2) {
                                        enqueueSnackbar(t`Select failed: More than 2 images`, {
                                            variant: 'error',
                                        });
                                    } else {
                                        LoginModalRef.open();
                                    }
                                }}
                            >
                                <Trans>Log in</Trans>
                            </button>
                        </div>
                    </Fragment>
                )}
            </Popover.Panel>
        </Transition>
    );
}

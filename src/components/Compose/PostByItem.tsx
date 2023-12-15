import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { Fragment } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import YesIcon from '@/assets/yes.svg';
import { SourceIcon } from '@/components/SourceIcon.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useCurrentProfiles } from '@/hooks/useCurrentProfiles.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface PostByItemProps {
    source: SocialPlatform;
}

export function PostByItem({ source }: PostByItemProps) {
    const enqueueSnackbar = useCustomSnackbar();

    const currentProfiles = useCurrentProfiles(source);
    const currentProfile = useCurrentProfile(source);
    const images = useComposeStateStore.use.images();
    const updateLoading = useComposeStateStore.use.updateLoading();
    const updateLensCurrentProfile = useLensStateStore.use.updateCurrentProfile();

    const [{ loading }, login] = useAsyncFn(
        async (profile: Profile) => {
            updateLoading(true);
            try {
                const session = await LensSocialMediaProvider.createSessionForProfileId(profile.profileId);

                updateLensCurrentProfile(profile, session);
                enqueueSnackbar(t`Your Lens account is now connected`, {
                    variant: 'success',
                });
            } catch (error) {
                enqueueSnackbar(error instanceof Error ? error.message : t`Failed to login`, { variant: 'error' });
            }
            updateLoading(false);
        },
        [enqueueSnackbar, updateLoading, updateLensCurrentProfile],
    );

    return currentProfile && currentProfiles.length > 0 ? (
        currentProfiles.map((profile) => (
            <Fragment key={profile.profileId}>
                <div className="flex h-[40px] items-center justify-between border-b border-secondaryLine last:border-none">
                    <div className=" flex items-center gap-2">
                        <Image
                            src={profile.pfp}
                            width={24}
                            height={24}
                            alt={profile.handle}
                            className=" rounded-full"
                        />
                        <span
                            className={classNames(
                                ' font-bold',
                                isSameProfile(currentProfile, profile) ? ' text-secondary' : ' text-main',
                            )}
                        >
                            @{profile.handle}
                        </span>
                    </div>
                    {isSameProfile(currentProfile, profile) ? (
                        <YesIcon width={40} height={40} className=" relative -right-2" />
                    ) : currentProfile.source === SocialPlatform.Lens ? (
                        <button
                            className=" font-bold text-blueBottom"
                            disabled={loading}
                            onClick={async () => login(profile)}
                        >
                            {loading ? (
                                <LoadingIcon className="animate-spin" width={24} height={24} />
                            ) : (
                                <Trans>Switch</Trans>
                            )}
                        </button>
                    ) : null}
                </div>
            </Fragment>
        ))
    ) : (
        <Fragment>
            <div className=" flex h-[40px] items-center justify-between border-b border-secondaryLine last:border-none">
                <div className=" flex items-center gap-2">
                    <SourceIcon size={24} source={source} />
                    <span className={classNames(' font-bold text-main')}>{resolveSourceName(source)}</span>
                </div>

                <button
                    className=" font-bold text-blueBottom"
                    onClick={async () => {
                        if (source === SocialPlatform.Farcaster && images.length > 2) {
                            enqueueSnackbar(t`Select failed: More than 2 images`, {
                                variant: 'error',
                            });
                            return;
                        }

                        ComposeModalRef.close();
                        await delay(300);
                        LoginModalRef.open();
                    }}
                >
                    <Trans>Log in</Trans>
                </button>
            </div>
        </Fragment>
    );
}

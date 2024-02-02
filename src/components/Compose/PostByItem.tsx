import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import RadioDisableNoIcon from '@/assets/radio.disable-no.svg';
import YesIcon from '@/assets/yes.svg';
import { Avatar } from '@/components/Avatar.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { SocialPlatform } from '@/constants/enum.js';
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
import { useLensStateStore } from '@/store/useProfileStore.js';

interface PostByItemProps {
    source: SocialPlatform;
}

export function PostByItem({ source }: PostByItemProps) {
    const enqueueSnackbar = useCustomSnackbar();

    const currentProfiles = useCurrentProfiles(source);
    const currentProfile = useCurrentProfile(source);
    const updateLensCurrentProfile = useLensStateStore.use.updateCurrentProfile();
    const { images, availableSources, updateLoading, enableSource, disableSource } = useComposeStateStore();

    const [{ loading }, login] = useAsyncFn(
        async (profile: Profile) => {
            updateLoading(true);
            try {
                const session = await LensSocialMediaProvider.createSessionForProfileId(profile.profileId);

                updateLensCurrentProfile(profile, session);
                enqueueSnackbar(t`Your Lens account is now connected.`, {
                    variant: 'success',
                });
            } catch (error) {
                console.log(error)
                enqueueSnackbar(
                    <div>
                        <span className="font-bold">
                            <Trans>Connection failed</Trans>
                        </span>
                        <br />
                        <Trans>The user declined the request.</Trans>
                    </div>,
                    { variant: 'error' },
                );
            }
            updateLoading(false);
        },
        [enqueueSnackbar, updateLoading, updateLensCurrentProfile],
    );

    if (!currentProfile || !currentProfiles?.length)
        return (
            <div className=" flex h-[40px] items-center justify-between border-b border-secondaryLine last:border-none">
                <div className=" flex items-center gap-2">
                    <SourceIcon size={24} source={source} />
                    <span className=" font-bold text-main">{resolveSourceName(source)}</span>
                </div>

                <button
                    className=" font-bold text-blueBottom"
                    onClick={async () => {
                        if (source === SocialPlatform.Farcaster && images.length > 2) {
                            enqueueSnackbar(t`Only up to 2 images can be chosen.`, {
                                variant: 'error',
                            });
                            return;
                        }

                        ComposeModalRef.close();
                        await delay(300);
                        LoginModalRef.open({
                            source,
                        });
                    }}
                >
                    <Trans>Log in</Trans>
                </button>
            </div>
        );

    return currentProfiles.map((profile) => (
        <div
            className="flex h-[40px] items-center justify-between border-b border-secondaryLine last:border-none"
            key={profile.profileId}
            onClick={() => {
                if (!isSameProfile(currentProfile, profile)) return;
                if (availableSources.includes(currentProfile.source)) disableSource(currentProfile.source);
                else enableSource(currentProfile.source);
            }}
        >
            <div className=" flex items-center gap-2">
                <Avatar src={profile.pfp} size={24} alt={profile.handle} style={{ height: 24 }} />
                <span
                    className={classNames(
                        ' font-bold',
                        isSameProfile(currentProfile, profile) ? ' text-main' : ' text-secondary',
                    )}
                >
                    @{profile.handle}
                </span>
            </div>
            {isSameProfile(currentProfile, profile) ? (
                availableSources.includes(currentProfile.source) ? (
                    <YesIcon width={40} height={40} className=" relative -right-[10px]" />
                ) : (
                    <RadioDisableNoIcon width={20} height={20} className=" text-secondaryLine" />
                )
            ) : currentProfile.source === SocialPlatform.Lens ? (
                <button
                    className=" font-bold text-blueBottom disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading}
                    onClick={async () => login(profile)}
                >
                    {loading ? <LoadingIcon className="animate-spin" width={24} height={24} /> : <Trans>Switch</Trans>}
                </button>
            ) : null}
        </div>
    ));
}

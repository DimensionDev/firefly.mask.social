import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
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
import { useLensStateStore } from '@/store/useLensStore.js';

interface PostByItemProps {
    source: SocialPlatform;
}

export function PostByItem({ source }: PostByItemProps) {
    const enqueueSnackbar = useCustomSnackbar();

    const currentProfiles = useCurrentProfiles(source);
    const currentProfile = useCurrentProfile(source);
    const updateLensCurrentProfile = useLensStateStore.use.updateCurrentProfile();
    const { images, updateLoading } = useComposeStateStore();

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
            <div
                className="flex h-[40px] items-center justify-between border-b border-secondaryLine last:border-none"
                key={profile.profileId}
            >
                <div className=" flex items-center gap-2">
                    <Avatar src={profile.pfp} size={24} alt={profile.handle} style={{ height: 24 }} />
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
                    <YesIcon width={40} height={40} className=" relative -right-[10px]" />
                ) : currentProfile.source === SocialPlatform.Lens ? (
                    <button
                        className=" font-bold text-blueBottom disabled:opacity-50"
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
        ))
    ) : (
        <div className=" flex h-[40px] items-center justify-between border-b border-secondaryLine last:border-none">
            <div className=" flex items-center gap-2">
                <SourceIcon size={24} source={source} />
                <span className=" font-bold text-main">{resolveSourceName(source)}</span>
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
                    LoginModalRef.open({
                        source,
                    });
                }}
            >
                <Trans>Log in</Trans>
            </button>
        </div>
    );
}

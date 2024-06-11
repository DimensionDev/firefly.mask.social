import { t, Trans } from '@lingui/macro';
import { produce } from 'immer';
import { memo } from 'react';

import { ToggleMutedButton } from '@/components/Actions/ToggleMutedButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { queryClient } from '@/configs/queryClient.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useToggleMutedProfile } from '@/hooks/useToggleMutedProfile.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
}

const setQueryDataForProfile = (profile: Profile, isMuted: boolean) => {
    queryClient.setQueryData(['profile-is-muted', profile.source, profile.profileId], isMuted);
    queryClient.setQueriesData<{ pages: Array<{ data: Profile[] }> }>(
        { queryKey: ['profiles', profile.source, 'muted-list'] },
        (oldData) => {
            if (!oldData) return oldData;
            return produce(oldData, (draft) => {
                for (const page of draft.pages) {
                    if (!page) continue;
                    for (const mutedProfile of page.data) {
                        if (!isSameProfile(mutedProfile, profile)) continue;
                        mutedProfile.viewerContext = {
                            ...mutedProfile.viewerContext,
                            blocking: isMuted,
                        };
                    }
                }
            });
        },
    );
};

export const ToggleMutedProfileButton = memo(function ToggleMutedProfileButton({ profile, ...rest }: Props) {
    const isMuted = profile.viewerContext?.blocking ?? true;

    const currentProfile = useCurrentProfile(profile.source);
    const [{ loading }, toggleMuted] = useToggleMutedProfile(currentProfile);

    const onToggle = async () => {
        const confirmed = await ConfirmModalRef.openAndWaitForClose({
            title: t`${isMuted ? 'Unmute' : 'Mute'} @${profile.handle}`,
            content: (
                <div className="text-main">
                    <Trans>
                        Confirm you want to {isMuted ? 'unmute' : 'mute'} @{profile.handle}?
                    </Trans>
                </div>
            ),
        });
        if (!confirmed) return;
        const result = await toggleMuted(profile);
        if (result) {
            setQueryDataForProfile(profile, !isMuted);
        }
    };

    return <ToggleMutedButton {...rest} isMuted={isMuted} loading={loading} onClick={onToggle} />;
});

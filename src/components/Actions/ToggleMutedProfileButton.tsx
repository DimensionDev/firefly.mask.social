import { t, Trans } from '@lingui/macro';
import { memo } from 'react';

import { ToggleMutedButton } from '@/components/Actions/ToggleMutedButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useToggleMutedProfile } from '@/hooks/useToggleMutedProfile.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
}

export const ToggleMutedProfileButton = memo(function ToggleMutedProfileButton({ profile, ...rest }: Props) {
    const isMuted = profile.viewerContext?.blocking ?? true;

    const currentProfile = useCurrentProfile(profile.source);
    const [{ loading }, toggleMuted] = useToggleMutedProfile(currentProfile);

    const onToggle = async () => {
        if (!isMuted) {
            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Mute @${profile.handle}`,
                content: (
                    <div className="text-main">
                        <Trans>Confirm you want to mute @{profile.handle}?</Trans>
                    </div>
                ),
            });
            if (!confirmed) return;
        }
        return toggleMuted(profile, isMuted);
    };

    return <ToggleMutedButton {...rest} isMuted={isMuted} loading={loading} onClick={onToggle} />;
});

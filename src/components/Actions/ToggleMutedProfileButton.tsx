import { t, Trans } from '@lingui/macro';
import { memo } from 'react';
import { useToggle } from 'react-use';

import { ToggleMutedButton } from '@/components/Actions/ToggleMutedButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useToggleMutedProfile } from '@/hooks/useToggleMutedProfile.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
    defaultMuted?: boolean;
}

export const ToggleMutedProfileButton = memo(function ToggleMutedProfileButton({
    profile,
    defaultMuted = true,
    ...rest
}: Props) {
    const [isMuted, setIsMuted] = useToggle(defaultMuted);

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
        const result = await toggleMuted(profile, isMuted);
        if (result) setIsMuted(!isMuted);
    };

    return <ToggleMutedButton {...rest} isMuted={isMuted} loading={loading} onClick={onToggle} />;
});

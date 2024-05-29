import { t, Trans } from '@lingui/macro';
import { memo } from 'react';
import { useToggle } from 'react-use';

import { ToggleMuteButton } from '@/components/Actions/ToggleMuteButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useToggleBlock } from '@/hooks/useToggleBlock.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ToggleMuteUserButtonProps extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
    defaultMuted?: boolean;
}

export const ToggleMuteUserButton = memo(function ToggleMuteUserButton({
    profile,
    defaultMuted = true,
    ...rest
}: ToggleMuteUserButtonProps) {
    // FIXME: we can use profile.viewerContext?.blocking instead of defaultMuted
    const [isMuted, setIsMuted] = useToggle(defaultMuted);

    const currentProfile = useCurrentProfile(profile.source);
    const [{ loading }, toggleBlock] = useToggleBlock(currentProfile);

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
        const result = await toggleBlock(profile);
        if (result) setIsMuted(!isMuted);
    };

    return <ToggleMuteButton {...rest} isMuted={isMuted} loading={loading} onClick={onToggle} />;
});

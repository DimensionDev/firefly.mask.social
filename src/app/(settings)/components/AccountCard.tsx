import { t, Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { Source } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSessionHolder } from '@/helpers/resolveSessionHolder.js';
import { LogoutModalRef } from '@/modals/controls.js';
import { createSessionForProfileId } from '@/providers/lens/createSessionForProfileId.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useLensStateStore } from '@/store/useProfileStore.js';

interface AccountCardProps {
    profile: Profile;
    isCurrent: boolean;
}

export function AccountCard({ profile, isCurrent }: AccountCardProps) {
    const updateCurrentAccount = useLensStateStore.use.updateCurrentAccount();

    const [{ loading }, login] = useAsyncFn(
        async (profile: Profile) => {
            try {
                const session = await createSessionForProfileId(profile.profileId);
                updateCurrentAccount({ profile, session });
                resolveSessionHolder(profile.source)?.resumeSession(session);
                enqueueSuccessMessage(t`Your Lens account is now connected`);
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`), {
                    error,
                });
                throw error;
            }
        },
        [updateCurrentAccount],
    );

    return (
        <div
            className="inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 dark:bg-bg"
            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
        >
            <ProfileAvatar profile={profile} size={36} />
            <ProfileName profile={profile} />
            {isCurrent ? (
                <ClickableButton
                    className="text-[15px] font-bold leading-none text-red-500"
                    onClick={() => {
                        LogoutModalRef.open({ source: profile.source });
                    }}
                >
                    <Trans>Log out</Trans>
                </ClickableButton>
            ) : (
                <ClickableButton
                    className="text-right text-[15px] font-bold leading-none text-main"
                    disabled={loading || profile.source === Source.Farcaster}
                    onClick={() => {
                        login(profile);
                    }}
                >
                    {loading ? <Trans>Switching...</Trans> : <Trans>Switch</Trans>}
                </ClickableButton>
            )}
        </div>
    );
}

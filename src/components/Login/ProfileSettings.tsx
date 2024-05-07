'use client';

import { CloudIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import LogOutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { OnlineStatusIndicator } from '@/components/OnlineStatusIndicator.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueInfoMessage } from '@/helpers/enqueueMessage.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import { useSwitchLensAccount } from '@/hooks/useSwitchLensAccount.js';
import { FireflySessionConfirmModalRef, LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { createSessionForProfileIdFirefly } from '@/providers/lens/createSessionForProfileId.js';
import { syncSessionFromFirefly } from '@/services/syncSessionFromFirefly.js';

interface ProfileSettingsProps {
    source: SocialSource;
    onClose?: () => void;
}

export function ProfileSettings({ source, onClose }: ProfileSettingsProps) {
    const { currentProfile, profiles, refreshProfiles } = useProfileStore(source);
    const { login } = useSwitchLensAccount();

    useEffect(() => {
        refreshProfiles();
    }, [refreshProfiles]);

    const [{ loading }, onDetect] = useAsyncFn(
        async (source: SocialSource) => {
            try {
                switch (source) {
                    case Source.Lens:
                        if (!currentProfile) break;
                        await createSessionForProfileIdFirefly(currentProfile.profileId);
                        break;
                    case Source.Farcaster:
                        if (!FarcasterSession.isGrantByPermission(farcasterSessionHolder.session, true)) break;
                        const fireflySession = await FireflySession.from(farcasterSessionHolder.session);
                        if (!fireflySession) break;
                        fireflySessionHolder.resumeSession(fireflySession);
                        break;
                    case Source.Twitter:
                        throw new Error('Not implemented');
                    default:
                        safeUnreachable(source);
                        break;
                }

                // failed to recover firefly session
                if (!fireflySessionHolder.session) throw new Error(t`Failed to create firefly session.`);

                await FireflySessionConfirmModalRef.openAndWaitForClose({
                    sessions: await syncSessionFromFirefly(),
                    onDetected(profiles) {
                        if (profiles.length) onClose?.();
                        else enqueueInfoMessage(t`No device accounts detected.`);
                    },
                });
            } catch (error) {
                enqueueErrorMessage(t`Failed to detect device accounts.`, { error });
                throw error;
            }
        },
        [currentProfile],
    );

    return (
        <div className=" flex flex-col overflow-x-hidden rounded-2xl bg-primaryBottom md:w-[290px] md:border md:border-line md:px-5">
            {profiles.map((profile) => (
                <ClickableButton
                    key={profile.profileId}
                    className="my-3 flex items-center justify-between gap-2 outline-none"
                    disabled={isSameProfile(currentProfile, profile) || source === Source.Farcaster}
                    onClick={async () => {
                        await login(profile);
                        onClose?.();
                    }}
                >
                    <ProfileAvatar profile={profile} clickable linkable />
                    <ProfileName profile={profile} />

                    {isSameProfile(currentProfile, profile) ? <OnlineStatusIndicator /> : null}
                </ClickableButton>
            ))}
            <ClickableButton
                className="flex w-full items-center rounded px-1 py-3 text-main outline-none hover:bg-bg"
                onClick={async () => {
                    if (source === Source.Twitter)
                        await signOut({
                            redirect: false,
                        });
                    LoginModalRef.open({ source });
                    onClose?.();
                }}
            >
                <UserAddIcon width={24} height={24} />
                <span className=" pl-2 text-[17px] font-bold leading-[22px] text-main">
                    <Trans>Switch account</Trans>
                </span>
            </ClickableButton>
            {(currentProfile && source === Source.Lens) ||
            (FarcasterSession.isGrantByPermission(farcasterSessionHolder.session, true) &&
                source === Source.Farcaster) ? (
                <ClickableButton
                    className="flex w-full items-center rounded px-1 py-3 text-main outline-none hover:bg-bg"
                    disabled={loading}
                    onClick={() => onDetect(source)}
                >
                    {loading ? (
                        <LoadingIcon className="animate-spin" width={24} height={24} />
                    ) : (
                        <CloudIcon width={24} height={24} />
                    )}
                    <span className=" pl-2 text-[17px] font-bold leading-[22px] text-main">
                        {loading ? <Trans>Detecting...</Trans> : <Trans>Detect device accounts</Trans>}
                    </span>
                </ClickableButton>
            ) : null}
            <ClickableButton
                className="mb-3 flex items-center rounded px-1 py-3 outline-none hover:bg-bg"
                onClick={() => {
                    LogoutModalRef.open({ source });
                    onClose?.();
                }}
            >
                <LogOutIcon width={24} height={24} />
                <span className=" pl-2 text-[17px] font-bold leading-[22px] text-danger">
                    <Trans>Log out</Trans>
                </span>
            </ClickableButton>
        </div>
    );
}

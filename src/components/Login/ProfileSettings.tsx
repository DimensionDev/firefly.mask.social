'use client';

import { CloudIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { signOut } from 'next-auth/react';
import { useRef } from 'react';
import { useAsyncFn, useMount, useUnmount } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import LogOutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { OnlineStatusIndicator } from '@/components/OnlineStatusIndicator.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { NODE_ENV, type SocialSource, Source } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { AbortError } from '@/constants/error.js';
import { enqueueErrorMessage, enqueueInfoMessage } from '@/helpers/enqueueMessage.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import {
    DraggablePopoverRef,
    FireflySessionConfirmModalRef,
    LoginModalRef,
    LogoutModalRef,
} from '@/modals/controls.js';
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
    const controllerRef = useRef<AbortController>();
    const { currentProfile, refreshProfiles } = useProfileStore(source);

    const [{ loading }, onDetect] = useAsyncFn(
        async (source: SocialSource) => {
            controllerRef.current?.abort(new AbortError());
            controllerRef.current = new AbortController();

            try {
                switch (source) {
                    case Source.Lens:
                        if (!currentProfile) break;
                        await createSessionForProfileIdFirefly(currentProfile.profileId, controllerRef.current?.signal);
                        break;
                    case Source.Farcaster:
                        if (!FarcasterSession.isGrantByPermission(farcasterSessionHolder.session, true)) break;
                        await FireflySession.fromAndRestore(
                            farcasterSessionHolder.session,
                            controllerRef.current?.signal,
                        );
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
                    source,
                    sessions: await syncSessionFromFirefly(controllerRef.current?.signal),
                    onDetected(profiles) {
                        if (!profiles.length) enqueueInfoMessage(t`No device accounts detected.`);
                        onClose?.();
                        DraggablePopoverRef.close();
                    },
                });
            } catch (error) {
                enqueueErrorMessage(t`Failed to detect device accounts.`, { error });
                throw error;
            }
        },
        [currentProfile],
    );

    useMount(() => {
        refreshProfiles();
    });

    useUnmount(() => {
        controllerRef.current?.abort(new AbortError());
    });

    if (!currentProfile) return null;

    const canDetect =
        env.shared.NODE_ENV === NODE_ENV.Development &&
        (source === Source.Lens ||
            (source === Source.Farcaster &&
                FarcasterSession.isGrantByPermission(farcasterSessionHolder.session, true)));

    return (
        <div className=" flex flex-col overflow-x-hidden rounded-2xl bg-primaryBottom md:w-[290px] md:border md:border-line">
            <ClickableButton
                key={currentProfile.profileId}
                className="flex min-w-0 items-center justify-between gap-3 py-3 outline-none md:px-5"
                disabled={source === Source.Farcaster}
            >
                <ProfileAvatar profile={currentProfile} clickable linkable />
                <ProfileName profile={currentProfile} />

                <OnlineStatusIndicator />
            </ClickableButton>
            <div className=" flex flex-col md:mx-5">
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
                {canDetect ? (
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
                    className="mb-3 flex items-center rounded px-1 py-3 outline-none hover:bg-bg "
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
        </div>
    );
}

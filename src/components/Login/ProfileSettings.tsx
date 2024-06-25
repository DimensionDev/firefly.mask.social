'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { signOut } from 'next-auth/react';
import { useRef } from 'react';
import { useAsyncFn, useMount, useUnmount } from 'react-use';

import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { NODE_ENV, type SocialSource, Source } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { AbortError, NotImplementedError } from '@/constants/error.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueInfoMessage } from '@/helpers/enqueueMessage.js';
import { getProfileState } from '@/helpers/getProfileState.js';
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
import { createSessionForProfileId } from '@/providers/lens/createSessionForProfileId.js';
import { syncAccountsFromFirefly } from '@/services/syncAccountsFromFirefly.js';

interface ProfileSettingsProps {
    source: SocialSource;
    onClose?: () => void;
}

export function ProfileSettings({ source, onClose }: ProfileSettingsProps) {
    const controllerRef = useRef<AbortController>();
    const { currentProfile } = useProfileStore(source);

    useMount(() => {
        getProfileState(source).refreshAccounts();
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

    const size = 1;

    return (
        <div className="flex flex-col overflow-x-hidden bg-primaryBottom md:w-[290px] md:rounded-2xl md:border md:border-line">
            <div
                className={classNames('max-h-[calc(62.5px*3)] overflow-auto md:max-h-[calc(72px*3)]', {
                    'mb-3': size > 1,
                })}
            >
                {Array.from({ length: size }).map((_, index) => (
                    <div
                        key={`${currentProfile.profileId}_${index}`}
                        className={classNames(
                            'flex min-w-0 items-center justify-between gap-3 rounded px-2 py-2 outline-none md:rounded-none md:px-5',
                            {
                                'cursor-pointer hover:bg-bg': index !== 0,
                            },
                        )}
                    >
                        <ProfileAvatar profile={currentProfile} clickable linkable />
                        <ProfileName profile={currentProfile} />
                        {index === 0 ? <CircleCheckboxIcon checked /> : null}
                    </div>
                ))}
            </div>

            <hr className="mb-3 border-b border-t-0 border-line" />

            <div className="flex flex-col md:mx-5">
                <ClickableButton
                    className="flex w-full items-center rounded px-2 py-3 text-main outline-none hover:bg-bg"
                    onClick={async () => {
                        if (source === Source.Twitter)
                            await signOut({
                                redirect: false,
                            });
                        LoginModalRef.open({ source });
                        onClose?.();
                    }}
                >
                    <span className="text-[17px] font-bold leading-[22px] text-main">
                        <Trans>Switch account</Trans>
                    </span>
                </ClickableButton>
                <ClickableButton
                    className="flex items-center overflow-hidden whitespace-nowrap rounded px-2 py-3 outline-none hover:bg-bg md:mb-3"
                    onClick={() => {
                        LogoutModalRef.open({ source });
                        onClose?.();
                    }}
                >
                    <span className="text-[17px] font-bold leading-[22px] text-danger">
                        <Trans>Log out @{currentProfile.handle}</Trans>
                    </span>
                </ClickableButton>
            </div>
        </div>
    );
}

import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { compact } from 'lodash-es';
import { forwardRef } from 'react';

import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSourceFromSessionType } from '@/helpers/resolveSource.js';
import { restoreProfile } from '@/helpers/restoreProfile.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { LensSession } from '@/providers/lens/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export type FireflySessionOpenConfirmModalProps = {
    sessions?: Array<LensSession | FarcasterSession>;
    onDetected?: (profiles: Profile[]) => void;
    signal?: AbortSignal;
} | void;

// true - indicates the user restored sessions
// false - indicates the users rejected the session restore
export type FireflySessionCloseConfirmModalProps = boolean;

export const FireflySessionConfirmModal = forwardRef<
    SingletonModalRefCreator<FireflySessionOpenConfirmModalProps, FireflySessionCloseConfirmModalProps>
>(function FireflySessionModal(_, ref) {
    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen(props) {
            try {
                const sessions = props?.sessions ?? [];

                // no session to restore
                if (!sessions.length) {
                    dispatch?.close(false);
                    return;
                }

                // convert session to profile
                const allSettled = await Promise.allSettled(
                    sessions.map((x) => {
                        const provider = resolveSocialMediaProvider(resolveSocialSourceFromSessionType(x.type));
                        return provider.getProfileById(x.profileId);
                    }),
                );
                const pairs = compact(
                    allSettled.map((x, i) =>
                        x.status === 'fulfilled'
                            ? {
                                  profile: x.value,
                                  session: sessions[i],
                              }
                            : null,
                    ),
                );

                // profiles detected, invoke the callback before showing the confirm modal
                props?.onDetected?.(pairs.map((x) => x.profile));

                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Device Logged In`,
                    content: (
                        <div>
                            <p className="text-[15px] font-medium leading-normal text-lightMain">
                                <Trans>One click to connect your account status.</Trans>
                            </p>
                            <ul className=" py-2">
                                {pairs.map(({ profile }) => (
                                    <ProfileInList
                                        key={profile.profileId}
                                        profile={profile}
                                        isSelected={false}
                                        onSelect={() => {}}
                                        ProfileAvatarProps={{
                                            enableSourceIcon: true,
                                        }}
                                    />
                                ))}
                            </ul>
                        </div>
                    ),
                    enableCancelButton: true,
                    cancelButtonText: t`Skip for now`,
                });

                if (confirmed) {
                    pairs.forEach(({ profile, session }) => restoreProfile(profile, [profile], session));
                }

                dispatch?.close(confirmed);
            } catch (error) {
                dispatch?.abort?.(error instanceof Error ? error : new Error('Failed to restore sessions.'));
            }
        },
    });

    return null;
});

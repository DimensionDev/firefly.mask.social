import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { compact } from 'lodash-es';
import { forwardRef, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSourceFromSessionType } from '@/helpers/resolveSource.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { LensSession } from '@/providers/lens/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileModalProps {
    pairs: Array<{
        profile: Profile;
        session: FarcasterSession | LensSession;
    }>;
    onConfirm?: () => void;
    onClose?: () => void;
}

function ProfileModal({ pairs, onConfirm, onClose }: ProfileModalProps) {
    const [selectedPairs, setSelectedPairs] = useState<Profile[]>([]);

    return (
        <div>
            <p className="mb-2 mt-[-8px] text-[15px] font-medium leading-normal text-lightMain">
                <Trans>One click to connect your account status.</Trans>
            </p>
            <ul className=" flex max-h-[288px] flex-col gap-2 overflow-auto py-2">
                {pairs.map(({ profile }) => (
                    <ProfileInList
                        key={profile.profileId}
                        profile={profile}
                        isSelected={selectedPairs.some((x) => isSameProfile(x, profile))}
                        onSelect={() => {
                            setSelectedPairs((prev) => {
                                const index = prev.findIndex((x) => isSameProfile(x, profile));
                                if (index !== -1) return prev.filter((_, i) => i !== index);
                                return [...prev, profile];
                            });
                        }}
                        ProfileAvatarProps={{
                            enableSourceIcon: true,
                        }}
                    />
                ))}
            </ul>
            <div className=" flex gap-2">
                <ClickableButton
                    className=" flex flex-1 items-center justify-center rounded-full border border-lightBottom py-[11px] font-bold text-lightBottom"
                    onClick={() => {
                        onConfirm?.();
                        ConfirmModalRef.close(false);
                    }}
                >
                    <Trans>Skip for now</Trans>
                </ClickableButton>
                <ClickableButton
                    className=" flex flex-1 items-center justify-center rounded-full bg-main py-[11px] font-bold text-primaryBottom disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={selectedPairs.length === 0}
                    onClick={() => {
                        onClose?.();
                        ConfirmModalRef.close(true);
                    }}
                >
                    <Trans>Confirm</Trans>
                </ClickableButton>
            </div>
        </div>
    );
}

export type FireflySessionOpenConfirmModalProps = {
    sessions?: Array<LensSession | FarcasterSession>;
    onDetected?: (profiles: Profile[]) => void;
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
                        <ProfileModal
                            pairs={pairs}
                            onConfirm={() => dispatch?.close(true)}
                            onClose={() => dispatch?.close(false)}
                        />
                    ),
                    enableCancelButton: false,
                    enableConfirmButton: false,
                });

                dispatch?.close(confirmed);
            } catch (error) {
                dispatch?.abort?.(error instanceof Error ? error : new Error('Failed to restore sessions.'));
            }
        },
    });

    return null;
});

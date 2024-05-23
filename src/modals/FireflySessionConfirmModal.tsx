import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { compact } from 'lodash-es';
import { forwardRef, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSourceFromSessionType } from '@/helpers/resolveSource.js';
import { restoreProfile } from '@/helpers/restoreProfile.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { LensSession } from '@/providers/lens/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Pair {
    profile: Profile;
    session: FarcasterSession | LensSession;
}

interface ProfileModalProps {
    pairs: Pair[];
    onConfirm?: () => void;
    onClose?: () => void;
}

function ProfileModal({ pairs, onConfirm, onClose }: ProfileModalProps) {
    const [selectedPairs, setSelectedPairs] = useState<Record<SocialSource, Pair | null>>({
        [Source.Farcaster]: null,
        [Source.Lens]: null,
        [Source.Twitter]: null,
    });

    return (
        <div>
            <p className="mb-2 mt-[-8px] text-[15px] font-medium leading-normal text-lightMain">
                <Trans>One click to connect your account status.</Trans>
            </p>
            <ul className=" flex max-h-[288px] flex-col gap-3 overflow-auto pb-4 pt-2">
                {pairs
                    .sort((a, b) => {
                        const aIndex = SORTED_SOCIAL_SOURCES.indexOf(a.profile.source);
                        const bIndex = SORTED_SOCIAL_SOURCES.indexOf(b.profile.source);
                        return aIndex - bIndex;
                    })
                    .map((pair) => (
                        <ProfileInList
                            key={pair.profile.profileId}
                            profile={pair.profile}
                            isSelected={Object.entries(selectedPairs).some(([_, x]) =>
                                isSameProfile(x?.profile, pair.profile),
                            )}
                            onSelect={() => {
                                setSelectedPairs((pairs) => {
                                    const currentPair = pairs[pair.profile.source];
                                    return {
                                        ...pairs,
                                        [pair.profile.source]:
                                            currentPair && isSameProfile(currentPair.profile, pair.profile)
                                                ? null
                                                : pair,
                                    };
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
                    className=" flex flex-1 items-center justify-center rounded-full border border-main py-2 font-bold text-main"
                    onClick={() => {
                        onClose?.();
                        ConfirmModalRef.close(false);
                    }}
                >
                    <Trans>Skip for now</Trans>
                </ClickableButton>
                <ClickableButton
                    className=" flex flex-1 items-center justify-center rounded-full bg-main py-2 font-bold text-primaryBottom"
                    disabled={compact(Object.values(selectedPairs)).length === 0}
                    onClick={() => {
                        Object.entries(selectedPairs).forEach(([_, x]) => {
                            if (!x) return;
                            restoreProfile(x.profile, [x.profile], x.session);
                        });
                        onConfirm?.();
                        ConfirmModalRef.close(true);
                    }}
                >
                    <Trans>Login</Trans>
                </ClickableButton>
            </div>
        </div>
    );
}

export type FireflySessionOpenConfirmModalProps = {
    source: SocialSource;
    sessions?: Array<LensSession | FarcasterSession>;
    onDetected?: (profiles: Profile[]) => void;
};

// true - indicates the user restored sessions
// false - indicates the users rejected the session restore
export type FireflySessionCloseConfirmModalProps = boolean;

export const FireflySessionConfirmModal = forwardRef<
    SingletonModalRefCreator<FireflySessionOpenConfirmModalProps, FireflySessionCloseConfirmModalProps>
>(function FireflySessionModal(_, ref) {
    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen(props) {
            try {
                const currentProfileAll = getCurrentProfileAll();

                const sessions = (props?.sessions ?? []).filter((x) => {
                    const source = resolveSocialSourceFromSessionType(x.type);

                    // if the session shares the same source with the current profile, skip the restore
                    if (source === props?.source) {
                        return false;
                    }

                    // if there is a session already logged in, skip the restore
                    if (
                        isSameProfile(currentProfileAll[source], {
                            source,
                            profileId: x.profileId,
                        } as unknown as Profile)
                    ) {
                        return false;
                    }

                    return true;
                });

                // no session to restore
                if (!sessions.length) {
                    dispatch?.close(false);
                    props?.onDetected?.([]);
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
                    enableCloseButton: false,
                });

                dispatch?.close(confirmed);
            } catch (error) {
                dispatch?.abort?.(error instanceof Error ? error : new Error('Failed to restore sessions.'));
            }
        },
    });

    return null;
});

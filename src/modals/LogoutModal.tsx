'use client';

import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { signOut } from 'next-auth/react';
import { forwardRef } from 'react';

import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { getProfileStoreAll } from '@/helpers/getProfilesAll.js';
import { resolveSessionHolder } from '@/helpers/resolveSessionHolder.js';
import { resolveSessionType } from '@/helpers/resolveSessionType.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';
import { useProfileTabState } from '@/store/useProfileTabsStore.js';

export interface LogoutModalProps {
    source?: SocialSource;
}

export const LogoutModal = forwardRef<SingletonModalRefCreator<LogoutModalProps | void>>(function LogoutModal(_, ref) {
    const router = useRouter();

    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen(props) {
            const profileStoreAll = getProfileStoreAll();
            const profiles = compact(
                props?.source
                    ? [profileStoreAll[props.source].currentProfile]
                    : SORTED_SOCIAL_SOURCES.flatMap((x) => profileStoreAll[x].currentProfile),
            );

            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Log out`,
                content: (
                    <>
                        <div className="text-[15px] font-medium leading-normal text-lightMain">
                            <Trans>Confirm to log out this account?</Trans>
                        </div>
                        {profiles.map((profile) => (
                            <div
                                key={profile.profileId}
                                className="flex items-center justify-between gap-2 rounded-[8px] px-3 py-2 backdrop-blur-[8px]"
                            >
                                <ProfileAvatar profile={profile} size={36} />
                                <ProfileName profile={profile} />
                            </div>
                        ))}
                    </>
                ),
            });
            if (!confirmed) return;

            const source = props?.source;

            // call next-auth signOut for twitter
            if (!source || source === Source.Twitter) {
                await signOut({
                    redirect: false,
                });
            }

            if (source) {
                profileStoreAll[source].clear();
                resolveSessionHolder(source)?.removeSession();

                // remove firefly session if it's the parent session matches the source
                if (fireflySessionHolder.session?.parent?.type === resolveSessionType(source)) {
                    useFireflyStateStore.getState().clear();
                    fireflySessionHolder.removeSession();
                }
            } else {
                SORTED_SOCIAL_SOURCES.forEach((x) => {
                    profileStoreAll[x].clear();
                    resolveSessionHolder(x)?.removeSession();
                });
                useFireflyStateStore.getState().clear();
                fireflySessionHolder.removeSession();
            }

            useProfileTabState.getState().reset();

            dispatch?.close();
            await delay(300);
            router.push('/');
        },
    });

    return null;
});

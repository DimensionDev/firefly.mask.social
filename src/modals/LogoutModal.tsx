'use client';

import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { forwardRef } from 'react';

import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { removeAllAccounts, removeCurrentAccount } from '@/helpers/account.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';
import { useProfileTabState } from '@/store/useProfileTabsStore.js';

export interface LogoutModalProps {
    account?: Account;
}

export const LogoutModal = forwardRef<SingletonModalRefCreator<LogoutModalProps | void>>(function LogoutModal(_, ref) {
    const router = useRouter();

    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen(props) {
            const accounts = compact(
                props?.account ? [props.account] : SORTED_SOCIAL_SOURCES.flatMap((x) => getProfileState(x).accounts),
            );

            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Log out`,
                content: (
                    <>
                        <div className="text-[15px] font-medium leading-normal text-lightMain">
                            {props?.account ? (
                                <Trans>Confirm to log out this account?</Trans>
                            ) : (
                                <Trans>Confirm to log out all accounts?</Trans>
                            )}
                        </div>
                        {accounts.map((account) => (
                            <div
                                key={account.profile.profileId}
                                className="flex items-center justify-between gap-2 rounded-[8px] px-3 py-2 backdrop-blur-[8px]"
                            >
                                <ProfileAvatar profile={account.profile} size={36} />
                                <ProfileName profile={account.profile} />
                            </div>
                        ))}
                    </>
                ),
            });
            if (!confirmed) return;

            const source = props?.account?.profile.source;

            if (source) {
                await removeCurrentAccount(source);
            } else {
                await removeAllAccounts();
            }

            useProfileTabState.getState().reset();

            dispatch?.close();
            await delay(300);
            router.push('/');
        },
    });

    return null;
});

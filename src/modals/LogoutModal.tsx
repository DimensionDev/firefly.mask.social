'use client';

import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { forwardRef } from 'react';

import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { removeAllAccounts, removeCurrentAccount } from '@/helpers/account.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';

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
                        <div className="text-medium font-medium leading-normal text-lightMain">
                            {props?.account ? (
                                <Trans>Confirm to log out this account?</Trans>
                            ) : (
                                <Trans>Confirm to log out all accounts?</Trans>
                            )}
                        </div>
                        <ul className="flex max-h-[192px] flex-col gap-3 overflow-auto pb-4 pt-2">
                            {accounts.map((account) => (
                                <ProfileInList
                                    key={account.profile.profileId}
                                    selected
                                    selectable={false}
                                    profile={account.profile}
                                    ProfileAvatarProps={{
                                        enableSourceIcon: true,
                                    }}
                                />
                            ))}
                        </ul>
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

            dispatch?.close();
            await delay(300);
            router.push('/');
        },
    });

    return null;
});

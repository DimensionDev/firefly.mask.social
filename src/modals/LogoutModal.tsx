'use client';

import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { forwardRef } from 'react';

import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';
import { removeAllAccounts, removeCurrentAccount } from '@/services/account.js';

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
                contentClass: 'px-0 !pt-0',
                confirmButtonClass: 'mx-6',
                content: (
                    <div className="flex flex-col gap-2">
                        <div className="px-6 text-medium font-medium leading-normal text-lightMain">
                            {props?.account ? (
                                <Trans>Confirm to log out this account?</Trans>
                            ) : (
                                <Trans>Confirm to log out all accounts?</Trans>
                            )}
                        </div>
                        <menu
                            className={classNames(
                                'flex max-h-[192px] flex-col gap-3 overflow-auto px-6 pt-2',
                                accounts.length <= 1 ? 'pb-2' : 'pb-6',
                            )}
                        >
                            {accounts.map((account) => (
                                <div className="rounded-lg px-3 py-2 shadow-primary" key={account.profile.profileId}>
                                    <ProfileInList
                                        key={account.profile.profileId}
                                        selected
                                        selectable={false}
                                        profile={account.profile}
                                        profileAvatarProps={{
                                            enableSourceIcon: true,
                                        }}
                                    />
                                </div>
                            ))}
                        </menu>
                    </div>
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
            router.push(
                '/',
                {},
                {
                    showProgressBar: false,
                },
            );
        },
    });

    return null;
});

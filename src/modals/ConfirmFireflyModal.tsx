import { t, Trans } from '@lingui/macro';
import { compact } from 'lodash-es';
import { forwardRef } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ConfirmFireflyModalRef, ConfirmModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';

export interface ConfirmFireflyModalOpenProps {
    belongsTo: boolean;
    accounts: Account[];
}

export type ConfirmFireflyModalCloseProps = boolean;

export const ConfirmFireflyModal = forwardRef<
    SingletonModalRefCreator<ConfirmFireflyModalOpenProps, ConfirmFireflyModalCloseProps>
>(function ConfirmFireflyModal(_, ref) {
    useSingletonModal(ref, {
        onOpen: async (props) => {
            const { belongsTo, accounts } = props;

            ConfirmModalRef.open({
                title: t`Accounts Connected`,
                content: (
                    <div>
                        <p className="mb-2 mt-[-8px] text-[15px] font-medium leading-normal text-second">
                            {belongsTo ? (
                                <Trans>Confirm to sync accounts</Trans>
                            ) : (
                                <Trans>
                                    You are logging into a different Firefly account. Continuing will{' '}
                                    <strong className="text-danger">overwrite</strong> your current accounts.
                                </Trans>
                            )}
                        </p>
                        <ul className="no-scrollbar flex max-h-[192px] flex-col gap-3 overflow-auto pb-4 pt-2">
                            {accounts
                                .sort((a, b) => {
                                    const aIndex = SORTED_SOCIAL_SOURCES.indexOf(a.profile.source);
                                    const bIndex = SORTED_SOCIAL_SOURCES.indexOf(b.profile.source);
                                    return aIndex - bIndex;
                                })
                                .map(({ profile }) => (
                                    <ProfileInList
                                        key={profile.profileId}
                                        selected
                                        selectable={false}
                                        profile={profile}
                                        ProfileAvatarProps={{
                                            enableSourceIcon: true,
                                        }}
                                    />
                                ))}
                        </ul>
                        <div className="flex gap-2">
                            <ClickableButton
                                className="box-border flex h-10 flex-1 items-center justify-center rounded-full border border-main text-[15px] font-bold text-main"
                                onClick={() => {
                                    ConfirmModalRef.close(false);
                                    ConfirmFireflyModalRef.close(false);
                                }}
                            >
                                <Trans>Skip</Trans>
                            </ClickableButton>
                            <ClickableButton
                                className="box-border flex h-10 flex-1 items-center justify-center rounded-full bg-main text-[15px] font-bold text-primaryBottom"
                                disabled={compact(Object.values(accounts)).length === 0}
                                onClick={() => {
                                    ConfirmModalRef.close(true);
                                    ConfirmFireflyModalRef.close(true);
                                }}
                            >
                                <Trans>Login</Trans>
                            </ClickableButton>
                        </div>
                    </div>
                ),
                enableCancelButton: false,
                enableConfirmButton: false,
                enableCloseButton: false,
            });
        },
    });

    return null;
});

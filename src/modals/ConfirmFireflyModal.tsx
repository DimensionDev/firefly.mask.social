import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { compact } from 'lodash-es';
import { forwardRef } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';

export interface ConfirmFireflyModalOpenProps {
    belongsTo: boolean;
    accounts: Account[];
}

export type ConfirmFireflyModalCloseProps = boolean;

export const ConfirmFireflyModal = forwardRef<
    SingletonModalRefCreator<ConfirmFireflyModalOpenProps, ConfirmFireflyModalCloseProps>
>(function ConfirmFireflyModal(_, ref) {
    const [, dispatch] = useSingletonModal(ref, {
        onOpen: async (props) => {
            const { belongsTo, accounts } = props;

            ConfirmModalRef.open({
                title: t`Device Logged In`,
                content: (
                    <div>
                        <p className="mb-2 mt-[-8px] text-[15px] font-medium leading-normal text-lightMain">
                            {belongsTo ? (
                                <Trans>Confirm to connect your account status.</Trans>
                            ) : (
                                <Trans>
                                    You are logging into a different Firefly account. Continuing will{' '}
                                    <strong className="text-danger">overwrite</strong> your current accounts.
                                </Trans>
                            )}
                        </p>
                        <ul className="flex max-h-[192px] flex-col gap-3 overflow-auto pb-4 pt-2">
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
                                className="flex flex-1 items-center justify-center rounded-full border border-main py-2 font-bold text-main"
                                onClick={() => ConfirmModalRef.close(false)}
                            >
                                <Trans>Skip for now</Trans>
                            </ClickableButton>
                            <ClickableButton
                                className="flex flex-1 items-center justify-center rounded-full bg-main py-2 font-bold text-primaryBottom"
                                disabled={compact(Object.values(accounts)).length === 0}
                                onClick={() => ConfirmModalRef.close(true)}
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

import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { compact } from 'lodash-es';
import { forwardRef } from 'react';
import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { type ProfileSource } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';

interface ProfileModalProps {
    accounts: Account[];
    onConfirm?: () => void;
    onClose?: () => void;
}

function ProfileModal({ accounts, onConfirm, onClose }: ProfileModalProps) {
    const [{ loading }, onConfirmAll] = useAsyncFn(async () => {
        try {
            onConfirm?.();
            ConfirmModalRef.close(true);
        } catch (error) {
            enqueueErrorMessage(t`Failed to restore accounts.`, {
                error,
            });
            throw error;
        }
    }, [accounts, onConfirm]);

    return (
        <div>
            <p className="mb-2 mt-[-8px] text-[15px] font-medium leading-normal text-lightMain">
                <Trans>Confirm to connect your account status.</Trans>
            </p>
            <ul className="flex max-h-[288px] flex-col gap-3 overflow-auto pb-4 pt-2">
                {accounts
                    .sort((a, b) => {
                        const aIndex = SORTED_SOCIAL_SOURCES.indexOf(a.profile.source);
                        const bIndex = SORTED_SOCIAL_SOURCES.indexOf(b.profile.source);
                        return aIndex - bIndex;
                    })
                    .map((account) => (
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
            <div className="flex gap-2">
                <ClickableButton
                    className="flex flex-1 items-center justify-center rounded-full border border-main py-2 font-bold text-main"
                    onClick={() => {
                        onClose?.();
                        ConfirmModalRef.close(false);
                    }}
                >
                    <Trans>Skip for now</Trans>
                </ClickableButton>
                <ClickableButton
                    className="flex flex-1 items-center justify-center rounded-full bg-main py-2 font-bold text-primaryBottom"
                    disabled={compact(Object.values(accounts)).length === 0 || loading}
                    onClick={onConfirmAll}
                >
                    {loading ? <Trans>Loading...</Trans> : <Trans>Login</Trans>}
                </ClickableButton>
            </div>
        </div>
    );
}

export interface FireflySessionOpenConfirmModalProps {
    source: ProfileSource;
    accounts: Account[];
}

// true - indicates the user restored sessions
// false - indicates the users rejected the session restore
export type FireflySessionCloseConfirmModalProps = boolean;

export const FireflySessionConfirmModal = forwardRef<
    SingletonModalRefCreator<FireflySessionOpenConfirmModalProps, FireflySessionCloseConfirmModalProps>
>(function FireflySessionModal(_, ref) {
    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen(props) {
            try {
                // not valid profile detected
                const accounts = props.accounts;
                if (!accounts.length) {
                    dispatch?.close(false);
                    return;
                }

                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Device Logged In`,
                    content: (
                        <ProfileModal
                            accounts={accounts}
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

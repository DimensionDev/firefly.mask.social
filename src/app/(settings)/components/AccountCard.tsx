import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveProfileStoreFromSocialSource } from '@/helpers/resolveProfileStore.js';
import { resolveSessionHolder } from '@/helpers/resolveSessionHolder.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { LogoutModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';
import { useLensStateStore } from '@/store/useProfileStore.js';

interface AccountCardProps {
    account: Account;
    isCurrent: boolean;
}

export function AccountCard({ account, isCurrent }: AccountCardProps) {
    const updateCurrentAccount = useLensStateStore.use.updateCurrentAccount();

    const [{ loading }, login] = useAsyncFn(
        async (nextAccount: Account) => {
            try {
                const source = nextAccount.profile.source;
                resolveProfileStoreFromSocialSource(source).getState().updateCurrentAccount(nextAccount);
                resolveSessionHolder(source)?.resumeSession(nextAccount.session);

                // Wait for the session to be fully restored
                await delay(1000);

                enqueueSuccessMessage(t`Your ${resolveSourceName(source)} account is now connected`);
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`), {
                    error,
                });
                throw error;
            }
        },
        [updateCurrentAccount],
    );

    return (
        <div
            className="inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 dark:bg-bg"
            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
        >
            <ProfileAvatar profile={account.profile} size={36} />
            <ProfileName profile={account.profile} />
            {isCurrent ? (
                <ClickableButton
                    className="text-[15px] font-bold leading-none text-red-500"
                    onClick={() => {
                        LogoutModalRef.open({ source: account.profile.source });
                    }}
                >
                    <Trans>Log out</Trans>
                </ClickableButton>
            ) : (
                <ClickableButton
                    className="text-right text-[15px] font-bold leading-none text-main"
                    disabled={loading}
                    onClick={() => {
                        login(account);
                    }}
                >
                    {loading ? <Trans>Switching...</Trans> : <Trans>Switch</Trans>}
                </ClickableButton>
            )}
        </div>
    );
}

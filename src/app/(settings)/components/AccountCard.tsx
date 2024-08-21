import { t, Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import type { SocialSource } from '@/constants/enum.js';
import { switchAccount } from '@/helpers/account.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';

interface AccountCardProps {
    source: SocialSource;
}

export function AccountCard({ source }: AccountCardProps) {
    const profile = useCurrentProfile(source);
    const accounts = useConnectedAccounts(source);
    const [{ loading }, login] = useAsyncFn(async (nextAccount: Account) => {
        try {
            await switchAccount(nextAccount);
            enqueueSuccessMessage(t`Your ${resolveSourceName(nextAccount.profile.source)} account is now connected.`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login.`), {
                error,
            });
            throw error;
        }
    }, []);

    return (
        <div className="flex w-full flex-col gap-4">
            {accounts.map((account) => (
                <div
                    key={account.profile.profileId}
                    className="inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 shadow-primary backdrop-blur dark:bg-bg"
                >
                    <ProfileAvatar profile={account.profile} size={36} />
                    <ProfileName profile={account.profile} />
                    {isSameProfile(account.profile, profile) && account.session ? (
                        <ClickableButton
                            className="text-[15px] font-bold leading-none text-red-500"
                            onClick={() => {
                                LogoutModalRef.open({ account: { ...account, session: account.session! } });
                            }}
                        >
                            <Trans>Log out</Trans>
                        </ClickableButton>
                    ) : account.session ? (
                        <ClickableButton
                            className="text-right text-[15px] font-bold leading-none text-main"
                            disabled={loading}
                            onClick={() => {
                                login({ ...account, session: account.session! });
                            }}
                        >
                            {loading ? <Trans>Switching...</Trans> : <Trans>Switch</Trans>}
                        </ClickableButton>
                    ) : (
                        <ClickableButton
                            className="text-right text-[15px] font-bold leading-none text-main"
                            disabled={loading}
                            onClick={() => {
                                LoginModalRef.open({
                                    source,
                                    options: { expectedProfile: account.profile.profileId },
                                });
                            }}
                        >
                            <Trans>Login</Trans>
                        </ClickableButton>
                    )}
                </div>
            ))}
        </div>
    );
}

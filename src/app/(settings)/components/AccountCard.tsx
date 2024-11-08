'use client';

import { t, Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import DisconnectIcon from '@/assets/disconnect.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { Tooltip } from '@/components/Tooltip.js';
import type { SocialSource } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { DisconnectFireflyAccountModalRef, LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';
import { switchAccount } from '@/services/account.js';

interface AccountCardProps {
    source: SocialSource;
}

function DisconnectButton({ account, accounts }: { account: Account; accounts: Account[] }) {
    const [{ loading }, disconnect] = useAsyncFn(async () => {
        await DisconnectFireflyAccountModalRef.openAndWaitForClose({
            account,
        });
    }, [account]);

    return (
        <Tooltip placement="top" content={<Trans>Disconnect</Trans>}>
            <ClickableButton
                className="flex items-center text-medium font-bold leading-none text-main"
                disabled={loading}
                onClick={async () => {
                    if (accounts.length <= 1) {
                        enqueueErrorMessage(
                            t`Failed to disconnect. Please leave at least 1 account or wallet address connected to keep your immersive experience in Firefly.`,
                        );
                        return;
                    }
                    await disconnect();
                }}
            >
                {loading ? (
                    <LoadingIcon width={20} height={20} className="h-5 w-5 shrink-0 animate-spin" />
                ) : (
                    <DisconnectIcon width={20} height={20} className="h-5 w-5 shrink-0" />
                )}
            </ClickableButton>
        </Tooltip>
    );
}

export function AccountCard({ source }: AccountCardProps) {
    const profile = useCurrentProfile(source);
    const accounts = useConnectedAccounts(source);
    const [{ loading }, login] = useAsyncFn(async (nextAccount: Account) => {
        try {
            await switchAccount(nextAccount);
            enqueueSuccessMessage(t`Profile Switched`);
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
                    <DisconnectButton account={account} accounts={accounts} />
                    {isSameProfile(account.profile, profile) && account.session ? (
                        <ClickableButton
                            className="text-medium font-bold leading-none text-main"
                            onClick={() => {
                                LogoutModalRef.open({ account: { ...account, session: account.session! } });
                            }}
                        >
                            <Trans>Log out</Trans>
                        </ClickableButton>
                    ) : account.session ? (
                        <ClickableButton
                            className="text-right text-medium font-bold leading-none text-main"
                            disabled={loading}
                            onClick={() => {
                                login({ ...account, session: account.session! });
                            }}
                        >
                            {loading ? <Trans>Switching...</Trans> : <Trans>Switch</Trans>}
                        </ClickableButton>
                    ) : (
                        <ClickableButton
                            className="text-right text-medium font-bold leading-none text-main"
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

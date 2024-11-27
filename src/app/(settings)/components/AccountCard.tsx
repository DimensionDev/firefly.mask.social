'use client';

import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import DisconnectIcon from '@/assets/disconnect.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { Tooltip } from '@/components/Tooltip.js';
import { config } from '@/configs/wagmiClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useProfileStoreAll } from '@/hooks/useProfileStore.js';
import { DisconnectFireflyAccountModalRef, LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Account } from '@/providers/types/Account.js';
import { switchAccount } from '@/services/account.js';

interface AccountCardProps {
    source: SocialSource;
}

function DisconnectButton({ account }: { account: Account }) {
    const all = useProfileStoreAll();
    const [{ loading }, disconnect] = useAsyncFn(async () => {
        const accounts = Object.keys(all)
            .map((k) => {
                const key = k as SocialSource;
                return all[key]?.accounts;
            })
            .filter((x) => x)
            .flat();

        if (accounts.length <= 1) {
            enqueueErrorMessage(
                t`Failed to disconnect. Please leave at least 1 account or wallet address connected to keep your immersive experience in Firefly.`,
            );
            return;
        }
        await DisconnectFireflyAccountModalRef.openAndWaitForClose({
            account,
        });
    }, [all]);

    return (
        <Tooltip placement="top" content={<Trans>Disconnect</Trans>}>
            <ClickableButton
                className="flex items-center text-medium font-bold leading-none text-main"
                disabled={loading}
                onClick={disconnect}
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

    const isLens = source === Source.Lens;
    const account = useAccount();
    const { data: profiles = EMPTY_LIST } = useQuery({
        enabled: isLens,
        queryKey: ['lens', 'profiles', account.address],
        queryFn: async () => {
            try {
                const { account } = await getWalletClientRequired(config);
                const profiles = await LensSocialMediaProvider.getProfilesByAddress(account.address);
                return profiles ?? EMPTY_LIST;
            } catch {
                return EMPTY_LIST;
            }
        },
        select: (profiles) => {
            if (!profiles) return EMPTY_LIST;
            const { accounts } = getProfileState(Source.Lens);
            return profiles
                .filter((x) => !accounts.some((y) => isSameProfile(x, y.profile)))
                .map((x) => ({ profile: x, session: null }));
        },
    });

    const allAccounts = isLens ? uniqBy([...accounts, ...profiles], (x) => x.profile.profileId) : accounts;

    return (
        <div className="flex w-full flex-col gap-4">
            {allAccounts.map((account) => (
                <div
                    key={account.profile.profileId}
                    className="inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 shadow-primary backdrop-blur dark:bg-bg"
                >
                    <ProfileAvatar profile={account.profile} size={36} />
                    <ProfileName profile={account.profile} />
                    {account.session ? <DisconnectButton account={account} /> : null}
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

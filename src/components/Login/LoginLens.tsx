'use client';

import { Switch } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { isSameAddress } from '@masknet/web3-shared-base';
import { first } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import WalletIcon from '@/assets/wallet.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { NODE_ENV, Source } from '@/constants/enum.js';
import { AbortError } from '@/constants/error.js';
import { addAccount } from '@/helpers/account.js';
import { enqueueErrorMessage, enqueueInfoMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useAbortController } from '@/hooks/useAbortController.js';
import {
    AccountModalRef,
    ConnectWalletModalRef,
    FireflySessionConfirmModalRef,
    LoginModalRef,
} from '@/modals/controls.js';
import { createSessionForProfileId } from '@/providers/lens/createSessionForProfileId.js';
import { updateSignless } from '@/providers/lens/updateSignless.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { syncAccountsFromFirefly } from '@/services/syncAccountsFromFirefly.js';

interface LoginLensProps {
    profiles: Profile[];
    currentAccount: string;
}

export function LoginLens({ profiles, currentAccount }: LoginLensProps) {
    const controller = useAbortController();

    const [selectedProfile, setSelectedProfile] = useState<Profile>();
    const [signless, setSignless] = useState(false);

    const account = useAccount();
    const currentProfile = selectedProfile || first(profiles);
    const { accounts } = getProfileState(Source.Lens);

    const [{ loading }, login] = useAsyncFn(
        async (signless: boolean) => {
            if (!profiles.length || !currentProfile) return;

            controller.current.renew();

            try {
                const session = await createSessionForProfileId(currentProfile.profileId, controller.current.signal);

                if (!currentProfile.signless && signless) {
                    await updateSignless(true);
                }

                // add new account for lens
                await addAccount({
                    profile: currentProfile,
                    session,
                });
                enqueueSuccessMessage(t`Your ${resolveSourceName(Source.Lens)} account is now connected.`);

                const accounts = await syncAccountsFromFirefly(controller.current.signal);
                if (!accounts.length) {
                    LoginModalRef.close();
                    return;
                }

                // restore profiles exclude lens
                await FireflySessionConfirmModalRef.openAndWaitForClose({
                    source: Source.Lens,
                    accounts,
                    onDetected(profiles) {
                        if (!profiles.length)
                            enqueueInfoMessage(t`No device accounts detected.`, {
                                environment: NODE_ENV.Development,
                            });
                        LoginModalRef.close();
                    },
                });
            } catch (error) {
                // skip if the error is abort error
                if (AbortError.is(error)) return;

                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`), {
                    error,
                });
                throw error;
            }
        },
        [profiles, currentProfile],
    );

    useEffect(() => {
        if (!currentProfile) return;
        if (!isSameAddress(account.address, currentAccount)) LoginModalRef.close();
    }, [currentProfile, account, currentAccount]);

    return (
        <div
            className="flex flex-col overflow-auto rounded-[12px] md:max-h-[535px] md:w-[600px] md:pb-[80px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="no-scrollbar flex w-full flex-col gap-4 overflow-auto md:min-h-[300px] md:p-4">
                {profiles.length ? (
                    <>
                        <div className="flex w-full flex-col gap-4 rounded-[8px] bg-lightBg px-4 py-6">
                            <div className="w-full text-left text-[14px] leading-[16px] text-second">
                                <Trans>Sign the transaction to verify you are the owner of the selected profile.</Trans>
                            </div>
                            {profiles.map((profile) => {
                                const isAdded = accounts.some((x) => isSameProfile(x.profile, profile));
                                return (
                                    <ProfileInList
                                        key={profile.profileId}
                                        profile={profile}
                                        selected={isSameProfile(currentProfile, profile) || isAdded}
                                        onSelect={setSelectedProfile}
                                    />
                                );
                            })}
                        </div>
                        {currentProfile?.signless ||
                        !isSameAddress(currentProfile?.ownedBy?.address, account.address) ? null : (
                            <div className="flex w-full flex-col gap-2 rounded-[8px] bg-lightBg px-4 py-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[14px] font-bold leading-[18px] text-lightMain">
                                        <Trans>Delegate Signing (Recommend)</Trans>
                                    </span>
                                    <Switch checked={signless} onChange={setSignless}>
                                        {({ checked }) => (
                                            <button
                                                className={`${
                                                    checked ? 'bg-success' : 'bg-gray-200'
                                                } relative inline-flex h-[22px] w-[43px] items-center rounded-full`}
                                            >
                                                <span className="sr-only">Enable signless</span>
                                                <span
                                                    className={`${
                                                        checked ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                                                />
                                            </button>
                                        )}
                                    </Switch>
                                </div>
                                <div className="w-full text-left text-[14px] leading-[16px] text-second">
                                    <Trans>
                                        Allow Lens Manager to perform actions such as posting, liking, and commenting
                                        without the need to sign each transaction.
                                    </Trans>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex w-full flex-col gap-2 rounded-[8px] bg-lightBg px-4 py-6">
                        <div className="w-full text-left text-[14px] leading-[16px] text-second">
                            <Trans>No Lens profile found. Please change to another wallet.</Trans>
                        </div>
                    </div>
                )}

                <div
                    className="absolute bottom-0 left-0 flex w-full items-center justify-between rounded-b-[8px] bg-lightBottom80 p-4"
                    style={{
                        boxShadow: 'box-shadow: -1px 0px 20px 0px rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <ClickableButton
                        className="flex items-center gap-2 py-[11px]"
                        onClick={async () => {
                            LoginModalRef.close();
                            await delay(300);
                            if (account.isConnected) AccountModalRef.open();
                            else ConnectWalletModalRef.open();
                        }}
                    >
                        <WalletIcon width={20} height={20} />
                        <span className="text-[14px] font-bold leading-[18px] text-second">
                            <Trans>Change Wallet</Trans>
                        </span>
                    </ClickableButton>
                    <ClickableButton
                        disabled={loading}
                        className="flex h-10 w-[120px] items-center justify-center gap-2 rounded-[99px] bg-lightMain text-sm font-bold text-primaryBottom"
                        onClick={() => login(signless)}
                    >
                        {loading ? (
                            <LoadingIcon className="animate-spin" width={24} height={24} />
                        ) : (
                            <Trans>Sign</Trans>
                        )}
                    </ClickableButton>
                </div>
            </div>
        </div>
    );
}

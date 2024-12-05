'use client';

import { Switch } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { first } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import GhostHoleIcon from '@/assets/ghost.svg';
import LoadingIcon from '@/assets/loading.svg';
import WalletIcon from '@/assets/wallet.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { Source } from '@/constants/enum.js';
import { AbortError } from '@/constants/error.js';
import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useAbortController } from '@/hooks/useAbortController.js';
import { AccountModalRef, ConnectWalletModalRef, LoginModalRef } from '@/modals/controls.js';
import { createAccountForProfileId } from '@/providers/lens/createAccountForProfileId.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { updateSignless } from '@/providers/lens/updateSignless.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { addAccount } from '@/services/account.js';

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

    const [{ loading }, login] = useAsyncFn(
        async (signless: boolean) => {
            if (!profiles.length || !currentProfile) return;

            controller.current.renew();

            try {
                const account = await createAccountForProfileId(currentProfile, controller.current.signal);

                if (!currentProfile.signless && signless) {
                    await updateSignless(true, account.session);
                }

                const done = await addAccount(account, {
                    signal: controller.current.signal,
                });
                if (done) {
                    enqueueSuccessMessage(t`Your ${resolveSourceName(Source.Lens)} account is now connected.`);

                    // after login, move the session storage to local storage
                    lensSessionHolder.resumeSession(account.session);
                }

                LoginModalRef.close();
            } catch (error) {
                // skip if the error is abort error
                if (AbortError.is(error)) return;

                enqueueMessageFromError(error, t`Failed to login.`);
                throw error;
            }
        },
        [profiles, currentProfile],
    );

    useEffect(() => {
        if (!currentProfile) return;
        if (!isSameEthereumAddress(account.address, currentAccount)) LoginModalRef.close();
    }, [currentProfile, account, currentAccount]);

    return (
        <div className="flex flex-col overflow-auto rounded-xl md:max-h-[535px] md:w-[500px]">
            <div className="flex w-full flex-col overflow-auto md:min-h-[300px]">
                {profiles.length ? (
                    <div className="flex flex-grow flex-col gap-4 overflow-auto px-4">
                        <div className="flex flex-col gap-4 overflow-auto rounded-[8px] bg-lightBg px-4 py-6">
                            <div className="text-left text-sm leading-4 text-second">
                                <Trans>Sign the transaction to verify you are the owner of the selected profile.</Trans>
                            </div>
                            <div className="no-scrollbar flex min-h-20 flex-grow flex-col gap-4 overflow-auto">
                                {profiles.map((profile) => (
                                    <ProfileInList
                                        key={profile.profileId}
                                        profile={profile}
                                        selected={isSameProfile(currentProfile, profile)}
                                        onSelect={setSelectedProfile}
                                    />
                                ))}
                            </div>
                        </div>
                        {currentProfile?.signless ||
                        !isSameEthereumAddress(currentProfile?.ownedBy?.address, account.address) ? null : (
                            <div className="flex flex-col gap-2 rounded-[8px] bg-lightBg px-4 py-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold leading-[18px] text-lightMain">
                                        <Trans>Delegate Signing (Recommend)</Trans>
                                    </span>
                                    <Switch checked={signless} onChange={setSignless}>
                                        {({ checked }) => (
                                            <span
                                                className={`${
                                                    checked ? 'bg-fireflyBrand' : 'bg-gray-200 dark:bg-lightBg'
                                                } relative inline-flex h-[22px] w-[43px] items-center rounded-full`}
                                            >
                                                <span className="sr-only">Enable signless</span>
                                                <span
                                                    className={`${
                                                        checked ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                                                />
                                            </span>
                                        )}
                                    </Switch>
                                </div>
                                <div className="text-left text-sm leading-4 text-second">
                                    <Trans>
                                        Allow Lens Manager to perform actions such as posting, liking, and commenting
                                        without the need to sign each transaction.
                                    </Trans>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-[226px] flex-grow flex-col items-center justify-center">
                        <div className="flex h-[178px] flex-col items-center gap-6">
                            <GhostHoleIcon width={148} height={106} className="text-third" />
                            <div className="text-center text-sm font-bold leading-6 text-second">
                                <Trans>
                                    No Lens profile found.
                                    <br />
                                    Please change to another wallet.
                                </Trans>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className="left-0 flex w-full items-center justify-between rounded-b-[8px] bg-lightBottom80 p-4 backdrop-blur"
                    style={{
                        boxShadow: '-1px 0 20px 0 rgba(0, 0, 0, 0.05)',
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
                        <span className="text-sm font-bold leading-[18px] text-second">
                            <Trans>Change Wallet</Trans>
                        </span>
                    </ClickableButton>
                    <ClickableButton
                        disabled={loading || !profiles.length}
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

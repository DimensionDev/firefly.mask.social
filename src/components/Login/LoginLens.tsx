'use client';

import { Switch } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { isSameAddress } from '@masknet/web3-shared-base';
import { first } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { useAsyncFn, useUnmount } from 'react-use';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import WalletIcon from '@/assets/wallet.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { AbortError } from '@/constants/error.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { restoreProfile } from '@/helpers/restoreProfile.js';
import {
    AccountModalRef,
    ConnectWalletModalRef,
    FireflySessionConfirmModalRef,
    LoginModalRef,
} from '@/modals/controls.js';
import { createSessionForProfileIdFirefly } from '@/providers/lens/createSessionForProfileId.js';
import { updateSignless } from '@/providers/lens/updateSignless.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface LoginLensProps {
    profiles: Profile[];
    currentAccount: string;
}

export function LoginLens({ profiles, currentAccount }: LoginLensProps) {
    const [selectedProfile, setSelectedProfile] = useState<Profile>();
    const [signless, setSignless] = useState(false);
    const controllerRef = useRef<AbortController>();

    const account = useAccount();
    const currentProfile = selectedProfile || first(profiles);

    const [{ loading }, login] = useAsyncFn(
        async (signless: boolean) => {
            if (!profiles.length || !currentProfile) return;

            if (!controllerRef.current || controllerRef.current?.signal.aborted) {
                controllerRef.current = new AbortController();

                try {
                    const session = await createSessionForProfileIdFirefly(
                        currentProfile.profileId,
                        controllerRef.current?.signal,
                    );

                    if (!currentProfile.signless && signless) {
                        await updateSignless(true);
                    }

                    // restore profiles for lens
                    restoreProfile(currentProfile, profiles, session);
                    LoginModalRef.close();
                    enqueueSuccessMessage(t`Your Lens account is now connected.`);

                    // restore profiles exclude lens
                    await FireflySessionConfirmModalRef.openAndWaitForClose();
                } catch (error) {
                    enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`), {
                        error,
                    });
                    throw error;
                }
            }
        },
        [profiles, currentProfile],
    );

    useEffect(() => {
        if (!currentProfile) return;
        if (!isSameAddress(account.address, currentAccount)) LoginModalRef.close();
    }, [currentProfile, account, currentAccount]);

    useUnmount(() => {
        controllerRef.current?.abort(new AbortError());
    });

    return (
        <div
            className="flex flex-col overflow-auto rounded-[12px] md:max-h-[535px] md:w-[600px] md:pb-[80px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="hide-scrollbar mb-[50px] flex w-full flex-col gap-4 overflow-auto md:min-h-[300px] md:p-4">
                {profiles.length ? (
                    <>
                        <div className="flex w-full flex-col gap-4 rounded-[8px] bg-lightBg px-4 py-6">
                            <div className="w-full text-left text-[14px] leading-[16px] text-second">
                                <Trans>Sign the transaction to verify you are the owner of the selected profile.</Trans>
                            </div>
                            {profiles.map((profile) => (
                                <ProfileInList
                                    key={profile.profileId}
                                    profile={profile}
                                    isSelected={isSameProfile(currentProfile, profile)}
                                    onSelect={setSelectedProfile}
                                />
                            ))}
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
                    className=" absolute bottom-0 left-0 flex w-full items-center justify-between rounded-b-[8px] bg-lightBottom80 p-4"
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
                        <span className=" text-[14px] font-bold leading-[18px] text-second">
                            <Trans>Change Wallet</Trans>
                        </span>
                    </ClickableButton>
                    <ClickableButton
                        disabled={loading}
                        className=" flex h-10 w-[120px] items-center justify-center gap-2 rounded-[99px] bg-lightMain text-sm font-bold text-primaryBottom disabled:cursor-not-allowed disabled:opacity-50"
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

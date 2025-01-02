'use client';

import { t, Trans } from '@lingui/macro';
import { forwardRef, useState } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/IconButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { Modal } from '@/components/Modal.js';
import type { ThirdPartySource } from '@/constants/enum.js';
import { SORTED_THIRD_PARTY_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { stopEvent } from '@/helpers/stopEvent.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { captureAccountDisconnectEvent } from '@/providers/telemetry/captureAccountEvent.js';
import type { Account } from '@/providers/types/Account.js';
import { removeAccountByProfileId } from '@/services/account.js';

export interface DisconnectFireflyAccountModalProps {
    account: Account;
}

export const DisconnectFireflyAccountModal = forwardRef<SingletonModalRefCreator<DisconnectFireflyAccountModalProps>>(
    function LogoutModal(_, ref) {
        const [props, setProps] = useState<DisconnectFireflyAccountModalProps | void>();
        const account = props?.account;
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => setProps(props),
        });

        const [{ loading }, confirm] = useAsyncFn(async () => {
            try {
                if (!account) return;
                const source = account.profile.profileSource;
                await FireflyEndpointProvider.disconnectAccount({
                    source,
                    id: account.profile.profileId,
                });
                await removeAccountByProfileId(source, account.profile.profileId);
                captureAccountDisconnectEvent(account);
                enqueueSuccessMessage(t`Disconnected from your social graph`);

                dispatch?.close();
            } catch (error) {
                if (error instanceof Error && error.message.includes('Please leave at least 1 account')) {
                    enqueueErrorMessage(
                        t`Failed to disconnect. Please leave at least 1 account or wallet address connected to keep your immersive experience in Firefly.`,
                        { error },
                    );
                } else {
                    enqueueMessageFromError(error, t`Failed to disconnect.`);
                }
                throw error;
            }
        }, [account, dispatch]);

        const isThirdPartyAccount =
            !!account?.profile &&
            SORTED_THIRD_PARTY_SOURCES.includes(account.profile.profileSource as ThirdPartySource);

        return (
            <Modal open={open} onClose={() => dispatch?.close()}>
                <div
                    className="relative w-[320px] max-w-[clamp(386px,90vw,95vw)] rounded-xl bg-bgModal shadow-popover transition-all dark:text-gray-950 md:w-[355px]"
                    onClick={stopEvent}
                >
                    <div className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-t-[12px] p-4">
                        <CloseButton onClick={() => dispatch?.close()} />
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            <Trans>Disconnect</Trans>
                        </div>
                        <div className="relative h-6 w-6" />
                    </div>

                    <div className="flex flex-col gap-2 px-0 !pt-0 pb-6">
                        <div className="flex flex-col gap-2">
                            <div className="px-6 text-medium font-medium leading-normal text-lightMain">
                                {isThirdPartyAccount ? (
                                    <Trans>Confirm to disconnect this account from Firefly’s social graph?</Trans>
                                ) : (
                                    <Trans>
                                        Confirm to disconnect this account and related wallets from Firefly’s social
                                        graph?
                                    </Trans>
                                )}
                            </div>
                            <menu className="flex flex-col gap-3 px-6 pb-3 pt-2">
                                {account ? (
                                    <div className="rounded-lg px-3 py-2 shadow-primary">
                                        <ProfileInList
                                            key={account.profile.profileId}
                                            selected
                                            selectable={false}
                                            profile={account.profile}
                                            profileAvatarProps={{
                                                enableSourceIcon: !isThirdPartyAccount,
                                                enableDefaultAvatar: true,
                                            }}
                                        />
                                    </div>
                                ) : null}
                            </menu>
                        </div>
                        <ClickableButton
                            className={classNames(
                                'mx-6 flex h-10 min-h-10 flex-1 items-center justify-center rounded-full bg-commonDanger py-2 font-bold text-lightBottom',
                            )}
                            disabled={loading}
                            onClick={() => confirm()}
                        >
                            {loading ? (
                                <LoadingIcon width={20} height={20} className="h-5 w-5 shrink-0 animate-spin" />
                            ) : (
                                <Trans>Confirm</Trans>
                            )}
                        </ClickableButton>
                    </div>
                </div>
            </Modal>
        );
    },
);

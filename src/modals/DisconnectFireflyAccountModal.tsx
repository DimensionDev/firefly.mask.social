'use client';

import { t, Trans } from '@lingui/macro';
import React, { forwardRef, useState } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { Modal } from '@/components/Modal.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
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
            onClose: () => setProps(undefined),
        });

        const [{ loading }, confirm] = useAsyncFn(async () => {
            try {
                if (!account) return;
                await FireflyEndpointProvider.disconnectAccount({
                    source: account.profile.source,
                    id: account.profile.profileId,
                });
                await removeAccountByProfileId(account.profile.source, account.profile.profileId);
                captureAccountDisconnectEvent(account);
                enqueueSuccessMessage(t`Disconnected from your social graph`);

                dispatch?.close();
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to disconnect.`), {
                    error,
                });
                throw error;
            }
        }, [dispatch?.close, account]);

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
                                <Trans>
                                    Confirm to disconnect this account and related wallets from Firefly’s social graph?
                                </Trans>
                            </div>
                            <menu className="flex flex-col gap-3 px-6 pb-3 pt-2">
                                {account ? (
                                    <div className="rounded-lg px-3 py-2 shadow-primary">
                                        <ProfileInList
                                            key={account.profile.profileId}
                                            selected
                                            selectable={false}
                                            profile={account.profile}
                                            ProfileAvatarProps={{
                                                enableSourceIcon: true,
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
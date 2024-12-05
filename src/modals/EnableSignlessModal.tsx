import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';
import { useAsyncFn } from 'react-use';
import { polygon } from 'viem/chains';
import { useAccount } from 'wagmi';

import { ChainGuardButton } from '@/components/ChainGuardButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { enqueueErrorsMessage, enqueueInfoMessage } from '@/helpers/enqueueMessage.js';
import { getErrorMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import type { LensSession } from '@/providers/lens/Session.js';
import { updateSignless } from '@/providers/lens/updateSignless.js';
import { useLensStateStore } from '@/store/useProfileStore.js';

export const EnableSignlessModal = forwardRef<SingletonModalRefCreator<void, boolean>>(
    function EnableSignlessModal(_, ref) {
        const account = useAccount();
        const currentProfile = useLensStateStore.use.currentProfile();
        const currentProfileSession = useLensStateStore.use.currentProfileSession();

        const [open, dispatch] = useSingletonModal(ref);

        const [{ loading }, handleUpdateSignless] = useAsyncFn(async () => {
            try {
                if (!currentProfileSession) return;
                if (!isSameEthereumAddress(currentProfile?.ownedBy?.address, account.address)) {
                    enqueueInfoMessage(
                        <div className="w-full text-sm">
                            <div className="break-word font-bold text-white">
                                <Trans>Wrong wallet</Trans>
                            </div>
                            <div className="whitespace-pre-wrap text-sm text-white">
                                <Trans>Please switch to the wallet consistent with this action</Trans>
                            </div>
                        </div>,
                    );
                    return;
                }

                await updateSignless(true, currentProfileSession as LensSession);

                dispatch?.close(true);
            } catch (error) {
                enqueueErrorsMessage(getErrorMessageFromError(error, t`Failed to enable signless`));
                throw error;
            }
        }, [currentProfileSession, currentProfile?.ownedBy?.address, account.address, dispatch?.close]);

        return (
            <Modal open={open} onClose={() => dispatch?.close(false)}>
                <div className="relative w-[355px] max-w-[90vw] rounded-xl bg-primaryBottom shadow-popover transition-all">
                    <div className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-t-[12px] p-4">
                        <CloseButton
                            onClick={() => {
                                dispatch?.close(false);
                            }}
                        />
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            <Trans>Delegate Signing</Trans>
                        </div>
                        <div className="relative h-6 w-6" />
                    </div>

                    <div className="flex flex-col gap-6 p-6">
                        <div className="text-center text-medium leading-[18px]">
                            <Trans>
                                Failed to continue. Please allow Lens Manager for performing actions without the need to
                                sign each transaction.
                            </Trans>
                        </div>

                        <ChainGuardButton targetChainId={polygon.id} loading={loading} onClick={handleUpdateSignless}>
                            <Trans>Sign to enable signless</Trans>
                        </ChainGuardButton>
                    </div>
                </div>
            </Modal>
        );
    },
);

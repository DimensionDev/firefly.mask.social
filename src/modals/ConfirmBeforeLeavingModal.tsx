import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import { isSameOriginUrl } from '@/helpers/isSameOriginUrl.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ConfirmBeforeLeavingModalRef, ConfirmModalRef } from '@/modals/controls.js';

const WHITELIST: Array<string | ((url: string) => boolean)> = [
    (url) => isSameOriginUrl(url, location.origin),
    'https://firefly.mask.social',
];

export type ConfirmBeforeLeavingModalOpenProps = string;

export type ConfirmBeforeLeavingModalCloseProps = boolean;

export const ConfirmBeforeLeavingModal = forwardRef<
    SingletonModalRefCreator<ConfirmBeforeLeavingModalOpenProps, ConfirmBeforeLeavingModalCloseProps>
>(function ConfirmBeforeLeavingModal(_, ref) {
    useSingletonModal(ref, {
        onOpen: async (url) => {
            // urls in the whitelist will not trigger the modal
            if (WHITELIST.some((x) => (typeof x === 'function' ? x(url) : isSameOriginUrl(url, x)))) {
                setTimeout(() => {
                    ConfirmModalRef.close(true);
                    ConfirmBeforeLeavingModalRef.close(true);
                }, 100);
                return
            };

            ConfirmModalRef.open({
                title: t`Leaving Firefly`,
                content: (
                    <div className="text-main">
                        <Trans>
                            Please be cautious when connecting your wallet, as malicious websites may attempt to access
                            your funds.
                        </Trans>
                    </div>
                ),
                onConfirm() {
                    ConfirmModalRef.close(true);
                    ConfirmBeforeLeavingModalRef.close(true);
                },
                onCancel() {
                    ConfirmModalRef.close(false);
                    ConfirmBeforeLeavingModalRef.close(false);
                },
            });
        },
    });

    return null;
});

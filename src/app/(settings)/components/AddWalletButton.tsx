import { Trans } from '@lingui/macro';
import { memo } from 'react';
import { useAsyncFn } from 'react-use';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { AddWalletModalRef } from '@/modals/controls.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface AddWalletButtonProps extends Omit<ClickableButtonProps, 'children'> {
    connections: FireflyWalletConnection[];
    onSuccess?: () => void;
}

export const AddWalletButton = memo<AddWalletButtonProps>(function AddWalletButton({
    disabled = false,
    connections,
    onSuccess,
    ref,
    ...props
}) {
    const [{ loading }, handleAddWallet] = useAsyncFn(async () => {
        await AddWalletModalRef.openAndWaitForClose({
            connections,
        });
    }, [connections]);

    return (
        <ClickableButton
            {...props}
            className="h-10 rounded-2xl bg-lightMain px-[18px] text-medium font-bold leading-10 text-lightBottom dark:text-darkBottom"
            onClick={handleAddWallet}
            disabled={loading || disabled}
        >
            {loading ? <Trans>Adding...</Trans> : <Trans>Add wallet</Trans>}
        </ClickableButton>
    );
});

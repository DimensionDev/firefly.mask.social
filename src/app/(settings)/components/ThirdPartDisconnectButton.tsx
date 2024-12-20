import { useAsyncFn } from 'react-use';

import DisconnectIcon from '@/assets/disconnect.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { DisconnectFireflyAccountModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';

interface Props {
    account: Account;
    onSucceed?: () => void;
}

export function ThirdPartDisconnectButton({ account, onSucceed }: Props) {
    const [{ loading }, handleDisconnect] = useAsyncFn(async () => {
        await DisconnectFireflyAccountModalRef.openAndWaitForClose({
            account,
        });
        onSucceed?.();
    }, [account, onSucceed]);

    if (loading) {
        return <LoadingIcon width={24} height={24} className="animate-spin text-lightMain" />;
    }

    return (
        <ClickableButton className="text-lightMain" disabled={loading} onClick={handleDisconnect}>
            <DisconnectIcon width={24} height={24} />
        </ClickableButton>
    );
}

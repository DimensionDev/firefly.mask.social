import { useAsyncFn } from 'react-use';

import DisconnectIcon from '@/assets/disconnect.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import type { ThirdPartLoginType } from '@/constants/enum.js';
import { NotImplementedError } from '@/constants/error.js';

interface Props {
    platform: ThirdPartLoginType;
}

export function ThirdPartDisconnectButton({ platform }: Props) {
    const [{ loading }, handleDisconnect] = useAsyncFn(async () => {
        throw new NotImplementedError();
    }, [platform]);

    if (loading) {
        return <LoadingIcon width={24} height={24} className="animate-spin text-lightMain" />;
    }

    return (
        <ClickableButton className="text-lightMain" disabled={loading} onClick={handleDisconnect}>
            <DisconnectIcon width={24} height={24} />
        </ClickableButton>
    );
}

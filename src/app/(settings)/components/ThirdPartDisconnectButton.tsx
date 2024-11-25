import { useAsyncFn } from 'react-use';

import DisconnectIcon from '@/assets/disconnect.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import type { ThirdPartySource } from '@/constants/enum.js';
import { NotImplementedError } from '@/constants/error.js';

interface Props {
    source: ThirdPartySource;
}

export function ThirdPartDisconnectButton({ source }: Props) {
    const [{ loading }, handleDisconnect] = useAsyncFn(async () => {
        throw new NotImplementedError();
    }, [source]);

    if (loading) {
        return <LoadingIcon width={24} height={24} className="animate-spin text-lightMain" />;
    }

    return (
        <ClickableButton className="text-lightMain" disabled={loading} onClick={handleDisconnect}>
            <DisconnectIcon width={24} height={24} />
        </ClickableButton>
    );
}

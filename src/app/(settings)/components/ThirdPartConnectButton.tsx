import { Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import type { ThirdPartLoginType } from '@/constants/enum.js';
import { NotImplementedError } from '@/constants/error.js';

interface Props {
    platform: ThirdPartLoginType;
}

export function ThirdPartConnectButton({ platform }: Props) {
    const [{ loading }, handleConnect] = useAsyncFn(async () => {
        throw new NotImplementedError();
    }, [platform]);

    if (loading) {
        return <LoadingIcon width={24} height={24} className="animate-spin text-lightMain" />;
    }

    return (
        <ClickableButton
            className="text-medium font-bold leading-4 text-lightMain"
            disabled={loading}
            onClick={handleConnect}
        >
            <Trans>Connect</Trans>
        </ClickableButton>
    );
}

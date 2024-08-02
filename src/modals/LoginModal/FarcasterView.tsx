import { Trans } from '@lingui/macro';
import { useLocation } from '@tanstack/react-router';

import { LoginFarcaster, type LoginFarcasterProps } from '@/components/Login/LoginFarcaster.js';
import { FarcasterSignType } from '@/constants/enum.js';

export const FarcasterViewBeforeLoad = () => {
    return {
        title: <Title />,
    };
};

function useSignType() {
    const { signType } = useLocation().search as LoginFarcasterProps;
    return signType || FarcasterSignType.RelayService;
}

function Title() {
    const signType = useSignType();
    if (signType === FarcasterSignType.GrantPermission) return <Trans>New connection with Warpcast</Trans>;
    else if (signType === FarcasterSignType.RelayService) return <Trans>Login with Farcaster</Trans>;
    return <Trans>Log in with recovery phrase</Trans>;
}

export function FarcasterView() {
    const signType = useSignType();
    return <LoginFarcaster key={signType} signType={signType} />;
}

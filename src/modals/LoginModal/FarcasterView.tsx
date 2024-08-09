import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useLocation } from '@tanstack/react-router';

import { LoginFarcaster, type LoginFarcasterProps } from '@/components/Login/LoginFarcaster.js';
import { FarcasterSignType } from '@/constants/enum.js';

export const FarcasterViewBeforeLoad = () => {
    return {
        title: <Title />,
    };
};

function useSignType() {
    const { signType, expectedSignType } = useLocation().search as LoginFarcasterProps;
    return signType || expectedSignType || null;
}

function Title() {
    const signType = useSignType();
    if (!signType) return null;

    switch (signType) {
        case FarcasterSignType.GrantPermission:
            return <Trans>New connection with Warpcast</Trans>;
        case FarcasterSignType.RelayService:
            return <Trans>Login with Farcaster</Trans>;
        case FarcasterSignType.RecoveryPhrase:
            return <Trans>Log in with recovery phrase</Trans>;
        default:
            safeUnreachable(signType);
            return null;
    }
}

export function FarcasterView() {
    const signType = useSignType();
    return <LoginFarcaster key={signType} signType={signType} />;
}

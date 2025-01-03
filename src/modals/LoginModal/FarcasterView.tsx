import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useLocation } from '@tanstack/react-router';

import { LoginFarcaster } from '@/components/Login/LoginFarcaster.js';
import { FarcasterSignType } from '@/constants/enum.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export const FarcasterViewBeforeLoad = () => {
    return {
        title: <Title />,
    };
};

function useSignType() {
    const isMedium = useIsMedium();
    const { signType, expectedSignType } = useLocation().search as {
        signType: FarcasterSignType | null;
        expectedSignType?: FarcasterSignType;
    };
    return signType || expectedSignType || (isMedium ? FarcasterSignType.RelayService : null);
}

function Title() {
    const signType = useSignType();
    if (!signType) return null;

    switch (signType) {
        case FarcasterSignType.GrantPermission:
        case FarcasterSignType.FireflySponsorship:
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
    return <LoginFarcaster key={`farcaster_${signType ?? 'unknown'}`} signType={signType} />;
}

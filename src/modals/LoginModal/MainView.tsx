import { Trans } from '@lingui/macro';
import { useRouter } from '@tanstack/react-router';
import { signIn } from 'next-auth/react';
import urlcat from 'urlcat';

import { LoginButton } from '@/components/Login/LoginButton.js';
import { LoginFirefly } from '@/components/Login/LoginFirefly.js';
import { FarcasterSignType, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_AUTH_SOURCES, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';

export function MainView() {
    const router = useRouter();
    const { history } = router;
    const isMedium = useIsMedium();

    const onClick = (source: SocialSource) => {
        const signType = source === Source.Farcaster && isMedium ? FarcasterSignType.RelayService : undefined;
        const path = urlcat('/:source', {
            source: resolveSourceInUrl(source),
            signType: signType || undefined,
        });

        // history.back() is buggy, use .replace() instead.
        history.replace(path);
    };

    const onAuthClick = async (source: Source) => {
        if (source === Source.Telegram) {
            const url = await FireflyEndpointProvider.getTelegramLoginUrl();
            if (!url) return;
            window.location.href = url;
        } else {
            signIn(source);
        }
    };

    return (
        <div className="flex flex-col rounded-[12px] bg-primaryBottom md:w-[500px]">
            <div className="flex w-full flex-col md:gap-3 md:p-6 md:pt-0">
                {isMedium ? (
                    <>
                        <LoginFirefly />
                        <p className="text-center text-xs leading-4 text-second">
                            <Trans>Or login with any social account</Trans>
                        </p>
                    </>
                ) : null}
                <div className="flex w-full flex-col md:flex-row md:gap-5">
                    {SORTED_SOCIAL_SOURCES.map((source) => (
                        <LoginButton key={source} source={source} onClick={() => onClick(source)} />
                    ))}
                    {SORTED_AUTH_SOURCES.map((source) => {
                        return <LoginButton key={source} source={source} onClick={() => onAuthClick(source)} />;
                    })}
                </div>
            </div>
        </div>
    );
}

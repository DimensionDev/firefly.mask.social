import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useRouter } from '@tanstack/react-router';
import { signIn } from 'next-auth/react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { LoginButton } from '@/components/Login/LoginButton.js';
import { LoginFirefly } from '@/components/Login/LoginFirefly.js';
import { FarcasterSignType, type SocialSource, Source, STATUS, type ThirdPartySource } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { SORTED_SOCIAL_SOURCES, SORTED_THIRD_PARTY_SOURCES } from '@/constants/index.js';
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

    const [{ loading }, onAuthClick] = useAsyncFn(async (source: ThirdPartySource) => {
        switch (source) {
            case Source.Telegram:
                const url = await FireflyEndpointProvider.getTelegramLoginUrl();
                if (!url) return;
                window.location.href = url;
                break;
            case Source.Apple:
            case Source.Google:
                await signIn(resolveSourceInUrl(source));
                break;
            default:
                safeUnreachable(source);
        }
    }, []);

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
                    {env.external.NEXT_PUBLIC_THIRD_PARTY_AUTH === STATUS.Enabled
                        ? SORTED_THIRD_PARTY_SOURCES.map((source) => (
                              <LoginButton
                                  key={source}
                                  source={source}
                                  loading={loading}
                                  onClick={() => onAuthClick(source)}
                              />
                          ))
                        : null}
                </div>
            </div>
        </div>
    );
}

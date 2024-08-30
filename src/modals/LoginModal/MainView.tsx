import { Trans } from '@lingui/macro';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { LoginButton } from '@/components/Login/LoginButton.js';
import { LoginFirefly } from '@/components/Login/LoginFirefly.js';
import { FarcasterSignType, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { restoreCurrentAccounts } from '@/helpers/account.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useAbortController } from '@/hooks/useAbortController.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';

export function MainView() {
    const router = useRouter();
    const { history } = router;
    const isMedium = useIsMedium();
    const [selectedSource, setSelectedSource] = useState<SocialSource>();

    const controller = useAbortController();

    const [{ loading }, onClick] = useAsyncFn(async (source: SocialSource) => {
        const fireflySession = fireflySessionHolder.session;
        const signType = source === Source.Farcaster && isMedium ? FarcasterSignType.RelayService : undefined;

        if (fireflySession) {
            setSelectedSource(source);

            try {
                await restoreCurrentAccounts(controller.current.signal);
            } catch (error) {
                // if any error occurs, we will just proceed with the login
            }
        }

        const path = urlcat(
            '/',
            resolveSourceInURL(source),
            signType
                ? {
                      signType,
                  }
                : {},
        );

        // history.back() is buggy, use .replace() instead.
        history.replace(path);
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
                <div className="flex w-full flex-col md:flex-row md:gap-3">
                    {SORTED_SOCIAL_SOURCES.map((source) => (
                        <LoginButton
                            key={source}
                            source={source}
                            loading={loading ? source === selectedSource : false}
                            onClick={() => onClick(source)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

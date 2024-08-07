import { Trans } from '@lingui/macro';
import { useRouter } from '@tanstack/react-router';
import urlcat from 'urlcat';

import { LoginButton } from '@/components/Login/LoginButton.js';
import { LoginFirefly } from '@/components/Login/LoginFirefly.js';
import { FarcasterSignType, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export function MainView() {
    const router = useRouter();
    const { history } = router;
    const isMedium = useIsMedium();

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
                            onClick={() => {
                                const params =
                                    source === Source.Farcaster ? { signType: FarcasterSignType.RelayService } : {};
                                const path = urlcat('/', resolveSourceInURL(source), params);
                                // history.back() is buggy, use .replace() instead.
                                history.replace(path);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

'use client';
import { Trans } from '@lingui/macro';
import { type HTMLProps, memo } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { type LoginFallbackSource, type ProfileSource, Source } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { resolveFallbackImageUrl } from '@/helpers/resolveFallbackImageUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useAsyncStatus } from '@/hooks/useAsyncStatus.js';
import { LoginModalRef } from '@/modals/controls.js';

const resolveConnectButtonClass = createLookupTableResolver<LoginFallbackSource, string>(
    {
        [Source.Lens]:
            'text-lensPrimary ring-lensPrimary hover:bg-[rgba(154,227,42,0.20)] hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]',
        [Source.Farcaster]:
            'text-farcasterPrimary ring-farcasterPrimary hover:bg-fireflyBrand/20 hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]',
        [Source.Twitter]: 'w-[203px] text-main ring-main hover:bg-main/20 hover:shadow-[rgba(101,119,134,0.20)]',
        [Source.Article]:
            'w-[203px] text-[#AD7BFF] ring-[#AD7BFF] shadow-[0_0_16px_0_rgba(101,119,134,0.2)] hover:bg-[#AD7BFF33]/20',
        [Source.DAOs]:
            'w-[203px] text-[#AD7BFF] ring-[#AD7BFF] shadow-[0_0_16px_0_rgba(101,119,134,0.2)] hover:bg-[#AD7BFF33]/20',
        [Source.Polymarket]:
            'w-[203px] text-[#AD7BFF] ring-[#AD7BFF] shadow-[0_0_16px_0_rgba(101,119,134,0.2)] hover:bg-[#AD7BFF33]/20',
    },
    '',
);

interface NotLoginFallbackProps extends HTMLProps<HTMLDivElement> {
    source: LoginFallbackSource;
}

export const NotLoginFallback = memo<NotLoginFallbackProps>(function NotLoginFallback({ source, className }) {
    const fallbackImageUrl = resolveFallbackImageUrl(source);
    const isNotSocialSource = [Source.Article, Source.DAOs, Source.Polymarket].includes(source);

    const asyncStatusTwitter = useAsyncStatus(Source.Twitter);
    const isTwitterConnecting = source === Source.Twitter && asyncStatusTwitter;

    return (
        <div
            className={classNames('flex flex-grow flex-col items-center justify-center space-y-9 pt-[15vh]', className)}
        >
            <Image
                src={fallbackImageUrl}
                width={isNotSocialSource ? 302 : 200}
                height={isNotSocialSource ? 208 : 200}
                alt={`${resolveSourceName(source)} login`}
            />
            <span className="leading-3.5 px-6 text-center text-base text-secondary">
                {isNotSocialSource ? (
                    <Trans>Login to enable all features</Trans>
                ) : (
                    <Trans>You need to connect your {resolveSourceName(source)} account to use this feature.</Trans>
                )}
            </span>
            <ClickableButton
                className={classNames(
                    'rounded-[10px] bg-transparent px-5 py-3.5 text-sm font-bold shadow-sm ring-1 ring-inset',
                    source ? resolveConnectButtonClass(source) : undefined,
                )}
                disabled={isTwitterConnecting}
                onClick={() => {
                    LoginModalRef.open({ source: isNotSocialSource ? undefined : (source as ProfileSource) });
                }}
            >
                {isNotSocialSource ? (
                    <Trans>Login</Trans>
                ) : isTwitterConnecting ? (
                    <Trans>Connecting...</Trans>
                ) : (
                    <Trans>Connect to {resolveSourceName(source)}</Trans>
                )}
            </ClickableButton>
        </div>
    );
});

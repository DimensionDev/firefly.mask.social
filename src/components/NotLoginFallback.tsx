'use client';
import { Trans } from '@lingui/macro';
import { type HTMLProps, memo } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { resolveFallbackImageUrl } from '@/helpers/resolveFallbackImageUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { LoginModalRef } from '@/modals/controls.js';

const resolveConnectButtonClass = createLookupTableResolver<SocialSource | Source.Article | Source.Snapshot, string>(
    {
        [Source.Lens]:
            'text-lensPrimary ring-lensPrimary hover:bg-[rgba(154,227,42,0.20)] hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]',
        [Source.Farcaster]:
            'text-farcasterPrimary ring-farcasterPrimary hover:bg-fireflyBrand/20 hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]',
        [Source.Twitter]: 'w-[203px] text-main ring-main hover:bg-main/20 hover:shadow-[rgba(101,119,134,0.20)]',
        [Source.Article]:
            'w-[203px] text-[#AD7BFF] ring-[#AD7BFF] shadow-[0_0_16px_0_rgba(101,119,134,0.2)] hover:bg-[#AD7BFF33]/20',
        [Source.Snapshot]:
            'w-[203px] text-[#AD7BFF] ring-[#AD7BFF] shadow-[0_0_16px_0_rgba(101,119,134,0.2)] hover:bg-[#AD7BFF33]/20',
    },
    '',
);

interface NotLoginFallbackProps extends HTMLProps<HTMLDivElement> {
    source: SocialSource | Source.Article | Source.Snapshot;
}

export const NotLoginFallback = memo<NotLoginFallbackProps>(function NotLoginFallback({ source, className }) {
    const fallbackImageUrl = resolveFallbackImageUrl(source);
    const isNotSocialMedia = source === Source.Article || source === Source.Snapshot;

    return (
        <div
            className={classNames('flex flex-grow flex-col items-center justify-center space-y-9 pt-[15vh]', className)}
        >
            <Image
                src={fallbackImageUrl}
                width={isNotSocialMedia ? 302 : 200}
                height={isNotSocialMedia ? 208 : 200}
                alt={`${resolveSourceName(source)} login`}
            />
            <span className="leading-3.5 px-6 text-center text-base text-secondary">
                {isNotSocialMedia ? (
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
                onClick={() => {
                    LoginModalRef.open({ source: isNotSocialMedia ? undefined : source });
                }}
            >
                {isNotSocialMedia ? <Trans>Login</Trans> : <Trans>Connect to {resolveSourceName(source)}</Trans>}
            </ClickableButton>
        </div>
    );
});

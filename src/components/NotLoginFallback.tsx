import { t } from '@lingui/macro';
import { memo, useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { LoginModalRef } from '@/modals/controls.js';

interface NotLoginFallbackProps {
    platform: SocialPlatform;
}

export const NotLoginFallback = memo<NotLoginFallbackProps>(function LoginFallback({ platform }) {
    const fallbackUrl = useMemo(() => {
        switch (platform) {
            case SocialPlatform.Lens:
                return '/image/lens-fallback.png';
            case SocialPlatform.Farcaster:
                return '/image/farcaster-fallback.png';
            default:
                return '';
        }
    }, [platform]);

    return (
        <div className="flex h-[calc(100%-66px)] flex-col items-center justify-center space-y-9">
            <Image src={fallbackUrl} width={200} height={200} alt={`${platform} login`} />
            <span className="leading-3.5 text-base text-secondary">
                {t`You need to connect your ${platform} account to use this feature.`}
            </span>
            <button
                type="button"
                className={classNames(
                    'rounded-[10px] bg-transparent px-5 py-3.5 text-sm font-bold shadow-sm ring-1 ring-inset',
                    platform === SocialPlatform.Lens
                        ? 'text-lensPrimary ring-lensPrimary hover:bg-[rgba(154,227,42,0.20)] hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]'
                        : 'text-farcasterPrimary ring-farcasterPrimary hover:bg-[#9250FF]/20 hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]',
                )}
                onClick={() => {
                    LoginModalRef.open();
                }}
            >
                {t`Connect to ${platform}`}
            </button>
        </div>
    );
});

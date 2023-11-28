import { Trans } from '@lingui/react';
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
                <Trans id="Log in to your {platform} profile to enable all features" values={{ platform }} />
            </span>
            <button
                type="button"
                className={classNames(
                    'rounded-[10px] px-5 py-3.5 text-sm font-bold shadow-sm ring-1 ring-inset hover:bg-gray-50',
                    {
                        'text-lensPrimary': platform === SocialPlatform.Lens,
                        'ring-lensPrimary': platform === SocialPlatform.Lens,
                        'text-farcasterPrimary': platform === SocialPlatform.Farcaster,
                        'ring-farcasterPrimary': platform === SocialPlatform.Farcaster,
                    },
                )}
                onClick={() => {
                    LoginModalRef.open({});
                }}
            >
                <Trans id="Connect to {platform}" values={{ platform }} />
            </button>
        </div>
    );
});

import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo, useMemo } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { LoginModalRef } from '@/modals/controls.js';

interface NotLoginFallbackProps {
    source: SocialPlatform;
}

export const NotLoginFallback = memo<NotLoginFallbackProps>(function LoginFallback({ source }) {
    const fallbackUrl = useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                return '/image/lens-fallback.png';
            case SocialPlatform.Farcaster:
                return '/image/farcaster-fallback.png';
            default:
                safeUnreachable(source);
                return '';
        }
    }, [source]);

    return (
        <div className="flex h-[calc(100%-66px)] flex-col items-center justify-center space-y-9">
            <Image src={fallbackUrl} width={200} height={200} alt={`${source} login`} />
            <span className="leading-3.5 text-base text-secondary">
                {t`You need to connect your ${source} account to use this feature.`}
            </span>
            <ClickableButton
                className={classNames(
                    'rounded-[10px] bg-transparent px-5 py-3.5 text-sm font-bold shadow-sm ring-1 ring-inset',
                    source === SocialPlatform.Lens
                        ? 'text-lensPrimary ring-lensPrimary hover:bg-[rgba(154,227,42,0.20)] hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]'
                        : 'text-farcasterPrimary ring-farcasterPrimary hover:bg-[#9250FF]/20 hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]',
                )}
                onClick={async () => {
                    if (source === SocialPlatform.Lens) await getWalletClientRequired();
                    LoginModalRef.open({ source });
                }}
            >
                {t`Connect to ${source}`}
            </ClickableButton>
        </div>
    );
});

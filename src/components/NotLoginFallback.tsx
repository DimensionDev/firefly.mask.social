import { t } from '@lingui/macro';
import { memo } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { config } from '@/configs/wagmiClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { resolveFallbackImageUrl } from '@/helpers/resolveFallbackImageUrl.js';
import { LoginModalRef } from '@/modals/controls.js';

interface NotLoginFallbackProps {
    source: SocialSource;
}

export const NotLoginFallback = memo<NotLoginFallbackProps>(function LoginFallback({ source }) {
    const fallbackUrl = resolveFallbackImageUrl(source);

    return (
        <div className="flex flex-grow flex-col items-center justify-center space-y-9 pt-[15vh]">
            <Image src={fallbackUrl} width={200} height={200} alt={`${source} login`} />
            <span className="leading-3.5 px-6 text-base text-secondary">
                {t`You need to connect your ${source} account to use this feature.`}
            </span>
            <ClickableButton
                className={classNames(
                    'rounded-[10px] bg-transparent px-5 py-3.5 text-sm font-bold shadow-sm ring-1 ring-inset',
                    source === Source.Lens
                        ? 'text-lensPrimary ring-lensPrimary hover:bg-[rgba(154,227,42,0.20)] hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]'
                        : 'text-farcasterPrimary ring-farcasterPrimary hover:bg-[#9250FF]/20 hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]',
                )}
                onClick={async () => {
                    if (source === Source.Lens) await getWalletClientRequired(config);
                    LoginModalRef.open({ source });
                }}
            >
                {t`Connect to ${source}`}
            </ClickableButton>
        </div>
    );
});

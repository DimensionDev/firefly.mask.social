import { t } from '@lingui/macro';
import { createLookupTableResolver } from '@masknet/shared-base';
import { memo } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { config } from '@/configs/wagmiClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { resolveFallbackImageUrl } from '@/helpers/resolveFallbackImageUrl.js';
import { LoginModalRef } from '@/modals/controls.js';

const resolveConnectButtonClass = createLookupTableResolver<SocialSource, string>(
    {
        [Source.Lens]:
            'text-lensPrimary ring-lensPrimary hover:bg-[rgba(154,227,42,0.20)] hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]',
        [Source.Farcaster]:
            'text-farcasterPrimary ring-farcasterPrimary hover:bg-[#9250FF]/20 hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]',
        [Source.Twitter]:
            'text-twitterPrimary ring-twitterPrimary hover:bg-[#1DA1F3]/20 hover:shadow-[0_0_16px_0_rgba(101,119,134,0.20)]',
    },
    '',
);

interface NotLoginFallbackProps {
    source?: SocialSource;
}

export const NotLoginFallback = memo<NotLoginFallbackProps>(function NotLoginFallback({ source }) {
    return (
        <div className="flex flex-grow flex-col items-center justify-center space-y-9 pt-[15vh]">
            {source ? (
                <>
                    <Image src={resolveFallbackImageUrl(source)} width={200} height={200} alt={`${source} login`} />
                    <span className="leading-3.5 px-6 text-base text-secondary">
                        {t`You need to connect your ${source} account to use this feature.`}
                    </span>
                </>
            ) : null}
            <ClickableButton
                className={classNames(
                    'rounded-[10px] bg-transparent px-5 py-3.5 text-sm font-bold shadow-sm ring-1 ring-inset',
                    source ? resolveConnectButtonClass(source) : undefined,
                )}
                onClick={async () => {
                    if (source === Source.Lens) await getWalletClientRequired(config);
                    LoginModalRef.open({ source });
                }}
            >
                {source ? t`Connect to ${source}` : t`Connect`}
            </ClickableButton>
        </div>
    );
});

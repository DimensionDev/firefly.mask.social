'use client';

import { Trans } from '@lingui/macro';

import { CZActivityHomePageButton } from '@/components/ActivityPage/CZ/CZActivityHomePageButton.js';
import { Source } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';

export function CZActivityHomePage() {
    return (
        <div className="flex w-full flex-col items-center space-y-8">
            <Image src="/image/activity/cz/nft.png" width={162} height={162} alt="cz-nft" />
            <div className="flex flex-col space-y-1 text-center leading-[90%]">
                <h3 className="text-xl font-bold">
                    <Trans>Reward for followers</Trans>
                </h3>
                <p className="text-sm font-normal">
                    <Trans>
                        Get a free special edition Firefly NFT for following{' '}
                        <Link className="text-highlight" href={resolveProfileUrl(Source.Twitter, '902926941413453824')}>
                            @cz_binance
                        </Link>{' '}
                        on X to celebrate CZ’s return!
                    </Trans>
                </p>
            </div>
            <div className="flex flex-col space-y-1.5 text-center">
                <CZActivityHomePageButton />
            </div>
        </div>
    );
}

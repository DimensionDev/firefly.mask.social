'use client';

import { Trans } from '@lingui/macro';

import StarPremiumIcon from '@/assets/star-premium.svg';
import { CZActivityHomePageButton } from '@/components/ActivityPage/CZ/CZActivityHomePageButton.js';
import { Source } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';

export function CZActivityHomePage() {
    return (
        <div className="flex w-full flex-1 flex-col items-center justify-center space-y-8 p-6">
            <div className="flex w-full flex-col items-center space-y-8">
                <Image src="/image/activity/cz/nft.png" width={256} height={256} alt="cz-nft" />
                <div className="flex flex-col space-y-1 text-center leading-[90%]">
                    <h3 className="text-xl font-bold">
                        <Trans>Reward for followers</Trans>
                    </h3>
                    <p className="text-sm font-normal">
                        <Trans>
                            Get a free special edition Firefly NFT for following{' '}
                            <Link
                                className="text-highlight"
                                href={resolveProfileUrl(Source.Twitter, '902926941413453824')}
                            >
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

            <div className="rounded-[13px] bg-gradient-to-b from-[#e5dbb9] to-[#181A20] p-[1px]">
                <div className="w-full space-y-4 rounded-[12px] bg-[#181A20] px-6 py-3 text-sm">
                    <h3 className="flex items-center text-sm font-bold leading-[18px]">
                        <StarPremiumIcon width={18} height={18} className="mr-2" />
                        <Trans>Premium Eligibility Criteria</Trans>
                    </h3>
                    <ol className="flex flex-col space-y-3 text-xs">
                        <li>Your X account holds Premium status.</li>
                        <li>Your BNB Chain wallet holds assets worth over $10,000.</li>
                        <li>Your .bnb domain is a member of the SPACE ID Premier Club.</li>
                    </ol>
                    <p className="text-xs font-bold">
                        Event runs from September 29, 2024, 12:00 UTC to October 8, 2024, 23:59 UTC.
                    </p>
                </div>
            </div>
        </div>
    );
}

import { t } from '@lingui/macro';
import type { ReactNode } from 'react';

import FarcasterIcon from '@/assets/farcaster-fill.svg';
import LensIcon from '@/assets/lens-fill.svg';
import StarIcon from '@/assets/star.svg';
import TwitterIcon from '@/assets/x-fill.svg';
import { type FollowingNFT, FollowingNFTSourceType } from '@/providers/types/NFTs.js';

export function NFTFeedFollowSource({ sources }: { sources: FollowingNFT['followingSources'] }) {
    const source = sources[0];
    if (!source) return null;

    return (
        <div className="mb-3 flex items-center text-[15px] leading-6 text-second">
            <StarIcon className="mr-2 h-4 w-4" />
            {[FollowingNFTSourceType.Farcaster, FollowingNFTSourceType.Lens, FollowingNFTSourceType.Twitter].includes(
                source.type,
            ) ? (
                <>
                    {t`Following`}
                    {
                        (
                            {
                                [FollowingNFTSourceType.Lens]: <LensIcon className="mx-2 h-4 w-4" />,
                                [FollowingNFTSourceType.Farcaster]: <FarcasterIcon className="mx-2 h-4 w-4" />,
                                [FollowingNFTSourceType.Twitter]: <TwitterIcon className="mx-2 h-4 w-4" />,
                            } as { [key in FollowingNFTSourceType]?: ReactNode }
                        )[source.type]
                    }
                    {source.handle ? `@${source.handle}` : null}
                </>
            ) : (
                <>{FollowingNFTSourceType.Wallet === source.type ? t`Address on Watching Lists` : null}</>
            )}
        </div>
    );
}

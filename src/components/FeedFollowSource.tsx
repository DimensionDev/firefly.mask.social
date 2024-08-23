import { t } from '@lingui/macro';
import type { ReactNode } from 'react';

import FarcasterIcon from '@/assets/farcaster-fill.svg';
import LensIcon from '@/assets/lens-fill.svg';
import StarIcon from '@/assets/star.svg';
import TwitterIcon from '@/assets/x-fill.svg';
import { type FollowingSource, WatchType } from '@/providers/types/Firefly.js';

export function FeedFollowSource({ source }: { source?: FollowingSource }) {
    if (!source) return null;
    if (![WatchType.Farcaster, WatchType.Lens, WatchType.Twitter, WatchType.Wallet].includes(source.type)) return null;

    const icons: { [key in WatchType]?: ReactNode } = {
        [WatchType.Lens]: <LensIcon className="mx-2 h-4 w-4" />,
        [WatchType.Farcaster]: <FarcasterIcon className="mx-2 h-4 w-4" />,
        [WatchType.Twitter]: <TwitterIcon className="mx-2 h-4 w-4" />,
    };

    return (
        <div className="mb-3 flex items-center text-medium leading-6 text-second">
            <StarIcon className="mr-2 h-4 w-4" />
            {[WatchType.Farcaster, WatchType.Lens, WatchType.Twitter].includes(source.type) ? (
                <>
                    {t`Following`}
                    {icons[source.type]}
                    {source.handle ? `@${source.handle}` : null}
                </>
            ) : (
                <>{WatchType.Wallet === source.type ? t`Address on Watching Lists` : null}</>
            )}
        </div>
    );
}

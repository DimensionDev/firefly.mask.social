import { first } from 'lodash-es';
import { memo } from 'react';
import type { Address } from 'viem';

import PolymarketIcon from '@/assets/polymarket.svg';
import { ActivityCellPolymarketAction } from '@/components/ActivityCell/Polymarket/ActivityCellPolymarketAction.js';
import { Avatar } from '@/components/Avatar.js';
import { FeedFollowSource } from '@/components/FeedFollowSource.js';
import { Image } from '@/components/Image.js';
import { PolymarketActivityRate } from '@/components/Polymarket/PolymarketActivityRate.js';
import { PolymarketActivityResult } from '@/components/Polymarket/PolymarketActivityResult.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { WalletBaseMoreAction } from '@/components/WalletBaseMoreAction.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { formatAmount } from '@/helpers/polymarket.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
import type { PolymarketActivity } from '@/providers/types/Firefly.js';

function floor(num: number | string) {
    return Number.isNaN(+num) ? 0 : Math.floor(+num);
}

interface PolymarketActivityProps {
    activity: PolymarketActivity;
}

export const PolymarketActivityItem = memo<PolymarketActivityProps>(function PolymarketActivityItem({ activity }) {
    const isMyProfile = useIsMyRelatedProfile(Source.Wallet, activity.wallet);

    const addressName = formatAddress(activity.wallet, 4);
    const profileUrl = resolveProfileUrl(Source.Wallet, activity.wallet);

    const isLeft = activity.outcomeIndex === 0;
    const outcome = activity.conditionOutcomes[activity.outcomeIndex] || activity.outcome;

    return (
        <div className="border-b border-line px-4 py-3">
            {activity.followingSources?.length ? <FeedFollowSource source={first(activity.followingSources)} /> : null}
            <div className="flex gap-x-3">
                <div>
                    <Link href={profileUrl}>
                        <Avatar
                            alt={activity.wallet}
                            className="h-10 w-10 rounded-full"
                            src={activity.displayInfo.avatarUrl}
                            size={40}
                        />
                    </Link>
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex items-center gap-x-1 text-medium text-lightSecond">
                        <Link href={profileUrl} className="min-w-0 truncate font-bold text-lightMain">
                            {activity.displayInfo.ensHandle || addressName}
                        </Link>
                        {activity.displayInfo.ensHandle ? (
                            <Link href={profileUrl} className="ml-2">
                                {addressName}
                            </Link>
                        ) : null}
                        {activity.timestamp ? (
                            <span className="whitespace-nowrap pl-1">
                                · <TimestampFormatter time={activity.timestamp * 1000} /> ·
                            </span>
                        ) : null}
                        <PolymarketIcon width={15} height={15} className="mr-auto shrink-0" />
                        {isMyProfile ? null : <WalletBaseMoreAction address={activity.wallet as Address} />}
                    </div>
                    <Link
                        target="_blank"
                        className="mt-1.5 block flex-1"
                        href={`https://polymarket.com/event/${activity.eventSlug}`}
                    >
                        {/* <div className="text-medium leading-6 text-lightMain"> */}
                        {/*     <span className="inline-block rounded-lg border border-lightMain px-2"> */}
                        {/*         {<TypeIcon className="mr-1 inline-block align-baseline" width={12} height={12} />} */}
                        {/*         {typeText} */}
                        {/*     </span> */}
                        {/*     <Trans> */}
                        {/*         <span className="ml-1">worth ${formatAmount(activity.usdcSize)}</span> */}
                        {/*         <span className="ml-1">at Polymarket</span> */}
                        {/*     </Trans> */}
                        {/* </div> */}
                        <ActivityCellPolymarketAction type={activity.side} usdcSize={activity.usdcSize} />
                        <div className="mt-1.5 rounded-xl border border-line bg-lightBg p-3">
                            <div className="flex gap-x-2">
                                <Image
                                    alt={activity.title}
                                    width={24}
                                    height={24}
                                    className="h-6 w-6 shrink-0 rounded-lg"
                                    src={activity.image}
                                />
                                <span className="line-clamp-2 text-sm font-semibold leading-6 text-lightMain">
                                    {activity.title}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-x-1 text-sm font-medium">
                                <span
                                    className={classNames('rounded-lg border px-2 leading-6', {
                                        'border-success text-success': isLeft,
                                        'border-danger text-danger': !isLeft,
                                    })}
                                >
                                    {outcome.toUpperCase()} - {floor(+activity.price * 100)}¢
                                </span>
                                <span className="h-6 rounded-lg bg-lightBottom px-2 leading-6 text-lightMain dark:text-primaryBottom">
                                    ×{floor(formatAmount(activity.size))}
                                </span>
                            </div>
                            {activity.umaResolutionStatus === 'resolved' ? (
                                <PolymarketActivityResult activity={activity} />
                            ) : (
                                <PolymarketActivityRate activity={activity} />
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
});

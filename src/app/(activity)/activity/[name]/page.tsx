'use client';

import { Trans } from '@lingui/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import CalendarIcon from '@/assets/activity-calendar.svg';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import { ActivityFollowTargetCard } from '@/components/Activity/ActivityFollowTargetCard.js';
import { ActivityPremiumConditionList } from '@/components/Activity/ActivityPremiumConditionList.js';
import { ActivityStatusTag } from '@/components/Activity/ActivityStatus.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { ActivityTwitterLoginButton } from '@/components/Activity/ActivityTwitterLoginButton.js';
import { Source } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { ActivityStatus } from '@/providers/types/Firefly.js';
import { getFireflyActivityInfo } from '@/services/getFireflyActivityInfo.js';

export default function Page({
    params: { name },
}: {
    params: {
        name: string;
    };
}) {
    const { data } = useSuspenseQuery({
        queryKey: ['activity-info', name],
        async queryFn() {
            return getFireflyActivityInfo(name);
        },
    });
    const timeTemplate = 'M/DD hh:MM';

    return (
        <main className="flex min-h-[100svh] w-full flex-1 flex-col md:border-r md:border-line md:pl-[289px] lg:w-[888px] lg:max-w-[calc(100%-384px)]">
            <Image
                src={data.banner_url}
                alt={data.title}
                className={classNames('w-full object-cover')}
                width={375}
                height={280}
            />
            <div className="w-full px-6 py-4">
                <div className="w-full space-y-2 border-b border-line pb-4">
                    <div className="flex h-6 items-center space-x-1.5 text-[13px] leading-6">
                        <CalendarIcon className="h-4 w-4 shrink-0" />
                        <span>
                            {dayjs(data.start_time).format(timeTemplate)} - {dayjs(data.end_time).format(timeTemplate)}
                        </span>
                        <ActivityStatusTag status={data.status} />
                    </div>
                    <h1 className="text-xl font-semibold leading-6">{data.title}</h1>
                    <p className="line-clamp-2 text-sm leading-6">{data.sub_title}</p>
                </div>
                <div className="w-full space-y-4 pt-4">
                    <div className="flex w-full flex-col space-y-2">
                        <div className="flex h-8 items-center justify-between">
                            <h2 className="text-base font-semibold leading-6">
                                <Trans>Step 1 Sign in with X</Trans>
                            </h2>
                            <ActivityTwitterLoginButton />
                        </div>
                        <ActivityFollowTargetCard handle="cz_binance" />
                    </div>
                    <ActivityTaskFollowCard handle="Firefly" source={Source.Twitter} profileId="1583361564479889408" />
                    <h2 className="text-base font-semibold leading-6">
                        <Trans>Step 2 Connect Wallet</Trans>
                    </h2>
                    <ActivityConnectCard />
                    <ActivityPremiumConditionList />
                    <div className="w-full rounded-2xl border border-line p-3">
                        <h2 className="mb-2 text-base font-semibold leading-6">
                            <Trans>About Airdrop</Trans>
                        </h2>
                        <ul className="list-decimal pl-4 text-sm font-medium leading-6">
                            <li>
                                <Trans>
                                    Priority Access: Holders get early access to future projects, beta tests, and
                                    airdrops. And they will also have a first look at the latest features and content.
                                </Trans>
                            </li>
                            <li>
                                <Trans>
                                    Core Asset Access: Unlock premium tokens, exclusive NFTs, and nodes for more
                                    investment opportunities.
                                </Trans>
                            </li>
                            <li>
                                <Trans>
                                    Voting Rights: Participate in key decisions and shape the platform’s development
                                    through community governance.
                                </Trans>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="sticky bottom-0 mt-auto w-full border-t border-line bg-primaryBottom px-4 pt-1.5 pb-safe-or-2">
                <button
                    className="leading-12 h-12 w-full rounded-full bg-main text-base font-bold text-primaryBottom disabled:opacity-60"
                    disabled={data.status === ActivityStatus.Ended}
                >
                    {data.status === ActivityStatus.Ended ? <Trans>Ended</Trans> : <Trans>Claim Now</Trans>}
                </button>
            </div>
        </main>
    );
}

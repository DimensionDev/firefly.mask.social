'use client';

import { Trans } from '@lingui/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { notFound } from 'next/navigation.js';

import CalendarIcon from '@/assets/activity-calendar.svg';
import ComeBack from '@/assets/comeback.svg';
import { ActivityClaimButton } from '@/components/Activity/ActivityClaimButton.js';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import { ActivityFollowTargetCard } from '@/components/Activity/ActivityFollowTargetCard.js';
import { ActivityPremiumConditionList } from '@/components/Activity/ActivityPremiumConditionList.js';
import { ActivityStatusTag } from '@/components/Activity/ActivityStatus.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { ActivityTwitterLoginButton } from '@/components/Activity/ActivityTwitterLoginButton.js';
import { NavigationBar } from '@/components/Activity/NavigationBar.js';
import { Image } from '@/components/Image.js';
import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

export default function Page({
    params: { name },
}: {
    params: {
        name: string;
    };
}) {
    const comeback = useComeBack();
    const { data } = useSuspenseQuery({
        queryKey: ['activity-info', name],
        async queryFn() {
            return FireflyActivityProvider.getFireflyActivityInfo(name);
        },
    });
    const timeTemplate = 'M/DD hh:MM';

    if (!data) notFound();

    return (
        <div className="flex min-h-[100svh] w-full flex-1 flex-col">
            {fireflyBridgeProvider.supported ? (
                <NavigationBar>{data.title}</NavigationBar>
            ) : (
                <div className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                    <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                    <TextOverflowTooltip content={data.title}>
                        <h2 className="max-w-[calc(100%-24px-32px)] truncate text-xl font-black leading-6">
                            {data.title}
                        </h2>
                    </TextOverflowTooltip>
                </div>
            )}
            <Image
                src={data.banner_url}
                alt={data.title}
                className={classNames('w-full object-cover')}
                width={343}
                height={140}
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
                        <ActivityFollowTargetCard handle="brian_armstrong" profileId="14379660" />
                    </div>
                    <ActivityTaskFollowCard
                        handle="thefireflyapp"
                        source={Source.Twitter}
                        profileId="1583361564479889408"
                    />
                    <h2 className="text-base font-semibold leading-6">
                        <Trans>Step 2 Connect Wallet</Trans>
                    </h2>
                    <ActivityConnectCard />
                    <ActivityPremiumConditionList />
                </div>
            </div>
            <div className="sticky bottom-0 mt-auto w-full bg-primaryBottom px-4 pt-1.5 pb-safe-or-4 sm:pb-safe-or-2">
                <ActivityClaimButton status={data.status} />
            </div>
        </div>
    );
}

import { Trans } from '@lingui/macro';
import dayjs from 'dayjs';

import CalendarIcon from '@/assets/activity-calendar.svg';
import { ActivityClaimButton } from '@/components/Activity/ActivityClaimButton.js';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import { ActivityDesktopNavigationBar } from '@/components/Activity/ActivityDesktopNavigationBar.js';
import { ActivityFollowTargetCard } from '@/components/Activity/ActivityFollowTargetCard.js';
import { ActivityNavigationBar } from '@/components/Activity/ActivityNavigationBar.js';
import { ActivityPremiumConditionList } from '@/components/Activity/ActivityPremiumConditionList.js';
import { ActivityStatusTag } from '@/components/Activity/ActivityStatus.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { ActivityTwitterLoginButton } from '@/components/Activity/ActivityTwitterLoginButton.js';
import { Image } from '@/components/Image.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

export default async function Page({
    params: { name },
}: {
    params: {
        name: string;
    };
}) {
    const timeTemplate = 'M/DD HH:mm';
    const data = await FireflyActivityProvider.getFireflyActivityInfo(name);

    return (
        <div className="flex min-h-[100svh] w-full flex-1 flex-col">
            {fireflyBridgeProvider.supported ? (
                <ActivityNavigationBar>{data.title}</ActivityNavigationBar>
            ) : (
                <ActivityDesktopNavigationBar>{data.title}</ActivityDesktopNavigationBar>
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
                            {dayjs(data.start_time).utc().format(timeTemplate)} -{' '}
                            {dayjs(data.end_time).utc().format(timeTemplate)} (UTC)
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
                                <Trans>Step 1 Sign in</Trans>
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

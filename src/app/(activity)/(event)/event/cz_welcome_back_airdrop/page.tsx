import dayjs from 'dayjs';

import CalendarIcon from '@/assets/activity-calendar.svg';
import { ActivityDesktopNavigationBar } from '@/components/Activity/ActivityDesktopNavigationBar.js';
import { ActivityNavigationBar } from '@/components/Activity/ActivityNavigationBar.js';
import { ActivityStatusTag } from '@/components/Activity/ActivityStatus.js';
import { Image } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

export default async function Page() {
    const name = 'cz_welcome_back_airdrop';
    const data = await FireflyActivityProvider.getFireflyActivityInfo(name);
    const timeTemplate = 'M/DD HH:mm';

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
            </div>
        </div>
    );
}

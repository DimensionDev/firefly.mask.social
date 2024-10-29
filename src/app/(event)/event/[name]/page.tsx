import { ActivityElex24Provider } from '@/components/Activity/ActivityElex24/ActivityElex24Context.js';
import { ActivityHeader } from '@/components/Activity/ActivityHeader.js';
import { ActivityNavigationBar } from '@/components/Activity/ActivityNavigationBar.js';
import { ActivityTasks } from '@/components/Activity/ActivityTasks/index.js';
import { setupLocaleForSSR } from '@/i18n/index.js';
import { setupLocaleForSSR } from '@/i18n/index.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export default async function Page({
    params: { name },
}: {
    params: {
        name: string;
    };
}) {
    setupLocaleForSSR();
    const data = await FireflyActivityProvider.getFireflyActivityInfo(name);

    return (
        <ActivityElex24Provider>
            <div className="flex min-h-[100svh] w-full flex-1 flex-col">
                <ActivityNavigationBar>{data.title}</ActivityNavigationBar>
                <ActivityHeader data={data} />
                <ActivityTasks data={data} name={name} />
            </div>
        </ActivityElex24Provider>
    );
}

import { ActivityHeader } from '@/components/Activity/ActivityHeader.js';
import { ActivityNavigationBar } from '@/components/Activity/ActivityNavigationBar.js';
import { setupLocaleForSSR } from '@/i18n/index.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export default async function Page() {
    setupLocaleForSSR();
    const name = 'cz_welcome_back_airdrop';
    const data = await FireflyActivityProvider.getFireflyActivityInfo(name);

    return (
        <div className="flex min-h-[100svh] w-full flex-1 flex-col">
            <ActivityNavigationBar />
            <ActivityHeader data={data} />
        </div>
    );
}

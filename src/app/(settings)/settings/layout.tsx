import { SettingList } from '@/app/(settings)/components/SettingList.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { setLocale } from '@/i18n/index.js';

export default function Settings({ children }: { children: React.ReactNode }) {
    setLocale(getLocaleFromCookies());

    return (
        <div className="flex min-h-screen w-full flex-1 pl-72">
            <SettingList />
            {children}
        </div>
    );
}

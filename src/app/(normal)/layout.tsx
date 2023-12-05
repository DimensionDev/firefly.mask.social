import { SearchBar } from '@/components/SearchBar.js';
import { SearchFilter } from '@/components/SearchFilter.js';
import { SocialPlatformTabs } from '@/components/SocialPlatformTabs.js';
import CalendarWidget from '@/mask/widgets/CalendarWidget.js';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <main className="max-w-[888px] flex-1 border-r border-line pl-72">
                <div className="sticky top-0 z-[998] bg-white dark:bg-black">
                    <SearchBar source="header" />
                    <SocialPlatformTabs />
                </div>
                {children}
            </main>
            <aside className=" sticky top-0 z-[998] h-full w-96 px-4 lg:block">
                <SearchBar source="secondary" />

                <SearchFilter />

                <CalendarWidget />
            </aside>
        </>
    );
}

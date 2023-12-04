import { SocialPlatformTabs } from '@/components/SocialPlatformTabs.js';
import { SearchBar } from '@/components/SearchBar.js';
export default function Normal({ children }: { children: React.ReactNode }) {
    return (
        <div className="max-w-[888px] flex-1 border-r border-line pl-72">
            <div className="sticky top-0 z-[998] bg-white dark:bg-black">
                <SearchBar source="header" />
                <SocialPlatformTabs />
            </div>
            {children}
        </div>

    );
}

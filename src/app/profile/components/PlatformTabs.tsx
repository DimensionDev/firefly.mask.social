import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

interface PlatformTabsProps {
    tab: SocialPlatform;
    setTab: (tab: SocialPlatform) => void;
}
export default function PlatformTabs({ tab, setTab }: PlatformTabsProps) {
    return (
        <div className=" flex items-center px-4 py-5">
            {Object.values(SocialPlatform).map((item) => (
                <button
                    key={item}
                    className={classNames(
                        ' h-8 rounded-full px-4 text-sm font-semibold transition-all',
                        tab === item ? 'bg-main text-[#F9F9F9]' : ' text-main',
                    )}
                    onClick={() => setTab(item)}
                >
                    {item}
                </button>
            ))}
        </div>
    );
}

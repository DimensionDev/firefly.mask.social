import { SettingList } from '@/app/(settings)/components/SettingList/index.js';

export default function Settings({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full flex-1 pl-72">
            <SettingList />
            {children}
        </div>
    );
}

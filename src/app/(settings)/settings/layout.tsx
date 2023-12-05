import { SettingList } from '@/app/(settings)/components/SettingList/index.js';

export default function Settings({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-1 w-full pl-72">
            <SettingList />
            {children}
        </div>
    );
}

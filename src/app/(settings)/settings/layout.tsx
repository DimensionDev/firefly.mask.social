import { SettingsList } from '@/app/(settings)/components/SettingsList.js';

export default function Settings({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full flex-1 pl-72">
            <SettingsList />
            {children}
        </div>
    );
}

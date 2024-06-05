import { SettingsList } from '@/app/(settings)/components/SettingsList.js';
import { NavigatorBar } from '@/components/NavigatorBar/index.js';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* desktop */}
            <main className="hidden min-h-screen w-full flex-1 pl-0 md:flex md:pl-[61px] lg:pl-72">
                <SettingsList />
                {children}
            </main>

            {/* mobile */}
            <main className="flex min-h-full w-full flex-grow flex-col md:hidden">
                <NavigatorBar enableSearch={false} enableFixedBack />
                <div className="flex flex-grow flex-col overflow-auto">{children}</div>
            </main>
        </>
    );
}

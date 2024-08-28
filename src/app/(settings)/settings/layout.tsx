import { SettingsList } from '@/app/(settings)/components/SettingsList.js';
import { NavigatorBar } from '@/components/NavigatorBar/index.js';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <main className="flex min-h-full w-full flex-1 flex-col pl-0 md:min-h-screen md:flex-row md:pl-[289px] lg:pl-72">
                {/* /!* desktop *!/ */}
                <div className="flex md:hidden">
                    <NavigatorBar enableSearch={false} enableFixedBack />
                </div>
                {/* /!* mobile *!/ */}
                <div className="hidden md:flex">
                    <SettingsList />
                </div>
                <div className="w-full min-w-0">{children}</div>
            </main>
        </>
    );
}

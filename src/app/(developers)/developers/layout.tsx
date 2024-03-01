import { ToolkitList } from '@/app/(developers)/developers/components/ToolkitList.js';

export default function Developers({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full flex-1 pl-72">
            <ToolkitList />
            {children}
        </div>
    );
}

import NormalLayout from '@/app/(normal)/layout.js';
import { ActivityProvider } from '@/components/Activity/ActivityContext.js';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <NormalLayout modal={<></>}>
            <ActivityProvider>{children}</ActivityProvider>
        </NormalLayout>
    );
}

import NormalLayout from '@/app/(normal)/layout.js';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <NormalLayout modal={<></>}>{children}</NormalLayout>;
}

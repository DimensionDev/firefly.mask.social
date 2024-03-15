import type { ReactNode } from 'react';

export default function NotFoundFallback({ children }: { children: ReactNode }) {
    return <div className="mt-40 px-5 text-center text-2xl font-bold">{children}</div>;
}

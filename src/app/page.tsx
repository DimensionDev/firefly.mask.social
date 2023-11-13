import Loading from '@/app/loading';
import { Posts } from '@/components/Posts/index';
import { Suspense } from 'react';

export default function Home() {
    return (
        <Suspense fallback={<Loading />}>
            <Posts />
        </Suspense>
    );
}

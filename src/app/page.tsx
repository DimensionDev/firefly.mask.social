import Loading from '@/app/loading.js';
import { Suspense } from 'react';

export default function Home() {
    return <Suspense fallback={<Loading />}>{/* <Posts /> */}</Suspense>;
}

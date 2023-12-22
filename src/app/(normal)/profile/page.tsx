'use client';


import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function ProfileHome() {
    const currentSource = useGlobalState.use.currentSource();

    return <NotLoginFallback source={currentSource} />;
}

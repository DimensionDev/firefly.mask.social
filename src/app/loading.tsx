'use client';

import LoadingIcon from '@/assets/loading.svg';

export default function Loading() {
    return (
        <div className="flex min-h-[500px] items-center justify-center w-full">
            <LoadingIcon className="animate-spin" width={24} height={24} />
        </div>
    );
}

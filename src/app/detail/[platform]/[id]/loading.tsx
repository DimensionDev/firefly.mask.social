'use client';
import LoadingIcon from '@/assets/loading.svg';
export default function Loading() {
    return (
        <div className="flex min-h-[500px] items-center justify-center">
            <LoadingIcon className="animate-spin text-main" width={24} height={24} />
        </div>
    );
}

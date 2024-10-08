import { memo } from 'react';

import LoadingIcon from '@/assets/loading.svg';

export const LoadingStatus = memo(function LoadingStatus() {
    return (
        <div className="flex flex-col items-center justify-center p-[2px]">
            <LoadingIcon className="animate-spin" width={24} height={24} />
        </div>
    );
});

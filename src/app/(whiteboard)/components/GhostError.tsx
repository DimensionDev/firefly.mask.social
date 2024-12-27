import { memo } from 'react';

import GhostHoleIcon from '@/assets/ghost.svg';

export const GhostError = memo(function GhostError({ error, fallback }: { error?: Error; fallback: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center">
            <GhostHoleIcon width={200} height={143} className="text-third" />
            <p className="mt-10 text-center text-sm">{error?.message ?? fallback}</p>
        </div>
    );
});

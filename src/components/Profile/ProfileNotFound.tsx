'use client';

import { Trans } from '@lingui/macro';

import GhostHoleIcon from '@/assets/ghost.svg';

export function ProfileNotFound() {
    return (
        <div className="flex h-full flex-col items-center justify-center py-12 text-secondary">
            <GhostHoleIcon width={200} height={143} className="text-third" />
            <div className="mt-3 break-words break-all text-center text-medium font-bold">
                <div className="mt-10">
                    <Trans>Profile could not be found.</Trans>
                </div>
            </div>
        </div>
    );
}

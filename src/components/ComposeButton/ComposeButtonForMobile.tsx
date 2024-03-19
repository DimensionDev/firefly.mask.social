import { PlusIcon } from '@heroicons/react/24/outline';

import { ComposeModalRef } from '@/modals/controls.js';

export function ComposeButtonForMobile() {
    return (
        <button
            className=" r-4 b-4 dark:[#9250FF] fixed z-40 h-16 w-16 rounded-full bg-[#9250FF] text-white dark:bg-white"
            onClick={() => {
                ComposeModalRef.open({
                    type: 'compose',
                });
            }}
        >
            <PlusIcon />
        </button>
    );
}

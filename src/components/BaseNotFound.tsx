import { t } from '@lingui/macro';
import { type HTMLProps, memo } from 'react';

import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';

export const BaseNotFound = memo<HTMLProps<HTMLDivElement>>(function BaseNotFound(props) {
    return (
        <main {...props} className={classNames('flex flex-[1_1_100%] flex-col border-r border-line', props.className)}>
            <div className="flex flex-grow flex-col items-center justify-center">
                <Image src="/image/radar.png" width={200} height={106} alt={t`Page not found. Please try again.`} />
                {props.children}
            </div>
        </main>
    );
});

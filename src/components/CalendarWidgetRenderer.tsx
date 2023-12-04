import { use, useEffect, useRef } from 'react';

import { renderCalendarWidgetTo } from '@/helpers/renderCalendarWidgetTo.js';
import { setupMaskRuntime } from '@/helpers/setupMaskRuntime.js';

const setupPromise = setupMaskRuntime();

export function CalendarWidgetRenderer() {
    use(setupPromise);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        return renderCalendarWidgetTo(ref.current);
    }, []);

    return <div ref={ref} />;
}

import type { MouseEvent } from 'react';

export function stopEvent(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
}

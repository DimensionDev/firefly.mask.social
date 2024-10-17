import type { MouseEvent } from 'react';

export function stopPropagation(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
}

export function stopEvent(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    event.preventDefault();
}

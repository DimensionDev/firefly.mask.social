import { useRef } from 'react';
import { useUnmount } from 'react-use';

import { AbortError } from '@/constants/error.js';

class Controller {
    private controller: AbortController | null = null;

    constructor() {
        this.controller = new AbortController();
    }

    get signal() {
        return this.controller?.signal;
    }

    abort() {
        this.controller?.abort(new AbortError());
    }

    renew() {
        this.controller?.abort();
        this.controller = new AbortController();
    }
}

export function useAbortController() {
    const controllerRef = useRef(new Controller());

    useUnmount(() => {
        controllerRef.current.abort();
    });

    return controllerRef;
}

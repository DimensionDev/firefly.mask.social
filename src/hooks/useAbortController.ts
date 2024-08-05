import { useRef } from 'react';
import { useUnmount } from 'react-use';

import { AbortError } from '@/constants/error.js';

class Controller {
    private controller: AbortController | null = null;

    constructor(public renew: () => void) {
        this.controller = new AbortController();
    }

    get signal() {
        return this.controller?.signal;
    }

    abort() {
        this.controller?.abort(new AbortError());
    }

    static clone(controller: Controller) {
        return new Controller(controller.renew);
    }
}

export function useAbortController() {
    const controllerRef = useRef<Controller>(
        new Controller(() => {
            controllerRef.current.abort();
            controllerRef.current = Controller.clone(controllerRef.current);
        }),
    );

    useUnmount(() => {
        controllerRef.current.abort();
    });

    return controllerRef;
}

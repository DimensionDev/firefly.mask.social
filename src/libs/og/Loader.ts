import type { OpenGraph } from '@/types/og.js';

class Loader {
    async load(content: string): Promise<OpenGraph | null> {
        return null;
    }

    async occupancyLoad(content: string): Promise<OpenGraph | null> {
        return null;
    }
}

export const OpenGraphLoader = new Loader();

import type { Frame } from '@/types/frame.js';

class Loader {
    load(content: string): Promise<Frame[]> {
        throw new Error('To be implemented.');
    }

    linearLoad(content: string): Frame[] {
        throw new Error('To be implemented.');
    }
}

export const FrameLoader = new Loader();

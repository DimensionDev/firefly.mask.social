import { Source } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { type Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function toggleAct(source: Source, postId: string, status: boolean) {
    patchPostQueryData(source, postId, (draft) => {
        draft.hasActed = status;
        if (draft.collectModule) {
            draft.collectModule.collectedCount = draft.collectModule.collectedCount + (status ? 1 : -1);
        }
    });
}

const METHODS_BE_OVERRIDDEN = ['actPost'] as const;

export function SetQueryDataForActPost(source: Source) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (postId: string, ...args: unknown[]) => {
                    toggleAct(source, postId, true);
                    const m = method as (postId: string, ...args: unknown[]) => ReturnType<Provider[K]>;
                    try {
                        const result = await m.call(target.prototype, postId, ...args);

                        return result;
                    } catch (error) {
                        // rolling back
                        toggleAct(source, postId, false);
                        throw error;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}

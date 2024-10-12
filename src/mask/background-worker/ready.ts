import { defer } from '@/helpers/promise.js';

export const [pluginWorkerReadyPromise, setPluginWorkerReady] = defer<void>();

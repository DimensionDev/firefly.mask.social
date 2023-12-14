// eslint-disable-next-line simple-import-sort/imports
import { BackgroundWorker } from './rpc.js';
import { addListener } from './message.js';

import { createKVStorageHost, setupMaskKVStorageBackend } from '@masknet/shared-base';

const inMemoryBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue: BackgroundWorker.memoryRead,
    setValue: BackgroundWorker.memoryWrite,
};
// #region Setup storage
export const inMemoryStorage = createKVStorageHost(inMemoryBackend, {
    on: (callback) => addListener('inMemoryStorage', callback),
});
const idbBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue: BackgroundWorker.indexedDBRead,
    setValue: BackgroundWorker.indexedDBWrite,
};
export const indexedDBStorage = createKVStorageHost(idbBackend, {
    on: (callback) => addListener('indexedDBStorage', callback),
});

setupMaskKVStorageBackend(idbBackend, inMemoryBackend);
// #endregion

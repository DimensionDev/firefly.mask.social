import { parseJSON } from '@masknet/web3-providers/helpers';

const hasOPFS = typeof navigator?.storage?.getDirectory === 'function';
const ls = typeof window === 'undefined' ? undefined : window.localStorage;
const cacheFileName = 'opfs-storage-v1.txt';

type StorageStructure = Record<string, string>;

const getOPFSAccessHandle = async () => {
  if (!hasOPFS) throw new Error('OPFS is not supported');
  const opfsRoot = await navigator.storage.getDirectory();
  const fileHandle = await opfsRoot.getFileHandle(cacheFileName, { create: true });
  return fileHandle
}

const writeToOPFS = async (content: string) => {
  const accessHandle = await getOPFSAccessHandle();

  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(content);
  const writeBuffer = await accessHandle.createWritable();
  await writeBuffer.write(encodedMessage);

  await writeBuffer.close();
}
const readFromOPFS = async () => {
  const accessHandle = await getOPFSAccessHandle();

  const file = await accessHandle.getFile();
  const fileContents = await file.text();
  return fileContents;
}

// Cache private data in OPFS. Such as user token, user info, etc.
export class OPFSStorageProvider {
    static async setItem(key: string, value: string) {
        try {
            const content = await readFromOPFS();
            const data = parseJSON<StorageStructure>(content) ?? {};
            data[key] = value;
            await writeToOPFS(JSON.stringify(data));
        } catch {
            return ls?.setItem(key, value);
        }
    }
    static async getItem(key: string) {
        try {
            const content = await readFromOPFS();
            const data = parseJSON<StorageStructure>(content) ?? {};
            return data[key] ?? null;
        } catch {
            return ls?.getItem(key);
        }
    }
    static async removeItem(key: string) {
        try {
            const content = await readFromOPFS();
            const data = parseJSON<StorageStructure>(content) ?? {};
            delete data[key];
            await writeToOPFS(JSON.stringify(data));
        } catch {
            return ls?.removeItem(key);
        }
    }
    static async clear() {
      try {
          await writeToOPFS('{}');
      } catch {
          return ls?.clear();
      }
    }
  }

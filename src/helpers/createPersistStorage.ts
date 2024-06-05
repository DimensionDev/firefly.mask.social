import localforage from 'localforage';
import { type PersistStorage } from 'zustand/middleware';

export function createPersistStorage<T>(name: string) {
    const storageInstance = localforage.createInstance({
        name,
    });

    const storage: PersistStorage<T> = {
        getItem: (name: string) => {
            return storageInstance.getItem(name);
        },
        setItem: (name: string, value: unknown) => {
            storageInstance.setItem(name, value);
        },
        removeItem: (name: string) => storageInstance.removeItem(name),
    };
    return storage;
}

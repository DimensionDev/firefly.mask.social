import { setupBuildInfo } from '@masknet/flags/build-info';

export async function setupMaskRuntime() {
    await import('@/mask/setup/locale.js');
    await setupBuildInfo();

    await import('@/mask/setup/storage.js');
    await import('@/mask/setup/wallet.js');
}

export async function setupMaskRuntime() {
    await import('@/mask/setup/locale.js');
    await import('@masknet/flags/build-info').then((x) => x.setupBuildInfo());
    await import('@/mask/setup/storage.js');
    await import('@/mask/setup/wallet.js');
    await import('@/mask/plugin-host/enable.js');
}

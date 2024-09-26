export function parseOldSettingsUrl(url: URL) {
    if (!url.pathname.startsWith('/settings/mutes')) return null;
    const [, , id] = url.pathname.split('/');
    if (!id) return null;
    switch (id) {
        case '1':
            return { pathname: `/settings/mutes/farcaster/profile` };
        case '2':
            return { pathname: `/settings/mutes/farcaster/channel` };
        case '3':
            return { pathname: `/settings/mutes/lens/profile` };
        case '4':
            return { pathname: `/settings/mutes/twitter/profile` };
        case '5':
            return { pathname: `/settings/mutes/firefly/wallet` };
        default:
            return null;
    }
}

import { Trans } from '@lingui/macro';

import { Link } from '@/esm/Link.js';

export function ActiveApp() {
    return (
        <Link
            className="block w-full rounded-2xl border border-fireflyBrand p-2 text-center text-xl font-bold text-fireflyBrand dark:bg-fireflyBrand dark:text-white"
            href="https://5euxu.app.link/PHvNiyVemIb"
        >
            <Trans>Open Firefly App</Trans>
        </Link>
    );
}

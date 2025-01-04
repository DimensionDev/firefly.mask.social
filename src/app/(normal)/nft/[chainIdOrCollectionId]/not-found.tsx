import { Trans } from '@lingui/react/macro';

import NotFound from '@/components/NotFound.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default async function CollectionNotFound() {
    await setupLocaleForSSR();

    return <NotFound backText={<Trans>Collectible</Trans>} text={<Trans>Collectible could not be found.</Trans>} />;
}

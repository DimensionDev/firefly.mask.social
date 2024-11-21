import { Trans } from '@lingui/macro';

import NotFound from '@/components/NotFound.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default function CollectionNotFound() {
    setupLocaleForSSR();

    return <NotFound backText={<Trans>Collectible</Trans>} text={<Trans>Collectible could not be found.</Trans>} />;
}

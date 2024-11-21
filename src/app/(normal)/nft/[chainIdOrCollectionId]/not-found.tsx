import { t } from '@lingui/macro';

import NotFound from '@/components/NotFound.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default function CollectionNotFound() {
    setupLocaleForSSR();

    return <NotFound backText={t`Collectible`} text={t`Collectible could not be found.`} />;
}

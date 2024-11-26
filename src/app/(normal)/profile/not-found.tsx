import { Trans } from '@lingui/macro';

import NotFound from '@/components/NotFound.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default function ProfileNotFound() {
    setupLocaleForSSR();

    return <NotFound backText={<Trans>Profile details</Trans>} text={<Trans>Profile could not be found.</Trans>} />;
}

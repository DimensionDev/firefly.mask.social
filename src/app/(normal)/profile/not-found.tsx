import { Trans } from '@lingui/macro';

import NotFound from '@/components/NotFound.js';
import { SearchType } from '@/constants/enum.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default function ProfileNotFound() {
    setupLocaleForSSR();

    return (
        <NotFound
            backText={<Trans>Profile details</Trans>}
            text={<Trans>Profile could not be found.</Trans>}
            search={{ text: <Trans>Search profile</Trans>, searchText: '', searchType: SearchType.Profiles }}
        />
    );
}

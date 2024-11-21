import { t } from '@lingui/macro';

import NotFound from '@/components/NotFound.js';
import { SearchType } from '@/constants/enum.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default function ProfileNotFound() {
    setupLocaleForSSR();

    return (
        <NotFound
            backText={t`Profile details`}
            text={t`Profile could not be found.`}
            search={{ text: t`Search profile`, searchText: '', searchType: SearchType.Profiles }}
        />
    );
}

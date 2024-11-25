import { Trans } from '@lingui/macro';

import NotFound from '@/components/NotFound.js';
import { SearchType } from '@/constants/enum.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default function PostNotFound() {
    setupLocaleForSSR();

    return (
        <NotFound
            backText={<Trans>Post details</Trans>}
            text={<Trans>Post could not be found.</Trans>}
            search={{ text: <Trans>Search post</Trans>, searchText: '', searchType: SearchType.Posts }}
        />
    );
}

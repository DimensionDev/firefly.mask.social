import { Trans } from '@lingui/macro';

import NotFound from '@/components/NotFound.js';
import { SearchType } from '@/constants/enum.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default function ArticleNotFound() {
    setupLocaleForSSR();

    return (
        <NotFound
            backText={<Trans>Article</Trans>}
            text={<Trans>Article could not be found</Trans>}
            search={{ text: <Trans>Search article</Trans>, searchText: '', searchType: SearchType.Posts }}
        />
    );
}

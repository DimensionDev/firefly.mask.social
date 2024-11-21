import { t } from '@lingui/macro';

import NotFound from '@/components/NotFound.js';
import { SearchType } from '@/constants/enum.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default function ArticleNotFound() {
    setupLocaleForSSR();

    return (
        <NotFound
            backText={t`Article`}
            text={t`Article could not be found`}
            search={{ text: t`Search article`, searchText: '', searchType: SearchType.Posts }}
        />
    );
}

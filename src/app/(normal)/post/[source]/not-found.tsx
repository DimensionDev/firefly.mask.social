import { t } from '@lingui/macro';

import NotFound from '@/components/NotFound.js';
import { SearchType } from '@/constants/enum.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default function PostNotFound() {
    setupLocaleForSSR();

    return (
        <NotFound
            backText={t`Post details`}
            text={t`Post could not be found.`}
            search={{ text: t`Search post`, searchText: '', searchType: SearchType.Posts }}
        />
    );
}

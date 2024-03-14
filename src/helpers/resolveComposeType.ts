import { t } from '@lingui/macro';
import { createLookupTableResolver } from '@masknet/shared-base';

export const resolveComposeType = createLookupTableResolver<'compose' | 'quote' | 'reply', string>(
    {
        compose: t`Compose`,
        quote: t`Quote`,
        reply: t`Reply`,
    },
    '',
);

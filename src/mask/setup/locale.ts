import { addSharedI18N } from '@masknet/shared';
import { i18NextInstance } from '@masknet/shared-base';
import { addShareBaseI18N } from '@masknet/shared-base-ui';
import { initReactI18next } from 'react-i18next';

import { addMaskI18N } from '@/maskbook/packages/mask/shared-ui/locales/languages.js';

addMaskI18N(i18NextInstance);
initReactI18next.init(i18NextInstance);
addSharedI18N(i18NextInstance);
addShareBaseI18N(i18NextInstance);

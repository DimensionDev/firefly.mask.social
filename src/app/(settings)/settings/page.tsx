import { redirect } from 'next/navigation.js';
import urlcat from 'urlcat';

import { PageRoutes } from '@/constants/enum.js';

export default async function Setting() {
    redirect(urlcat(PageRoutes.Settings, '/display'));
}

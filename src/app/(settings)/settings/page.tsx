import { redirect } from 'next/navigation.js';
import urlcat from 'urlcat';

import { PageRoutes } from '@/constants/enum.js';

export default async function Settings() {
    redirect(urlcat(PageRoutes.Settings, '/general'));
}

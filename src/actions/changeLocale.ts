'use server';

import { getEnumAsArray } from '@masknet/kit';
import { cookies } from 'next/headers.js';
import { redirect } from 'next/navigation.js';

import { PageRoute } from '@/constants/enum.js';
import { defaultLocale } from '@/i18n/index.js';
import { Locale } from '@/types/index.js';

export async function changeLocale(formData: FormData) {
    const localeValue = formData.get('locale');

    if (!localeValue || typeof localeValue !== 'string') {
        return redirect(PageRoute.Home);
    }

    const isValidLocale = getEnumAsArray(Locale).some(({ value }) => value === localeValue);

    if (isValidLocale) {
        cookies().set('locale', localeValue);
        return redirect(PageRoute.Home);
    } else {
        cookies().set('locale', defaultLocale);
        return redirect(PageRoute.Home);
    }
}

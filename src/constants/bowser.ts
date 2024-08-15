'use client';

import { getNavigatorSafe } from '@/helpers/bom.js';
import { getMobileDevice } from '@/helpers/getMobileDevice.js';

const ua = getNavigatorSafe()?.userAgent

export const IS_SAFARI = !!(ua?.toLowerCase().includes('safari') && !ua?.toLowerCase().includes('chrome'));
export const IS_APPLE = !!ua?.toLowerCase().includes('apple');
export const IS_IOS = !!ua?.match(/(iPhone|iPod|iPad)/);
export const IS_FIREFOX = !!ua?.toLowerCase().includes('firefox');

export const IS_MOBILE_DEVICE = getMobileDevice() !== 'unknown';

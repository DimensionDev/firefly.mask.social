'use client';

import { getMobileDevice } from '@/helpers/getMobileDevice.js';

const ua = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;

export const IS_SAFARI = !!(ua?.toLowerCase().includes('safari') && !ua?.toLowerCase().includes('chrome'));
export const IS_APPLE = !!ua?.toLowerCase().includes('apple');

export const IS_MOBILE_DEVICE = getMobileDevice() !== 'unknown';

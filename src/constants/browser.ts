'use client';
import bowser from 'bowser';

const parser = typeof window !== 'undefined' ? bowser.getParser(window.navigator.userAgent) : undefined;

export const IS_SAFARI = parser?.is('safari');
export const IS_APPLE = parser?.is('apple');

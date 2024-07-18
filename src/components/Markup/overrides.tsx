import type { HTMLProps } from 'react';

export const PlainParagraph = (props: HTMLProps<HTMLParagraphElement>) => props.children;

export function VoidLineBreak() {
  return null
}
